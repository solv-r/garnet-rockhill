import { services } from "@/lib/corporate-content";
import { getContent } from "@/lib/siteContent";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("corporate", "/services", { title: "Services | Garnet Rockhill Limited", description: "Construction, real estate development, consultancy, design–build and urban planning services from Garnet Rockhill Limited." }); }
export default async function Services() {
  const imgs = await getContent("corporate", "service_images");
  return (<main className="section"><div className="container"><h1>Our services</h1><div className="grid services-grid">
    {services.map((s) => <a key={s.slug} className="card" href={`/services/${s.slug}`}><div className="media"><img src={imgs[s.slug]} alt="" loading="lazy" /></div><div className="body"><h2 style={{ fontSize: "1.2rem", margin: 0 }}>{s.title}</h2><p>{s.summary}</p><span className="more">{s.action} →</span></div></a>)}</div></div></main>);
}
