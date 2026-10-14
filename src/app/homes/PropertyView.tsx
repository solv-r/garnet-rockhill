import { formatPrice } from "@/lib/format";
import { urls, whatsappLink, getContact } from "@/lib/config";
import { publicUrl, thumb } from "@/lib/media";
import { PH } from "@/lib/placeholders";
import { EnquiryForm } from "./EnquiryForm";
import { PropertyCard } from "./PropertyCard";
import { publicDb } from "@/lib/supabase";
const STATUS: Record<string, string> = { available: "Available", upcoming: "Upcoming development (not yet ready)", reserved: "Reserved", sold: "Sold", rented: "Rented", leased: "Leased", withdrawn: "No longer available" };

export async function PropertyView({ p, preview = false }: { p: any; preview?: boolean }) { // eslint-disable-line
  const c = await getContact("homes");
  const images = [...(p.images ?? [])].sort((a: any, b: any) => (a.id === p.cover_image_id ? -1 : b.id === p.cover_image_id ? 1 : a.sort_order - b.sort_order)); // eslint-disable-line
  const unavailable = ["sold", "rented", "leased", "withdrawn"].includes(p.status);
  const facts: [string, string | number][] = [];
  if (p.category.uses_bedrooms && p.bedrooms != null) facts.push(["Bedrooms", p.bedrooms]);
  if (p.category.uses_bedrooms && p.bathrooms != null) facts.push(["Bathrooms", p.bathrooms]);
  if (p.parking != null) facts.push(["Parking", p.parking]);
  if (p.plot_size_sqm != null) facts.push(["Plot size", `${p.plot_size_sqm} sqm`]);
  if (p.building_area_sqm != null) facts.push(["Building area", `${p.building_area_sqm} sqm`]);
  if (p.furnishing) facts.push(["Furnishing", String(p.furnishing).replace("_", " ")]);
  if (p.category.slug === "short-let" && p.max_guests) facts.push(["Sleeps", p.max_guests]);
  if (p.development_status) facts.push(["Development status", p.development_status]);
  if (p.expected_completion) facts.push(["Expected completion", p.expected_completion]);
  const msg = `Hello Rockhill Homes, I am interested in ${p.title} (Ref ${p.reference}).`;
  const jsonLd = { "@context": "https://schema.org", "@type": "RealEstateListing", name: p.title, url: `${urls.homes}/properties/${p.slug}`, description: p.description ?? undefined };
  const { data: related } = await publicDb().from("properties").select("id, reference, slug, title, transaction, status, price, price_period, currency, bedrooms, bathrooms, plot_size_sqm, location:locations(name), category:property_categories(slug), cover:property_images!fk_cover(storage_path, alt_text)")
    .eq("publish", "published").in("status", ["available", "upcoming"]).eq("location_id", p.location_id).neq("id", p.id).limit(3);
  return (
    <main className="section"><div className="container">
      {preview && <p role="status" className="alert" style={{ marginBottom: "1rem" }}><strong>Preview.</strong> This is how the page will look. Status: <strong>{p.publish}</strong>. Enquiry forms are switched off in preview.</p>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="muted"><a href="/properties">Properties</a> / {p.title}</nav>
      {unavailable && <p role="status" className="alert" style={{ margin: "1rem 0" }}><strong>{STATUS[p.status]}.</strong> This property is not currently available. <a href="/properties">See available properties</a>.</p>}
      <section aria-label="Photo gallery" className="gallery" style={{ margin: "1rem 0" }}>
        {images.length ? images.slice(0, 5).map((im: any, i: number) => ( // eslint-disable-line
          <a key={im.id} href={publicUrl("property-images", im.storage_path)}><img src={publicUrl("property-images", i === 0 ? im.storage_path : thumb(im.storage_path))} alt={im.alt_text ?? `${p.title}, photo ${i + 1}`} loading={i ? "lazy" : "eager"} /></a>
        )) : <><a href="#enquire" style={{ gridRow: "span 2" }}><img src={PH.property(p.category.slug)} alt="Placeholder illustration: photos coming soon" /></a></>}
      </section>
      {images.length > 5 && <p className="muted">Showing 5 of {images.length} photos. <a href={publicUrl("property-images", images[5].storage_path)}>See more</a></p>}
      <div className="split">
        <div>
          <span className={`badge ${p.status}`}>{STATUS[p.status]}</span> <span className="badge">{p.category.name}</span>
          <h1 style={{ marginTop: ".75rem" }}>{p.title}</h1>
          <p className="price" style={{ fontSize: "1.6rem" }}>{formatPrice(p.price, p.currency, p.price_period)}</p>
          <p>{p.location?.name}{p.location?.parent?.name ? `, ${p.location.parent.name}` : ""} <small className="muted">(approximate area; exact address shared on enquiry) · Ref {p.reference}</small></p>
          {facts.length > 0 && <dl className="dl">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
          {p.description && <section><h2>About this property</h2><p style={{ whiteSpace: "pre-line" }}>{p.description}</p></section>}
          {p.property_features?.length > 0 && <section><h2>Features</h2><ul style={{ columns: 2 }}>{p.property_features.map((f: any) => <li key={f.feature.name}>{f.feature.name}</li>)}</ul></section>}
          {p.location?.public_lat != null && <p><a href="/map">See the general area on the map</a></p>}
          <p className="muted" style={{ fontSize: ".85rem" }}>Details and availability must be verified with Rockhill Homes. This listing does not establish ownership, valid title, planning approval or legal suitability. <a href="/disclaimer">Read the full disclaimer</a>.</p>
        </div>
        <aside id="enquire" className="panel sticky-aside">
          {!unavailable ? <><h2 style={{ marginTop: 0, fontSize: "1.3rem" }}>Request a viewing</h2><p className="muted">A request is not a confirmed appointment until we confirm it with you.</p>{preview ? <p className="alert">The viewing form appears here on the live page.</p> : <EnquiryForm kind="viewing" propertyRef={p.reference} showViewing />}</> : <h2 style={{ marginTop: 0, fontSize: "1.3rem" }}>Interested in similar homes?</h2>}
          <p style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}><a className="btn outline" href={whatsappLink(msg, c.whatsapp)}>WhatsApp</a><a className="btn outline" href={`tel:${c.phone}`}>Call</a></p>
        </aside>
      </div>
      {(related ?? []).length > 0 && <section><h2>More in {p.location?.name}</h2><div className="grid">{(related ?? []).map((r: any) => <PropertyCard key={r.id} p={r} />)}</div></section>}{/* eslint-disable-line */}
    </div></main>
  );
}
