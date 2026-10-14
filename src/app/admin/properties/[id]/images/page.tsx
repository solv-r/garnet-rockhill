import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { processImageSet } from "@/lib/images";
import { thumb, publicUrl } from "@/lib/media";
import { PropertyTabs } from "@/components/AdminTabs";
export const dynamic = "force-dynamic";
const BUCKET = "property-images", MAX_IMAGES = 30;
const back = (id: string, q = "") => `/admin/properties/${id}/images${q}`;
const done = (id: string) => { revalidatePath(back(id)); revalidatePath("/homes/properties"); revalidatePath("/homes"); };

async function upload(formData: FormData) {
  "use server";
  await requireRole(["property_manager"]);
  const id = String(formData.get("id")); const db = serviceDb();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) redirect(back(id, "?err=Choose at least one image"));
  const { data: existing } = await db.from("property_images").select("sort_order").eq("property_id", id).order("sort_order", { ascending: false });
  if ((existing?.length ?? 0) + files.length > MAX_IMAGES) redirect(back(id, `?err=Maximum ${MAX_IMAGES} images per property`));
  let next = (existing?.[0]?.sort_order ?? -1) + 1, firstId: string | null = null;
  try {
    for (const f of files) {
      const { full, small } = await processImageSet(f);
      const path = `${id}/${crypto.randomUUID()}.webp`;
      const up = await db.storage.from(BUCKET).upload(path, full, { contentType: "image/webp", upsert: false });
      if (up.error) throw new Error("Storage upload failed: " + up.error.message);
      const up2 = await db.storage.from(BUCKET).upload(thumb(path), small, { contentType: "image/webp", upsert: false });
      if (up2.error) { await db.storage.from(BUCKET).remove([path]); throw new Error("Storage upload failed: " + up2.error.message); }
      const { data: row, error } = await db.from("property_images").insert({ property_id: id, storage_path: path, sort_order: next++ }).select("id").single();
      if (error) { await db.storage.from(BUCKET).remove([path, thumb(path)]); throw new Error(error.message); }
      firstId ??= row.id;
    }
  } catch (e) { redirect(back(id, `?err=${encodeURIComponent((e as Error).message.slice(0, 140))}`)); }
  const { data: p } = await db.from("properties").select("cover_image_id").eq("id", id).single();
  if (!p?.cover_image_id && firstId) await db.from("properties").update({ cover_image_id: firstId }).eq("id", id);
  done(id); redirect(back(id, "?saved=1"));
}
async function remove(formData: FormData) {
  "use server";
  await requireRole(["property_manager"]);
  const id = String(formData.get("id")), imgId = String(formData.get("img")); const db = serviceDb();
  const { data: im } = await db.from("property_images").select("storage_path").eq("id", imgId).eq("property_id", id).maybeSingle(); // scoped to this property
  if (im) { await db.storage.from(BUCKET).remove([im.storage_path, thumb(im.storage_path)]); await db.from("property_images").delete().eq("id", imgId); }
  const { data: p } = await db.from("properties").select("cover_image_id").eq("id", id).single();
  if (p && !p.cover_image_id) { const { data: n } = await db.from("property_images").select("id").eq("property_id", id).order("sort_order").limit(1); if (n?.[0]) await db.from("properties").update({ cover_image_id: n[0].id }).eq("id", id); }
  done(id); redirect(back(id));
}
async function setCover(formData: FormData) {
  "use server"; await requireRole(["property_manager"]);
  const id = String(formData.get("id")), imgId = String(formData.get("img")); const db = serviceDb();
  const { data: im } = await db.from("property_images").select("id").eq("id", imgId).eq("property_id", id).maybeSingle();
  if (im) await db.from("properties").update({ cover_image_id: imgId }).eq("id", id);
  done(id); redirect(back(id));
}
async function move(formData: FormData) {
  "use server"; await requireRole(["property_manager"]);
  const id = String(formData.get("id")), imgId = String(formData.get("img")), dir = formData.get("dir") === "up" ? -1 : 1; const db = serviceDb();
  const { data: all } = await db.from("property_images").select("id").eq("property_id", id).order("sort_order").order("created_at");
  const ids = (all ?? []).map((r) => r.id), i = ids.indexOf(imgId), j = i + dir;
  if (i >= 0 && j >= 0 && j < ids.length) { [ids[i], ids[j]] = [ids[j], ids[i]]; await Promise.all(ids.map((x, k) => db.from("property_images").update({ sort_order: k }).eq("id", x))); }
  done(id); redirect(back(id));
}
async function saveAlt(formData: FormData) {
  "use server"; await requireRole(["property_manager"]);
  const id = String(formData.get("id"));
  await serviceDb().from("property_images").update({ alt_text: String(formData.get("alt") ?? "").slice(0, 200) || null, caption: String(formData.get("caption") ?? "").slice(0, 200) || null }).eq("id", String(formData.get("img"))).eq("property_id", id);
  done(id); redirect(back(id, "?saved=1"));
}

export default async function Images({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string; saved?: string }> }) {
  await requireRole(["property_manager"]);
  const { id } = await params; const sp = await searchParams; const db = serviceDb();
  const { data: p } = await db.from("properties").select("title, reference, cover_image_id").eq("id", id).maybeSingle();
  if (!p) notFound();
  const { data: imgs } = await db.from("property_images").select("*").eq("property_id", id).order("sort_order");
  const url = (path: string) => publicUrl("property-images", thumb(path));
  return (<main style={{ maxWidth: 900 }}>
    <h1>{p.title} <small className="muted" style={{ fontSize: "1rem" }}>({p.reference})</small></h1>
    <PropertyTabs id={id} active="photos" />
    {sp.saved && <p role="status" className="alert ok">Saved.</p>}{sp.err && <p role="alert" className="alert error">{sp.err}</p>}
    <form action={upload} className="panel" style={{ display: "grid", gap: ".5rem", maxWidth: 480 }}>
      <input type="hidden" name="id" value={id} />
      <label>Add photos (JPEG, PNG or WebP, up to 6 MB each)<input type="file" name="files" accept="image/jpeg,image/png,image/webp" multiple required /></label>
      <button>Upload</button>
    </form>
    <p style={{ color: "var(--muted)" }}>Photos are resized to 2000 px, converted to WebP, and location metadata is removed.</p>
    {(imgs ?? []).length === 0 && <p>No photos yet.</p>}
    <ol style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
      {(imgs ?? []).map((im, i) => (
        <li key={im.id} className="panel" style={{ padding: ".75rem" }}>
          <img src={url(im.storage_path)} alt={im.alt_text ?? ""} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} loading="lazy" />
          <p>#{i + 1} {p.cover_image_id === im.id && <strong>· Cover</strong>}</p>
          <form action={saveAlt} style={{ display: "grid", gap: ".25rem" }}><input type="hidden" name="id" value={id} /><input type="hidden" name="img" value={im.id} />
            <label>Alt text<input name="alt" defaultValue={im.alt_text ?? ""} /></label><label>Caption<input name="caption" defaultValue={im.caption ?? ""} /></label><button>Save text</button></form>
          <div style={{ display: "flex", gap: ".25rem", flexWrap: "wrap", marginTop: ".5rem" }}>
            {(["up", "down"] as const).map((d) => <form key={d} action={move}><input type="hidden" name="id" value={id} /><input type="hidden" name="img" value={im.id} /><input type="hidden" name="dir" value={d} /><button disabled={(d === "up" && i === 0) || (d === "down" && i === (imgs ?? []).length - 1)}>{d === "up" ? "Move earlier" : "Move later"}</button></form>)}
            {p.cover_image_id !== im.id && <form action={setCover}><input type="hidden" name="id" value={id} /><input type="hidden" name="img" value={im.id} /><button>Make cover</button></form>}
            <form action={remove}><input type="hidden" name="id" value={id} /><input type="hidden" name="img" value={im.id} /><button>Delete</button></form>
          </div>
        </li>))}
    </ol>
  </main>);
}
