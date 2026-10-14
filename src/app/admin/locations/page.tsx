import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
export const dynamic = "force-dynamic";
type Loc = { id: string; name: string; kind: "state" | "city" | "area"; slug: string; parent_id: string | null; public_lat: number | null; public_lng: number | null };
const KINDS = ["state", "city", "area"] as const;
const PARENT_KIND: Record<string, string | null> = { state: null, city: "state", area: "city" };
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const go = (kind: "ok" | "err", msg: string): never => redirect(`/admin/locations?${kind}=${encodeURIComponent(msg)}`);
const num = (v: FormDataEntryValue | null) => (v === null || String(v).trim() === "" ? null : Number(v));
const badCoord = (lat: number | null, lng: number | null) => (lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) || (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180)) || ((lat === null) !== (lng === null));
const refresh = () => { revalidatePath("/admin/locations"); revalidatePath("/", "layout"); };

async function checkParent(kind: string, parentId: string | null, selfId?: string) {
  const need = PARENT_KIND[kind]; const db = serviceDb();
  if (!need) { if (parentId) go("err", "A state cannot have a parent."); return; }
  if (!parentId) go("err", `A ${kind} must belong to a ${need}.`);
  const { data: p } = await db.from("locations").select("kind").eq("id", parentId!).maybeSingle();
  if (!p || p.kind !== need) go("err", `The parent of a ${kind} must be a ${need}.`);
  if (selfId && parentId === selfId) go("err", "A location cannot be its own parent.");
}
async function uniqueSlug(name: string, parentSlug?: string) {
  const db = serviceDb(); const base = slugify(name) || "location";
  for (const cand of [base, parentSlug ? `${base}-${parentSlug}` : "", ...Array.from({ length: 20 }, (_, i) => `${base}-${i + 2}`)]) {
    if (!cand) continue; const { data } = await db.from("locations").select("id").eq("slug", cand).maybeSingle(); if (!data) return cand;
  }
  return `${base}-${Date.now()}`;
}
async function add(fd: FormData) {
  "use server"; await requireRole(["property_manager"]);
  const name = String(fd.get("name") ?? "").trim().slice(0, 80), kind = String(fd.get("kind")), parent = String(fd.get("parent") || "") || null;
  const lat = num(fd.get("lat")), lng = num(fd.get("lng"));
  if (name.length < 2) go("err", "Enter a name.");
  if (!KINDS.includes(kind as never)) go("err", "Choose a type.");
  if (badCoord(lat, lng)) go("err", "Enter both latitude (-90 to 90) and longitude (-180 to 180), or leave both empty.");
  await checkParent(kind, parent);
  const db = serviceDb(); const { data: p } = parent ? await db.from("locations").select("slug").eq("id", parent).maybeSingle() : { data: null };
  const { error } = await db.from("locations").insert({ name, kind, slug: await uniqueSlug(name, p?.slug), parent_id: parent, public_lat: lat, public_lng: lng });
  if (error) go("err", error.message.slice(0, 140));
  refresh(); go("ok", `Added ${name}.`);
}
async function update(fd: FormData) {
  "use server"; await requireRole(["property_manager"]);
  const id = String(fd.get("id")); const db = serviceDb();
  const { data: cur } = await db.from("locations").select("kind, name").eq("id", id).maybeSingle(); if (!cur) go("err", "That location no longer exists.");
  const name = String(fd.get("name") ?? "").trim().slice(0, 80), parent = String(fd.get("parent") || "") || null; const lat = num(fd.get("lat")), lng = num(fd.get("lng"));
  if (name.length < 2) go("err", "Enter a name.");
  if (badCoord(lat, lng)) go("err", "Enter both latitude (-90 to 90) and longitude (-180 to 180), or leave both empty.");
  await checkParent(cur!.kind, parent, id);
  const { error } = await db.from("locations").update({ name, parent_id: parent, public_lat: lat, public_lng: lng }).eq("id", id); // slug stays the same so links and filters keep working
  if (error) go("err", error.message.slice(0, 140));
  refresh(); go("ok", `Saved ${name}.`);
}
async function remove(fd: FormData) {
  "use server"; await requireRole(["property_manager"]);
  const id = String(fd.get("id")); const db = serviceDb();
  if (fd.get("confirm") !== "on") go("err", "Tick the confirmation box to delete.");
  const { data: cur } = await db.from("locations").select("name").eq("id", id).maybeSingle(); if (!cur) go("err", "That location no longer exists.");
  const [{ count: kids }, { count: props }] = await Promise.all([db.from("locations").select("id", { count: "exact", head: true }).eq("parent_id", id), db.from("properties").select("id", { count: "exact", head: true }).eq("location_id", id)]);
  if (kids) go("err", `${cur!.name} still has ${kids} location(s) under it. Move or delete those first.`);
  if (props) go("err", `${cur!.name} is used by ${props} propert${props === 1 ? "y" : "ies"}. Change those properties' location first.`);
  const { error } = await db.from("locations").delete().eq("id", id);
  if (error) go("err", error.message.slice(0, 140));
  refresh(); go("ok", `Deleted ${cur!.name}.`);
}

export default async function Locations({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireRole(["property_manager"]); const sp = await searchParams; const db = serviceDb();
  const [{ data: locs }, { data: used }] = await Promise.all([db.from("locations").select("id, name, kind, slug, parent_id, public_lat, public_lng").order("name"), db.from("properties").select("location_id")]);
  const all = (locs ?? []) as Loc[]; const byId = new Map(all.map((l) => [l.id, l]));
  const propCount = new Map<string, number>(); for (const r of used ?? []) propCount.set(r.location_id, (propCount.get(r.location_id) ?? 0) + 1);
  const kids = (id: string | null) => all.filter((l) => l.parent_id === id);
  const ordered: { l: Loc; depth: number }[] = []; const walk = (l: Loc, d: number) => { ordered.push({ l, depth: d }); kids(l.id).forEach((k) => walk(k, d + 1)); };
  all.filter((l) => !l.parent_id).sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "state" ? -1 : 1)).forEach((l) => walk(l, 0));
  const parentsFor = (kind: string) => all.filter((l) => l.kind === PARENT_KIND[kind]);
  const label = (l: Loc) => `${l.name} (${l.kind}${l.parent_id ? `, ${byId.get(l.parent_id)?.name}` : ""})`;
  return (<main style={{ maxWidth: 980 }}><h1>Locations</h1>
    <p className="muted">Organise places as <strong>state &gt; city &gt; area (neighbourhood)</strong>. Properties are assigned to a city or area. The map shows one marker per location that has a centre point; use a neighbourhood centre, never a house location. You can edit or delete any location here.</p>
    {sp.ok && <p role="status" className="alert ok">{sp.ok}</p>}{sp.err && <p role="alert" className="alert error">{sp.err}</p>}
    <form action={add} className="panel" style={{ display: "grid", gap: ".75rem", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", alignItems: "end" }}>
      <h2 style={{ gridColumn: "1/-1", margin: 0, fontSize: "1.15rem" }}>Add a location</h2>
      <label>Name<input name="name" required minLength={2} /></label>
      <label>Type<select name="kind" defaultValue="area"><option value="state">State</option><option value="city">City</option><option value="area">Area / neighbourhood</option></select></label>
      <label>Belongs to (city for an area, state for a city)<select name="parent"><option value="">— none (states only) —</option>{all.filter((l) => l.kind !== "area").map((l) => <option key={l.id} value={l.id}>{label(l)}</option>)}</select></label>
      <label>Latitude<input name="lat" type="number" step="any" placeholder="e.g. 9.0765" /></label><label>Longitude<input name="lng" type="number" step="any" placeholder="e.g. 7.3986" /></label>
      <button>Add location</button></form>
    <div className="panel" style={{ marginTop: "1.25rem", padding: 0 }}>
      {ordered.length === 0 && <p className="muted" style={{ padding: "1rem" }}>No locations yet.</p>}
      {ordered.map(({ l, depth }) => { const n = propCount.get(l.id) ?? 0, k = kids(l.id).length;
        return (<details key={l.id} style={{ borderBottom: "1px solid var(--line)", padding: ".6rem 1rem .6rem " + (1 + depth * 1.6) + "rem" }}>
          <summary style={{ cursor: "pointer", display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
            <strong>{l.name}</strong><span className="badge">{l.kind}</span>
            <span className="muted" style={{ fontSize: ".9rem" }}>{n} propert{n === 1 ? "y" : "ies"}{k ? ` · ${k} sub-location${k === 1 ? "" : "s"}` : ""} · {l.public_lat != null ? `map point ${l.public_lat}, ${l.public_lng}` : "no map point"}</span><span style={{ marginLeft: "auto", color: "var(--brand-accent)", fontWeight: 600 }}>Edit</span></summary>
          <form action={update} style={{ display: "grid", gap: ".6rem", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", alignItems: "end", marginTop: ".75rem" }}><input type="hidden" name="id" value={l.id} />
            <label>Name<input name="name" defaultValue={l.name} required minLength={2} /></label>
            {PARENT_KIND[l.kind] && <label>Belongs to<select name="parent" defaultValue={l.parent_id ?? ""}>{parentsFor(l.kind).map((p) => <option key={p.id} value={p.id}>{label(p)}</option>)}</select></label>}
            <label>Latitude<input name="lat" type="number" step="any" defaultValue={l.public_lat ?? ""} /></label><label>Longitude<input name="lng" type="number" step="any" defaultValue={l.public_lng ?? ""} /></label>
            <button>Save changes</button></form>
          <form action={remove} style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap", marginTop: ".75rem" }}><input type="hidden" name="id" value={l.id} />
            <label style={{ display: "flex", gap: ".4rem", alignItems: "center", fontWeight: 400 }}><input type="checkbox" name="confirm" /> I want to delete {l.name}</label>
            <button className="btn outline" style={{ color: "#9b1c1c", borderColor: "#9b1c1c" }}>Delete</button>
            {(n > 0 || k > 0) && <span className="muted" style={{ fontSize: ".85rem" }}>Cannot be deleted while it has {n > 0 ? "properties" : ""}{n > 0 && k > 0 ? " or " : ""}{k > 0 ? "sub-locations" : ""}.</span>}</form>
        </details>); })}
    </div></main>);
}
