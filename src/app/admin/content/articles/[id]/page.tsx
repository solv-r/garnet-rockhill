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
  if (title.length < 3) redirect(`/admin/content/articles/${id}?err=Title is required`);
  const pub = fd.get("publish") === "on";
  let cover: string | undefined;
  const f = fd.get("cover");
  try { if (f instanceof File && f.size > 0) cover = await uploadMedia("articles", f); } catch (e) { redirect(`/admin/content/articles/${id}?err=${encodeURIComponent((e as Error).message.slice(0, 140))}`); }
  const row: Record<string, unknown> = { title, category: t(fd.get("category")), excerpt: t(fd.get("excerpt")), body: t(fd.get("body")), publish: pub ? "published" : "draft", updated_at: new Date().toISOString() };
  if (cover) row.cover_path = cover;
  let slug: string, aid = id;
  if (id === "new") { slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`; const { data, error } = await db.from("articles").insert({ ...row, slug, published_at: pub ? new Date().toISOString() : null }).select("id").single(); if (error) redirect(`/admin/content/articles/new?err=${encodeURIComponent(error.message.slice(0, 120))}`); aid = data.id; }
  else { const { data: cur } = await db.from("articles").select("slug, published_at").eq("id", id).single(); slug = cur!.slug; if (pub && !cur!.published_at) row.published_at = new Date().toISOString(); const { error } = await db.from("articles").update(row).eq("id", id); if (error) redirect(`/admin/content/articles/${id}?err=${encodeURIComponent(error.message.slice(0, 120))}`); }
  await saveSeo(`/news/${slug}`, fd);
  revalidatePath("/news"); redirect(`/admin/content/articles/${aid}?saved=1`);
}
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string; saved?: string }> }) {
  await requireRole(["content_editor"]);
  const { id } = await params, sp = await searchParams;
  let a: any = {}, seo: any = {}; // eslint-disable-line
  if (id !== "new") { const { data } = await serviceDb().from("articles").select("*").eq("id", id).maybeSingle(); if (!data) notFound(); a = data; seo = (await serviceDb().from("seo_meta").select("*").eq("site", "corporate").eq("path", `/news/${a.slug}`).maybeSingle()).data ?? {}; }
  return (<main style={{ maxWidth: 760 }}><h1>{id === "new" ? "New article" : a.title}</h1>
    {sp.saved && <p role="status">Saved.</p>}{sp.err && <p role="alert" style={{ color: "#a11" }}>{sp.err}</p>}
    {a.slug && a.publish !== "published" && <p>Draft preview: <a href={`/news/${a.slug}?preview=1`}>open preview</a> (staff only)</p>}
    <form action={save} style={{ display: "grid", gap: ".6rem" }}><input type="hidden" name="id" value={id} />
      <label>Title<input name="title" defaultValue={a.title} required /></label><label>Category<input name="category" defaultValue={a.category ?? ""} /></label>
      <label>Summary<textarea name="excerpt" rows={2} defaultValue={a.excerpt ?? ""} /></label>
      <label>Article text (blank line between paragraphs)<textarea name="body" rows={14} defaultValue={a.body ?? ""} /></label>
      <label>Cover image{a.cover_path && <img src={publicUrl("site-media", thumb(a.cover_path))} alt="" width={160} />}<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" /></label>
      <fieldset><legend>SEO</legend><label>Page title<input name="seo_title" defaultValue={seo.title ?? ""} /></label><label>Meta description<textarea name="seo_description" rows={2} defaultValue={seo.description ?? ""} /></label><label><input type="checkbox" name="seo_noindex" defaultChecked={seo.noindex} /> Hide from search engines</label></fieldset>
      <label><input type="checkbox" name="publish" defaultChecked={a.publish === "published"} /> Published</label><button>Save</button></form>
  </main>);
}
