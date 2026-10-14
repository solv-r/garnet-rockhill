import { revalidatePath } from "next/cache";
import { requireRole, can } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { publicUrl, thumb } from "@/lib/media";
export const dynamic = "force-dynamic";
const STATUSES = ["draft", "available", "upcoming", "reserved", "sold", "rented", "leased", "withdrawn"];
async function quick(fd: FormData) {
  "use server"; await requireRole(["property_manager"]);
  const id = String(fd.get("id")), status = String(fd.get("status")); if (!STATUSES.includes(status)) return;
  const priceRaw = String(fd.get("price") ?? "").trim(); const price = priceRaw === "" ? null : Number(priceRaw); if (price !== null && (!Number.isFinite(price) || price < 0)) return;
  await serviceDb().from("properties").update({ status, price }).eq("id", id);
  revalidatePath("/admin/properties"); revalidatePath("/properties");
}
export default async function PropertyList({ searchParams }: { searchParams: Promise<{ q?: string; publish?: string }> }) {
  const staff = await requireRole(["property_manager", "content_editor", "lead_handler"]);
  const sp = await searchParams; const canEdit = can(staff, ["property_manager"]);
  let q = serviceDb().from("properties").select("id, reference, title, status, publish, price, price_period, currency, is_demo, location:locations(name), cover:property_images!fk_cover(storage_path), imgs:property_images!property_images_property_id_fkey(id)").order("updated_at", { ascending: false }).limit(100);
  if (sp.publish) q = q.eq("publish", sp.publish);
  if (sp.q) q = q.ilike("title", `%${sp.q.replace(/[%_,()]/g, "")}%`);
  const { data } = await q;
  return (<>
    <h1>Properties</h1>
    <form style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "end" }}><label style={{ maxWidth: 260 }}>Search title<input name="q" defaultValue={sp.q} /></label>
      <label style={{ maxWidth: 180 }}>Visibility<select name="publish" defaultValue={sp.publish ?? ""}><option value="">All</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
      <button>Filter</button>{canEdit && <a className="btn outline" href="/admin/properties/new">+ New property</a>}</form>
    <div className="panel" style={{ marginTop: "1rem", overflowX: "auto" }}><table>
      <thead><tr><th>Photo</th><th>Ref</th><th>Title</th><th>Location</th><th>Visibility</th><th>Status and price</th><th>Photos</th></tr></thead>
      <tbody>{(data ?? []).map((p: any) => ( // eslint-disable-line
        <tr key={p.id}><td>{p.cover ? <img className="thumb" alt="" src={publicUrl("property-images", thumb(p.cover.storage_path))} /> : <span className="thumb" style={{ display: "block" }} />}</td>
          <td>{p.reference}</td><td><a href={`/admin/properties/${p.id}`}>{p.title}</a>{p.is_demo && " (DEMO)"}</td><td>{p.location?.name}</td><td><span className={`badge ${p.publish === "published" ? "" : "reserved"}`}>{p.publish}</span></td>
          <td>{canEdit ? <form action={quick} style={{ display: "flex", gap: ".35rem", alignItems: "center" }}><input type="hidden" name="id" value={p.id} />
            <select name="status" defaultValue={p.status} aria-label={`Status for ${p.reference}`} style={{ width: "auto" }}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            <input name="price" type="number" min={0} step="1" defaultValue={p.price ?? ""} aria-label={`Price for ${p.reference}`} style={{ width: 150 }} /><button style={{ padding: ".4rem .7rem" }}>Save</button></form> : <>{p.status} · {formatPrice(p.price, p.currency, p.price_period)}</>}</td>
          <td><a href={`/admin/properties/${p.id}/images`}>{p.imgs?.length ?? 0} photo{(p.imgs?.length ?? 0) === 1 ? "" : "s"} · {canEdit ? "Manage" : "View"}</a></td></tr>))}</tbody></table>
      {(data ?? []).length === 0 && <p className="muted">No properties yet.{canEdit && " Create the first one with “New property”."}</p>}</div>
  </>);
}
