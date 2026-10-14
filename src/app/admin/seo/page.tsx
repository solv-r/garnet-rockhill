import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { SEO_PATHS } from "@/lib/seo";
export const dynamic = "force-dynamic";
async function save(fd: FormData) {
  "use server"; await requireRole(["content_editor"]);
  const site = String(fd.get("site")), path = String(fd.get("path"));
  if (!(site === "corporate" || site === "homes") || !SEO_PATHS[site].some(([p]) => p === path)) throw new Error("Unknown page");
  const t = (k: string, n = 300) => String(fd.get(k) ?? "").trim().slice(0, n) || null;
  const row = { site, path, title: t("title", 120), description: t("description", 320), canonical_url: t("canonical_url", 300), og_title: t("og_title", 120), og_description: t("og_description", 320), og_image: t("og_image", 400), noindex: fd.get("noindex") === "on" };
  if (row.canonical_url && !/^https?:\/\//i.test(row.canonical_url)) redirect("/admin/seo?err=Canonical address must start with https://");
  if (row.og_image && !/^https?:\/\/|^\//i.test(row.og_image)) redirect("/admin/seo?err=Social image must be a web address");
  const db = serviceDb(); const empty = !row.title && !row.description && !row.canonical_url && !row.og_title && !row.og_description && !row.og_image && !row.noindex;
  if (empty) await db.from("seo_meta").delete().eq("site", site).eq("path", path); else await db.from("seo_meta").upsert(row, { onConflict: "site,path" });
  revalidatePath("/", "layout"); redirect(`/admin/seo?ok=${encodeURIComponent(`${site} ${path} saved`)}`);
}
export default async function Seo({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireRole(["content_editor"]); const sp = await searchParams;
  const { data } = await serviceDb().from("seo_meta").select("*"); const m = new Map((data ?? []).map((r) => [`${r.site}${r.path}`, r]));
  return (<main style={{ maxWidth: 900 }}><h1>SEO settings</h1>
    <p className="muted">Override the page title, description, canonical address, social sharing text/image and search-engine visibility for each page. Leave a box empty to keep the default. Property, project and article pages have their own SEO boxes (articles/projects) or are generated from the listing.</p>
    {sp.ok && <p role="status" className="alert ok">Saved: {sp.ok}</p>}{sp.err && <p role="alert" className="alert error">{sp.err}</p>}
    {(["corporate", "homes"] as const).map((site) => <section key={site}><h2>{site === "homes" ? "Rockhill Homes" : "Garnet Rockhill (corporate)"}</h2>
      {SEO_PATHS[site].map(([path, name]) => { const r = m.get(`${site}${path}`) ?? ({} as Record<string, any>); // eslint-disable-line
        return (<details key={path} className="panel" style={{ marginBottom: ".6rem" }} open={Boolean(r.title || r.description || r.noindex)}><summary style={{ cursor: "pointer", fontWeight: 600 }}>{name} <span className="muted">({path})</span>{r.noindex && " · hidden from search"}</summary>
          <form action={save} style={{ display: "grid", gap: ".6rem", marginTop: ".75rem" }}><input type="hidden" name="site" value={site} /><input type="hidden" name="path" value={path} />
            <label>Page title (about 50-60 characters)<input name="title" defaultValue={r.title ?? ""} maxLength={120} /></label>
            <label>Meta description (about 150 characters)<textarea name="description" rows={2} defaultValue={r.description ?? ""} maxLength={320} /></label>
            <label>Canonical address (leave empty for the default)<input name="canonical_url" defaultValue={r.canonical_url ?? ""} /></label>
            <label>Social sharing title<input name="og_title" defaultValue={r.og_title ?? ""} /></label>
            <label>Social sharing description<textarea name="og_description" rows={2} defaultValue={r.og_description ?? ""} /></label>
            <label>Social sharing image address<input name="og_image" defaultValue={r.og_image ?? ""} /></label>
            <label><input type="checkbox" name="noindex" defaultChecked={Boolean(r.noindex)} /> Hide this page from search engines</label>
            <button style={{ justifySelf: "start" }}>Save</button></form></details>); })}</section>)}
  </main>);
}
