import { urls } from "@/lib/config";
import { buildMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildMetadata("corporate", "/rockhill-homes", { title: "Rockhill Homes | Garnet Rockhill Limited", description: "Rockhill Homes is the property brand of Garnet Rockhill Limited." }); }
export default function Gateway() {
  return (<main className="section"><div className="container" style={{ maxWidth: 800 }}><img src="/brand/rockhill-homes.png" alt="Rockhill Homes by Garnet Rockhill Limited" width={280} />
    <h1>Rockhill Homes</h1><p>Rockhill Homes is the real estate brand of Garnet Rockhill Limited, presenting homes, land and developments for sale, rent and lease.</p>
    <a className="btn" href={urls.homes}>Go to Rockhill Homes →</a></div></main>);
}
