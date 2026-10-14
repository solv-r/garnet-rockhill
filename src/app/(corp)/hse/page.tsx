import { getContent } from "@/lib/siteContent";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("corporate", "/hse", { title: "Health, Safety & Environment | Garnet Rockhill Limited", description: "Garnet Rockhill's stated commitment to workplace safety, community protection and environmental responsibility." }); }
export default async function HSE() {
  const t = await getContent("corporate", "hse");
  return (<main className="section"><div className="container" style={{ maxWidth: 860 }}><h1>Health, Safety &amp; Environment</h1><p>{t.intro}</p>
    <ul><li>Workplace health and safety for site teams and visitors</li><li>Protection of the communities in which we work</li><li>Environmental responsibility and sustainable operations</li><li>Quality and responsible project execution</li></ul>
    <p className="muted">This page describes company commitments. It does not claim certifications, audited safety statistics or regulatory endorsements.</p></div></main>);
}
