import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { services } from "@/lib/corporate-content";
import { getContent } from "@/lib/siteContent";
import { urls } from "@/lib/config";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug; const s = services.find((x) => x.slug === slug); if (!s) return {};
  return { title: `${s.title} | Garnet Rockhill Limited`, description: s.summary, alternates: { canonical: `${urls.corporate}/services/${s.slug}` } };
}
export default async function Service({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug; const s = services.find((x) => x.slug === slug); if (!s) notFound();
  const imgs = await getContent("corporate", "service_images");
  return (<main><section className="hero" style={{ backgroundImage: `url(${imgs[s.slug]})` }}><div className="container"><p><a href="/services" style={{ color: "#fff" }}>← All services</a></p><h1>{s.title}</h1><p className="lead">{s.intro}</p></div></section>
    <section className="section"><div className="container split"><div><h2 style={{ marginTop: 0 }}>Capabilities</h2><ul>{s.capabilities.map((c) => <li key={c}>{c}</li>)}</ul>{s.note && <p className="alert">{s.note}</p>}</div>
      <aside className="panel"><h3 style={{ marginTop: 0 }}>Discuss your project</h3><p>Tell us about your requirements and we will respond to your enquiry.</p><a className="btn" href="/contact">Make an enquiry</a></aside></div></section></main>);
}
