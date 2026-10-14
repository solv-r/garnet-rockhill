import { formatPrice } from "@/lib/format";
import { publicUrl, thumb } from "@/lib/media";
import { PH } from "@/lib/placeholders";
import { Bed, Bath, Area, Pin } from "@/components/Icons";
type P = { slug: string; title: string; reference: string; status: string; transaction: string; price: number | null; price_period: string | null; currency: string; is_featured?: boolean;
  bedrooms: number | null; bathrooms: number | null; plot_size_sqm?: number | null; location: { name: string } | null; category?: { slug: string; name?: string } | null; cover: { storage_path: string; alt_text: string | null } | null };
const STATUS: Record<string, [string, string]> = { available: ["Available", ""], upcoming: ["Upcoming", "amber"], reserved: ["Reserved", "grey"], sold: ["Sold", "grey"], rented: ["Rented", "grey"], leased: ["Leased", "grey"] };
const TX: Record<string, string> = { sale: "For sale", rent: "For rent", lease: "For lease", off_plan_enquiry: "Off-plan" };
export function PropertyCard({ p }: { p: P }) {
  const img = p.cover ? publicUrl("property-images", thumb(p.cover.storage_path)) : PH.property(p.category?.slug);
  const [st, cls] = STATUS[p.status] ?? [p.status, "grey"];
  return (
    <a className="card property" href={`/properties/${p.slug}`}>
      <div className="media"><img src={img} alt={p.cover?.alt_text ?? (p.cover ? p.title : "")} loading="lazy" />
        <div className="ribbons">{p.is_featured && <span className="ribbon gold">Featured</span>}<span className={`ribbon ${cls}`}>{TX[p.transaction] && p.status === "available" ? TX[p.transaction] : st}</span></div>
        <div className="pricetag">{formatPrice(p.price, p.currency, p.price_period)}</div></div>
      <div className="body">
        <h3>{p.title}</h3>
        <div className="where"><Pin />{p.location?.name ?? "Location on request"}{p.category?.name ? ` · ${p.category.name}` : ""}</div>
        <div className="meta">{p.bedrooms != null && <span><Bed />{p.bedrooms} bed</span>}{p.bathrooms != null && <span><Bath />{p.bathrooms} bath</span>}{p.plot_size_sqm ? <span><Area />{Number(p.plot_size_sqm)} sqm</span> : null}<span className="muted" style={{ marginLeft: "auto" }}>Ref {p.reference}</span></div>
      </div>
    </a>
  );
}
