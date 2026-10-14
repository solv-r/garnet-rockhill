import { urls, getContact, whatsappLink } from "@/lib/config";
import { services, values, mission, pillars, company, enquiryCategories } from "@/lib/corporate-content";
import { publicDb } from "@/lib/supabase";
import { getContent } from "@/lib/siteContent";
import { buildMetadata } from "@/lib/seo";
import { publicUrl, thumb } from "@/lib/media";
import { PH } from "@/lib/placeholders";
import { EnquiryForm } from "@/app/homes/EnquiryForm";
import { Emphasis } from "@/components/Emphasis";
import { NamedIcon } from "@/components/Icons";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("corporate", "/", { title: "Garnet Rockhill Limited | Construction, Real Estate Development & Consultancy in Nigeria", description: "Garnet Rockhill Limited is a Nigerian general contracting, construction, real estate development and consultancy company based in Abuja." }); }
export default async function Home() {
  const [t, imgs, c, { data: projects }, { data: news }] = await Promise.all([getContent("corporate", "home"), getContent("corporate", "service_images"), getContact("corporate"),
    publicDb().from("projects").select("slug, title, location_text, category, status, project_images(storage_path, sort_order)").eq("publish", "published").eq("verified", true).order("created_at", { ascending: false }).limit(3),
    publicDb().from("articles").select("slug, title, excerpt, category, published_at, cover_path").eq("publish", "published").order("published_at", { ascending: false }).limit(3)]);
  return (<main>
    <section className="hero hero-lg" style={{ backgroundImage: `url(${t.hero_image})` }}><div className="container hero-rise">
      <span className="eyebrow hero-trust">Incorporated {company.year} · {company.rc} · Abuja, Nigeria</span>
      <h1><Emphasis text={t.hero_title} /></h1><p className="lead">{t.hero_text}</p>
      <div className="actions"><a className="btn light" href="/contact">{t.cta_text}</a><a className="btn ghost" href="/services">Our services →</a><a className="btn ghost" href={urls.homes}>Browse properties →</a></div>
      <p className="hero-contact"><a href={`tel:${c.phone}`}>Call {c.phone}</a><a href={`mailto:${c.email}`}>{c.email}</a></p></div>
      <a className="scroll-cue" href="#services" aria-label="Scroll to our services"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></a>
    </section>

    <section id="services" className="section"><div className="container"><div className="section-head"><span className="eyebrow">Services</span><h2>{t.services_title}</h2><p>Construction, development, consultancy, design–build and planning from one company.</p></div>
      <div className="grid services-grid">{services.map((s) => <a key={s.slug} className="card" href={`/services/${s.slug}`}>
        <div className="media"><img src={imgs[s.slug]} alt="" loading="lazy" /></div><div className="body"><h3>{s.title}</h3><p className="muted">{s.summary}</p><span className="more">{s.action} →</span></div></a>)}</div></div></section>

    <section className="section alt"><div className="container manifesto">
      <div><span className="eyebrow">Our mission</span><blockquote>{mission}</blockquote><a className="btn outline" href="/about">About Garnet Rockhill</a></div>
      <div className="photo"><img src={t.manifesto_image} alt="" loading="lazy" /></div>
    </div></section>

    <section className="section"><div className="container"><div className="section-head"><span className="eyebrow">How we work</span><h2>Our commitments</h2><p>The principles stated in our company profile, applied on every project.</p></div>
      <div className="pillars">{pillars.map((p) => <div className="pillar" key={p.title}><NamedIcon name={p.icon} large /><h3>{p.title}</h3><ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul></div>)}</div>
      <h3 style={{ margin: "3rem 0 1rem" }}>Our values</h3>
      <div className="values">{values.map(([v, d]) => <div className="panel value-card" key={v}><h3 style={{ margin: 0 }}><NamedIcon name={v} />{v}</h3><p className="muted" style={{ marginBottom: 0 }}>{d}</p></div>)}</div></div></section>

    <section className="section alt"><div className="container"><div className="section-head"><span className="eyebrow">Portfolio</span><h2>Projects</h2></div>
      {(projects ?? []).length === 0 ? <div className="empty">Our project portfolio is being prepared with verified projects. <a href="/contact">Contact us</a> to discuss your requirements.</div> :
        <><ol className="idx">{(projects ?? []).map((p: any, i: number) => <li key={p.slug}><a className="idx-row" href={`/projects/${p.slug}`}> {/* eslint-disable-line */}
          <span className="idx-n">{String(i + 1).padStart(2, "0")}</span><span><span className="idx-title">{p.title}</span><span className="idx-meta">{[p.category, p.location_text, p.status].filter(Boolean).join(" · ")}</span></span><span className="idx-go" aria-hidden="true">→</span>
          <img className="idx-thumb" src={p.project_images?.[0] ? publicUrl("site-media", thumb(p.project_images[0].storage_path)) : PH.project} alt="" loading="lazy" /></a></li>)}</ol>
        <p style={{ marginTop: "1.5rem" }}><a className="btn outline" href="/projects">All projects</a></p></>}
    </div></section>

    <section className="section cta-band" style={{ backgroundImage: "linear-gradient(90deg,rgba(8,14,18,.9),rgba(8,56,72,.85))" }}><div className="container" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
      <div><span className="eyebrow" style={{ color: "#f0d79a" }}>Rockhill Homes</span><h2 style={{ margin: ".3rem 0" }}>{t.homes_title}</h2><p style={{ margin: 0 }}>{t.homes_text}</p></div><a className="btn light" href={urls.homes}>Visit Rockhill Homes →</a></div></section>

    {(news ?? []).length > 0 && <section className="section"><div className="container"><div className="section-head"><span className="eyebrow">News</span><h2>News &amp; insights</h2></div>
      <div className="grid">{(news ?? []).map((a) => <a key={a.slug} className="card" href={`/news/${a.slug}`}><div className="media"><img src={a.cover_path ? publicUrl("site-media", thumb(a.cover_path)) : PH.news} alt="" loading="lazy" /></div>
        <div className="body"><span className="badge">{a.category ?? "News"}</span><h3 style={{ margin: ".4rem 0" }}>{a.title}</h3><p className="muted">{a.published_at && new Date(a.published_at).toLocaleDateString("en-NG", { dateStyle: "long" })}</p></div></a>)}</div></div></section>}

    <section className="section alt"><div className="container enquiry-band">
      <div><span className="eyebrow">Business enquiries</span><h2 style={{ marginTop: ".4rem" }}>Discuss your project with us</h2><p className="muted">Tell us about your requirements and we will respond to your enquiry.</p>
        <p><a href={`tel:${c.phone}`}>{c.phone}</a><br /><a href={`mailto:${c.email}`}>{c.email}</a></p><p><a className="btn outline" href={whatsappLink(c.whatsapp_message, c.whatsapp)}>Chat on WhatsApp</a></p></div>
      <div className="panel"><EnquiryForm kind="business" site="corporate" categories={enquiryCategories} /></div></div></section>
  </main>);
}
