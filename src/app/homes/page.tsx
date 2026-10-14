import { getFeatured, getCounts, searchProperties } from "@/lib/search";
import { PropertyCard } from "./PropertyCard";
import { FeatureHero } from "./FeatureHero";
import { Emphasis } from "@/components/Emphasis";
import { EnquiryForm } from "./EnquiryForm";
import { getContent } from "@/lib/siteContent";
import { publicDb } from "@/lib/supabase";
import { buildMetadata } from "@/lib/seo";
import { getContact, whatsappLink } from "@/lib/config";
import { PH } from "@/lib/placeholders";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/", { title: "Rockhill Homes | Homes, Land and Developments in Nigeria", description: "Browse houses, apartments, land and developments for sale, rent and lease from Rockhill Homes, a division of Garnet Rockhill Limited." }); }
const PAGE_FOR: Record<string, string> = { land: "/land", commercial: "/commercial", estate: "/estates", "off-plan": "/off-plan", "short-let": "/short-lets" };
const PRICES = [1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000, 250_000_000, 500_000_000];
const naira = (n: number) => "₦" + new Intl.NumberFormat("en-NG").format(n);
export default async function HomesHome() {
  const [t, c, featured, counts, latest, { data: locs }, { data: cats }] = await Promise.all([getContent("homes", "home"), getContact("homes"), getFeatured(6), getCounts(), searchProperties({ sort: "newest" }),
    publicDb().from("locations").select("name, slug, kind").in("kind", ["city", "area"]).order("name"), publicDb().from("property_categories").select("slug, name").order("sort_order")]);
  const show = featured.length ? featured : latest.items;
  return (
    <main>
      <section className="hero hero-lg" style={{ backgroundImage: `url(${t.hero_image})` }}><div className="container">
        <span className="eyebrow">Rockhill Homes · by Garnet Rockhill Limited</span>
        <h1><Emphasis text={t.hero_title} /></h1><p className="lead">{t.hero_text}</p>
        <form action="/properties" role="search" className="search-xl" aria-label="Search properties">
          <div className="pills" role="radiogroup" aria-label="I am looking to">
            {[["", "All"], ["sale", "Buy"], ["rent", "Rent"], ["lease", "Lease"]].map(([v, l], i) => <label key={v}><input type="radio" name="tx" value={v} defaultChecked={i === 0} /><span>{l}</span></label>)}
          </div>
          <div className="fields">
            <label>Property type<select name="category"><option value="">Any type</option>{(cats ?? []).map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}</select></label>
            <label>Location<select name="location"><option value="">Anywhere</option>{(locs ?? []).map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}</select></label>
            <label>Bedrooms<select name="beds"><option value="">Any</option>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+</option>)}</select></label>
            <label>Max price<select name="maxPrice"><option value="">Any</option>{PRICES.map((n) => <option key={n} value={n}>{naira(n)}</option>)}</select></label>
            <button type="submit">Search</button>
          </div>
        </form></div>
      </section>

      <section className="section"><div className="container">
        <div className="section-head"><span className="eyebrow">Featured</span><h2>{t.listings_title === "Latest listings" ? "Featured properties" : t.listings_title}</h2><p>Homes, plots and developments selected by our team.</p></div>
        {show.length === 0 ? <div className="empty">{t.empty_text}</div> : <>
          {featured.length > 0 && (show[0] as { is_featured?: boolean }).is_featured && <FeatureHero p={show[0] as never} />}
          {(() => { const rest = featured.length > 0 && (show[0] as { is_featured?: boolean }).is_featured ? show.slice(1) : show; return rest.length > 0 ? <div className="grid">{rest.map((p) => <PropertyCard key={p.id as string} p={p as never} />)}</div> : null; })()}</>}
        {show.length > 0 && <p style={{ marginTop: "1.75rem" }}><a className="btn outline" href="/properties">View all properties</a></p>}
      </div></section>

      <section className="section alt"><div className="container">
        <div className="section-head center"><span className="eyebrow">Categories</span><h2>Browse by property type</h2><p>Whether you want a family home, a plot or a commercial space, start here.</p></div>
        <div className="tiles">{counts.categories.map((k) => <a key={k.slug} className="tile" href={PAGE_FOR[k.slug] ?? `/properties?category=${k.slug}`}><img src={PH.property(k.slug)} alt="" loading="lazy" /><div className="txt"><strong>{k.name}</strong><small>{k.count} {k.count === 1 ? "property" : "properties"}</small></div></a>)}</div>
      </div></section>

      <section className="section"><div className="container">
        <div className="section-head"><span className="eyebrow">Why Rockhill Homes</span><h2>Property from a company that builds</h2></div>
        <div className="numbered">
          <div className="item"><span className="n">01</span><h3>Backed by Garnet Rockhill</h3><p>Rockhill Homes is the property brand of Garnet Rockhill Limited (RC 1431936), a Nigerian real estate development and construction company.</p></div>
          <div className="item"><span className="n">02</span><h3>Clear, honest listings</h3><p>Every listing shows its real status: available, upcoming, reserved, sold or let. Sold and let homes are never shown as available.</p></div>
          <div className="item"><span className="n">03</span><h3>Support at every step</h3><p>Ask a question, request a viewing, call or message us on WhatsApp. We confirm viewings with you personally.</p></div>
        </div></div></section>

      {counts.cities.some((x) => x.count > 0) && <section className="section alt"><div className="container">
        <div className="section-head"><span className="eyebrow">Locations</span><h2>Explore cities</h2></div>
        <div className="tiles">{counts.cities.filter((x) => x.count > 0).map((x) => <a key={x.id} className="tile" href={`/properties?location=${x.slug}`}><img src={PH.heroHomes} alt="" loading="lazy" /><div className="txt"><strong>{x.name}</strong><small>{x.count} {x.count === 1 ? "property" : "properties"}</small></div></a>)}</div>
      </div></section>}

      <section className="section"><div className="container enquiry-band">
        <div><span className="eyebrow">Get in touch</span><h2 style={{ marginTop: ".4rem" }}>Tell us what you are looking for</h2><p className="muted">Share a few details and our team will respond. You can also call or message us directly.</p>
          <p><a href={`tel:${c.phone}`}>{c.phone}</a><br /><a href={`mailto:${c.email}`}>{c.email}</a></p><p><a className="btn outline" href={whatsappLink(c.whatsapp_message, c.whatsapp)}>Chat on WhatsApp</a></p></div>
        <div className="panel"><EnquiryForm kind="general" showViewing /></div>
      </div></section>
    </main>
  );
}
