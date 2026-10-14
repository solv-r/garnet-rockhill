import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { PropertyTabs } from "@/components/AdminTabs";
import { thumb } from "@/lib/media";
export const dynamic = "force-dynamic";
const ROLES = ["property_manager"] as const;
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const n = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : Number(v));
const t = (v: FormDataEntryValue | null) => (v === null || String(v).trim() === "" ? null : String(v).trim());

async function save(formData: FormData) {
  "use server";
  await requireRole([...ROLES]);                       // server-side permission check, not just hidden buttons
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3) redirect(`/admin/properties/${id}?err=title`);
  const row: Record<string, unknown> = {
    title, category_id: formData.get("category_id"), transaction: formData.get("transaction"), status: formData.get("status"),
    price: n(formData.get("price")), price_period: t(formData.get("price_period")), location_id: formData.get("location_id"),
    description: t(formData.get("description")), bedrooms: n(formData.get("bedrooms")), bathrooms: n(formData.get("bathrooms")), parking: n(formData.get("parking")),
    plot_size_sqm: n(formData.get("plot_size_sqm")), building_area_sqm: n(formData.get("building_area_sqm")), furnishing: t(formData.get("furnishing")),
    max_guests: n(formData.get("max_guests")), development_status: t(formData.get("development_status")), expected_completion: t(formData.get("expected_completion")),
    is_featured: formData.get("is_featured") === "on",
  };
  const db = serviceDb();
  let savedId = id;
  if (id === "new") {
    row.slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await db.from("properties").insert(row).select("id").single();
    if (error) redirect(`/admin/properties/new?err=${encodeURIComponent(error.message.slice(0, 120))}`);
    savedId = data.id;
  } else {
    const { error } = await db.from("properties").update(row).eq("id", id);
    if (error) redirect(`/admin/properties/${id}?err=${encodeURIComponent(error.message.slice(0, 120))}`);
  }
  const featureIds = formData.getAll("features").map(String);
  await db.from("property_features").delete().eq("property_id", savedId);
  if (featureIds.length) await db.from("property_features").insert(featureIds.map((feature_id) => ({ property_id: savedId, feature_id })));
  revalidatePath("/homes"); revalidatePath("/admin/properties");
  redirect(`/admin/properties/${savedId}?saved=1`);
}
async function setPublish(formData: FormData) {
  "use server";
  await requireRole([...ROLES]);
  const id = String(formData.get("id")), to = String(formData.get("to"));
  if (!["published", "draft", "archived"].includes(to)) throw new Error("Bad state");
  const db = serviceDb();
  const { data: p } = await db.from("properties").select("is_demo, status, price, description").eq("id", id).single();
  if (!p) notFound();
  if (to === "published") {
    if (p.is_demo) redirect(`/admin/properties/${id}?err=Demo records cannot be published`);
    if (!p.description) redirect(`/admin/properties/${id}?err=Add a description before publishing`);
  }
  const patch: Record<string, unknown> = { publish: to };
  if (to === "published" && p.status === "draft") patch.status = "available";
  const { error } = await db.from("properties").update(patch).eq("id", id);
  if (error) redirect(`/admin/properties/${id}?err=${encodeURIComponent(error.message.slice(0, 120))}`);
  revalidatePath("/homes"); revalidatePath(`/homes/properties`);
  redirect(`/admin/properties/${id}?saved=1`);
}

async function remove(fd: FormData) {
  "use server"; await requireRole([...ROLES]);
  const id = String(fd.get("id")), typed = String(fd.get("confirm") ?? "").trim(); const db = serviceDb();
  const { data: p } = await db.from("properties").select("reference, publish").eq("id", id).maybeSingle(); if (!p) notFound();
  if (p.publish === "published") redirect(`/admin/properties/${id}?err=Unpublish or archive the listing before deleting it`);
  if (typed !== p.reference) redirect(`/admin/properties/${id}?err=Type the reference ${p.reference} exactly to confirm deletion`);
  const { data: imgs } = await db.from("property_images").select("storage_path").eq("property_id", id);
  if (imgs?.length) await db.storage.from("property-images").remove(imgs.flatMap((i) => [i.storage_path, thumb(i.storage_path)]));
  await db.from("properties").delete().eq("id", id);
  revalidatePath("/admin/properties"); redirect("/admin/properties");
}
export default async function Edit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string; saved?: string }> }) {
  await requireRole([...ROLES]);
  const { id } = await params; const sp = await searchParams;
  const db = serviceDb();
  const [{ data: cats }, { data: locs }, { data: feats }] = await Promise.all([db.from("property_categories").select("id, name").order("sort_order"), db.from("locations").select("id, name, kind").order("name"), db.from("features").select("id, name").order("name")]);
  const chosen = new Set<string>();
  if (id !== "new") { const { data } = await db.from("property_features").select("feature_id").eq("property_id", id); (data ?? []).forEach((r) => chosen.add(r.feature_id)); }
  let p: any = {}; // eslint-disable-line
  if (id !== "new") { const { data } = await db.from("properties").select("*").eq("id", id).maybeSingle(); if (!data) notFound(); p = data; }
  const sel = (name: string, opts: [string, string][], val?: string, req = true) =>
    <select name={name} defaultValue={val ?? ""} required={req}>{!req && <option value="">—</option>}{req && <option value="" disabled>Choose…</option>}{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
  return (<main style={{ maxWidth: 800 }}>
    <h1>{id === "new" ? "New property" : `Edit ${p.reference}`}</h1>
    {id !== "new" ? <PropertyTabs id={id} active="details" /> : <p className="muted">Save the property first, then a <strong>Photos</strong> tab appears here for uploading pictures.</p>}
    {sp.saved && <p role="status" className="alert ok">Saved.</p>}{sp.err && <p role="alert" className="alert error">{sp.err}</p>}
    <form action={save} className="panel" style={{ display: "grid", gap: ".75rem" }}>
      <input type="hidden" name="id" value={id} />
      <label>Title<input name="title" defaultValue={p.title} required minLength={3} /></label>
      <label>Category{sel("category_id", (cats ?? []).map((c) => [c.id, c.name]), p.category_id)}</label>
      <label>Transaction{sel("transaction", [["sale", "For sale"], ["rent", "For rent"], ["lease", "For lease"], ["off_plan_enquiry", "Off-plan (enquiry)"]], p.transaction)}</label>
      <label>Availability status{sel("status", ["draft", "available", "upcoming", "reserved", "sold", "rented", "leased", "withdrawn"].map((s) => [s, s]), p.status ?? "draft")}</label>
      <label>Price (₦, leave empty for "price on request")<input name="price" type="number" min={0} step="1" defaultValue={p.price ?? ""} /></label>
      <label>Price applies per{sel("price_period", [["total", "Total"], ["year", "Year"], ["month", "Month"], ["night", "Night"]], p.price_period, false)}</label>
      <label>Location{sel("location_id", (locs ?? []).map((l) => [l.id, `${l.name} (${l.kind})`]), p.location_id)}</label>
      <label>Description<textarea name="description" rows={6} defaultValue={p.description ?? ""} /></label>
      <fieldset style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: ".5rem" }}><legend>Details (fill only what applies)</legend>
        <label>Bedrooms<input name="bedrooms" type="number" min={0} defaultValue={p.bedrooms ?? ""} /></label>
        <label>Bathrooms<input name="bathrooms" type="number" min={0} defaultValue={p.bathrooms ?? ""} /></label>
        <label>Parking<input name="parking" type="number" min={0} defaultValue={p.parking ?? ""} /></label>
        <label>Plot size (sqm)<input name="plot_size_sqm" type="number" min={0} step="any" defaultValue={p.plot_size_sqm ?? ""} /></label>
        <label>Building area (sqm)<input name="building_area_sqm" type="number" min={0} step="any" defaultValue={p.building_area_sqm ?? ""} /></label>
        <label>Max guests (short-let)<input name="max_guests" type="number" min={0} defaultValue={p.max_guests ?? ""} /></label>
        <label>Furnishing{sel("furnishing", [["furnished", "Furnished"], ["semi_furnished", "Semi-furnished"], ["unfurnished", "Unfurnished"]], p.furnishing, false)}</label>
        <label>Development status<input name="development_status" defaultValue={p.development_status ?? ""} /></label>
        <label>Expected completion (only if confirmed)<input name="expected_completion" type="date" defaultValue={p.expected_completion ?? ""} /></label>
      </fieldset>
      <fieldset><legend>Features</legend>{(feats ?? []).map((f) => <label key={f.id} style={{ marginRight: "1rem" }}><input type="checkbox" name="features" value={f.id} defaultChecked={chosen.has(f.id)} /> {f.name}</label>)}</fieldset>
      <label><input type="checkbox" name="is_featured" defaultChecked={p.is_featured} /> Featured on homepage</label>
      <button type="submit">Save</button>
    </form>
    {id !== "new" && <section style={{ marginTop: "1.5rem" }}><h2>Visibility: {p.publish}</h2>
      <p>Draft and archived listings never appear publicly. Publishing shows the listing and its status exactly as saved.</p>
      <div style={{ display: "flex", gap: ".5rem" }}>
        {p.publish !== "published" && <form action={setPublish}><input type="hidden" name="id" value={id} /><input type="hidden" name="to" value="published" /><button>Publish</button></form>}
        {p.publish === "published" && <form action={setPublish}><input type="hidden" name="id" value={id} /><input type="hidden" name="to" value="draft" /><button>Unpublish</button></form>}
        {p.publish !== "archived" && <form action={setPublish}><input type="hidden" name="id" value={id} /><input type="hidden" name="to" value="archived" /><button>Archive</button></form>}
      </div>
      {p.publish !== "published" && <form action={remove} style={{ marginTop: "1.5rem", display: "grid", gap: ".5rem", maxWidth: 420 }}><h3 style={{ margin: 0 }}>Delete this listing</h3><p className="muted" style={{ margin: 0 }}>This permanently removes the listing and its photos. Type the reference <strong>{p.reference}</strong> to confirm.</p><input type="hidden" name="id" value={id} /><input name="confirm" autoComplete="off" aria-label="Type the reference to confirm" /><button style={{ background: "#9b1c1c", borderColor: "#9b1c1c" }}>Delete permanently</button></form>}</section>}
  </main>);
}
