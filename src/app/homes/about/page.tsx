import { urls } from "@/lib/config";
import { getContent } from "@/lib/siteContent";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("homes", "/about", { title: "About Rockhill Homes", description: "Rockhill Homes is the real estate brand of Garnet Rockhill Limited." }); }
export default async function About() {
  const t = await getContent("homes", "about");
  return (<main className="section"><div className="container" style={{ maxWidth: 800 }}><h1>About Rockhill Homes</h1>
    <p>Rockhill Homes is the real estate brand of Garnet Rockhill Limited (RC 1431936), a Nigerian company in real estate development, construction and consultancy.</p>
    <p>{t.body}</p><p><a className="btn outline" href={urls.corporate}>Visit the Garnet Rockhill corporate website →</a></p></div></main>);
}
