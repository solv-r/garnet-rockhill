import { urls } from "@/lib/config";
export const metadata = { title: "Sectors & Capabilities | Garnet Rockhill Limited", description: "Residential and commercial construction, civil works, roads, real estate, industrial facilities and consultancy.", alternates: { canonical: `${urls.corporate}/sectors` } };
const items: [string, string][] = [
  ["Residential and commercial construction", "Building construction for homes, offices and commercial premises."],
  ["Civil engineering", "General civil works including drainage systems and culverts."],
  ["Roads and infrastructure", "Road construction and rehabilitation and general infrastructure development."],
  ["Real estate development", "Planning and delivery of residential, commercial and mixed-use schemes."],
  ["Industrial facilities", "Infrastructure and industrial facility construction."],
  ["General construction and contracting", "Construction and renovation under general contracts."],
  ["Consultancy", "Strategy, operations, people and change advisory."],
  ["Design–Build", "Integrated design and construction delivery."],
  ["Urban Planning & Design", "Planning and layout design capability."],
];
export default function Sectors() {
  return (<main style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 1.5rem" }}><h1>Sectors &amp; capabilities</h1>
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>{items.map(([t, d]) => <div key={t} style={{ border: "1px solid var(--line)", padding: "1rem", borderRadius: "var(--radius)" }}><h2 style={{ fontSize: "1.1rem" }}>{t}</h2><p>{d}</p></div>)}</div></main>);
}
