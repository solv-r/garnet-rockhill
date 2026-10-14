import Client from "./Client";
import { buildMetadata } from "@/lib/seo";
export async function generateMetadata() { return buildMetadata("homes", "/map", { title: "Property Map | Rockhill Homes", description: "Browse Rockhill Homes properties by neighbourhood on a map." }); }
export const dynamic = "force-dynamic";
export default function MapPage() {
  // Free vector tiles from OpenFreeMap (no API key). Replace MAP_STYLE_URL to use another MapLibre-compatible style. See docs/COSTS.md.
  const styleUrl = process.env.MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/liberty";
  return (<main className="section"><div className="container"><h1>Explore on the map</h1><Client styleUrl={styleUrl} /></div></main>);
}
