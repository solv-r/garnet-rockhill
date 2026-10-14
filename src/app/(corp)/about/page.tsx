import { company, mission, vision, values } from "@/lib/corporate-content";
import { getContent } from "@/lib/siteContent";
import { NamedIcon } from "@/components/Icons";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("corporate", "/about", { title: "About Garnet Rockhill Limited", description: "Company background, mission, vision and core values of Garnet Rockhill Limited, Abuja." }); }
export default async function About() {
  const t = await getContent("corporate", "about");
  return (<main className="section"><div className="container" style={{ maxWidth: 900 }}>
    <h1>About Garnet Rockhill Limited</h1>
    <p>{company.name} is a Nigerian company incorporated on {company.incorporated} ({company.rc}). It operates across real estate development, general contracting, construction, consultancy, design–build, and urban planning and design.</p>
    <h2>Mission</h2><p>{mission}</p><h2>Vision</h2><p>{vision}</p>
    <h2>Core values</h2><div className="values">{values.map(([v, d]) => <div className="panel value-card" key={v}><h3 style={{ margin: 0 }}><NamedIcon name={v} />{v}</h3><p className="muted" style={{ marginBottom: 0 }}>{d}</p></div>)}</div>
    <h2>How we work</h2><p>{t.approach}</p></div></main>);
}
