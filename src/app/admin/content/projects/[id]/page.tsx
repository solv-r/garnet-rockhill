import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { slugify, uploadMedia, saveSeo } from "@/lib/content";
import { publicUrl, thumb } from "@/lib/media";
export const dynamic = "force-dynamic";
const t = (v: FormDataEntryValue | null) => (String(v ?? "").trim() || null);
async function save(fd: FormData) {
  "use server"; await requireRole(["content_editor"]);
  const id = String(fd.get("id")), title = String(fd.get("title") ?? "").trim(); const db = serviceDb();
  if (title.length < 3) redirect(`/admin/content/projects/${id}?err=Title is required`);
  const wantPublish = fd.get("publish") === "on", verified = fd.get("verified") === "on";
  if (wantPublish && !verified) redirect(`/admin/content/projects/${id}?err=Tick "verified" to confirm this is real company work before publishing`);
  const row = { title, category: t(fd.get("category")), location_text: t(fd.get("location_text")), description: t(fd.get("description")), status: t(fd.get("status")), completion_period: t(fd.get("completion_period")), service_area: t(fd.get("service_area")), verified, publish: wantPublish ? "published" : "draft" };
  let pid = id;
  if (id === "new") { const { data, error } = await db.from("projects").insert({ ...row, slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}` }).select("id, slug").single(); if (error) redirect(`/admin/content/projects/new?err=${encodeURIComponent(error.message.slice(0, 120))}`); pid = data.id; await saveSeo(`/projects/${data.slug}`, fd); }
  else { const { data, error } = await db.from("projects").update(row).eq("id", id).select("slug").single(); if (error) redirect(`/admin/content/projects/${id}?err=${encodeURIComponent(error.message.slice(0, 120))}`); await saveSeo(`/projects/${data.slug}`, fd); }
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  try { for (const f of files) { const path = await uploadMedia(`projects/${pid}`, f); await db.from("project_images").insert({ project_id: pid, storage_path: path, alt_text: title }); } }
  catch (e) { redirect(`/admin/content/projects/${pid}?err=${encodeURIComponent((e as Error).message.slice(0, 140))}`); }
  revalidatePath("/projects"); redirect(`/admin/content/projects/${pid}?saved=1`);
}
async function delImg(fd: FormData) {
  "use server"; await requireRole(["content_editor"]);
  const id = String(fd.get("id")), db = serviceDb();
  const { data } = await db.from("project_images").select("storage_path").eq("id", String(fd.get("img"))).eq("project_id", id).maybeSingle();
  if (data) { await db.storage.from("site-media").remove([data.storage_path, thumb(data.storage_path)]); await db.from("project_images").delete().eq("id", String(fd.get("img"))); }
  revalidatePath("/projects"); redirect(`/admin/content/projects/${id}`);
}
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string; saved?: string }> }) {
  await requireRole(["content_editor"]);
  const { id } = await params, sp = await searchParams; const db = serviceDb();
  let p: any = {}, imgs: any[] = [], seo: any = {}; // eslint-disable-line
  if (id !== "new") { const { data } = await db.from("projects").select("*").eq("id", id).maybeSingle(); if (!data) notFound(); p = data;
    imgs = (await db.from("project_images").select("*").eq("project_id", id).order("sort_order")).data ?? []; seo = (await db.from("seo_meta").select("*").eq("site", "corporate").eq("path", `/projects/${p.slug}`).maybeSingle()).data ?? {}; }
  return (<main style={{ maxWidth: 760 }}><h1>{id === "new" ? "New project" : p.title}</h1>
    {sp.saved && <p role="status">Saved.</p>}{sp.err && <p role="alert" style={{ color: "#a11" }}>{sp.err}</p>}
    <form action={save} style={{ display: "grid", gap: ".6rem" }}><input type="hidden" name="id" value={id} />
      <label>Title<input name="title" defaultValue={p.title} required /></label>
      <label>Category<input name="category" defaultValue={p.category ?? ""} /></label>
      <label>Related service<input name="service_area" defaultValue={p.service_area ?? ""} /></label>
      <label>Location<input name="location_text" defaultValue={p.location_text ?? ""} /></label>
      <label>Status<select name="status" defaultValue={p.status ?? ""}><option value="">—</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option></select></label>
      <label>Completion period (only if verified)<input name="completion_period" defaultValue={p.completion_period ?? ""} /></label>
      <label>Description<textarea name="description" rows={6} defaultValue={p.description ?? ""} /></label>
      <label>Add photos<input type="file" name="files" accept="image/jpeg,image/png,image/webp" multiple /></label>
      <fieldset><legend>SEO</legend><label>Page title<input name="seo_title" defaultValue={seo.title ?? ""} /></label><label>Meta description<textarea name="seo_description" rows={2} defaultValue={seo.description ?? ""} /></label><label><input type="checkbox" name="seo_noindex" defaultChecked={seo.noindex} /> Hide from search engines</label></fieldset>
      <label><input type="checkbox" name="verified" defaultChecked={p.verified} /> I confirm this is a real, verified company project</label>
      <label><input type="checkbox" name="publish" defaultChecked={p.publish === "published"} /> Publish on the website</label>
      <button>Save</button></form>
    {imgs.length > 0 && <ul style={{ listStyle: "none", padding: 0, display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{imgs.map((im) => <li key={im.id}><img src={publicUrl("site-media", thumb(im.storage_path))} alt={im.alt_text ?? ""} width={160} /><form action={delImg}><input type="hidden" name="id" value={id} /><input type="hidden" name="img" value={im.id} /><button>Delete</button></form></li>)}</ul>}
  </main>);
}
