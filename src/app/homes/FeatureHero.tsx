import { formatPrice } from "@/lib/format";
import { publicUrl } from "@/lib/media";
import { PH } from "@/lib/placeholders";
import { Bed, Bath, Area, Pin } from "@/components/Icons";
type P = { slug: string; title: string; reference: string; status: string; price: number | null; price_period: string | null; currency: string; bedrooms: number | null; bathrooms: number | null; plot_size_sqm?: number | null;
  location: { name: string } | null; category?: { slug: string; name?: string } | null; cover: { storage_path: string; alt_text: string | null } | null };
/** Large editorial layout for the first featured listing (same data and link as the normal card). */
export function FeatureHero({ p }: { p: P }) {
  const img = p.cover ? publicUrl("property-images", p.cover.storage_path) : PH.property(p.category?.slug);
  return (
    <a className="feature-hero" href={`/properties/${p.slug}`}>
      <div className="photo"><img src={img} alt={p.cover?.alt_text ?? (p.cover ? p.title : "")} loading="lazy" /></div>
      <div className="text">
        <div><span className="ribbon gold">Featured</span></div>
        <h3>{p.title}</h3>
        <div className="price">{formatPrice(p.price, p.currency, p.price_period)}</div>
        <div className="where" style={{ display: "flex", gap: ".35rem", alignItems: "center", color: "var(--muted)" }}><Pin />{p.location?.name ?? "Location on request"}{p.category?.name ? ` · ${p.category.name}` : ""}</div>
        <div className="meta" style={{ border: 0, paddingTop: 0 }}>{p.bedrooms != null && <span><Bed />{p.bedrooms} bed</span>}{p.bathrooms != null && <span><Bath />{p.bathrooms} bath</span>}{p.plot_size_sqm ? <span><Area />{Number(p.plot_size_sqm)} sqm</span> : null}<span className="muted">Ref {p.reference}</span></div>
        <div style={{ marginTop: ".6rem" }}><span className="btn">View this property</span></div>
      </div>
    </a>
  );
}
