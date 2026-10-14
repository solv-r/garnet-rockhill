import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { BLOCKS, defaultsFor } from "@/lib/siteContent";
import { uploadMedia } from "@/lib/content";
import { publicUrl } from "@/lib/media";
export const dynamic = "force-dynamic";
const safeLink = (v: string) => v === "" || /^https?:\/\//i.test(v) || v.startsWith("/");

async function act(fd: FormData) {
  "use server"; await requireRole(["content_editor"]);
  const [site, page] = String(fd.get("block")).split(":"); const intent = String(fd.get("intent"));
  const block = BLOCKS.find((b) => b.site === site && b.page === page); if (!block) throw new Error("Unknown block");
  const db = serviceDb(); const anchor = `#${site}-${page}`;
  const { data: row } = await db.from("pages").select("content, draft").eq("site", site).eq("key", page).maybeSingle();
  if (intent === "discard") { if (row) await db.from("pages").update({ draft: null }).eq("site", site).eq("key", page); redirect(`/admin/site-content?ok=Draft discarded${anchor}`); }
  const current = (row?.draft ?? row?.content ?? {}) as Record<string, string>; const out: Record<string, string> = {};
  for (const f of block.fields) {
    if (f.image) {
      const file = fd.get(`f_${f.key}`);
      if (file instanceof File && file.size > 0) { try { out[f.key] = publicUrl("site-media", await uploadMedia(`content/${site}`, file)); } catch (e) { redirect(`/admin/site-content?err=${encodeURIComponent((e as Error).message.slice(0, 140))}${anchor}`); } }
      else if (fd.get(`reset_${f.key}`) === "on") out[f.key] = "";
      else out[f.key] = current[f.key] ?? "";
    } else {
      let v = String(fd.get(`f_${f.key}`) ?? "").trim().slice(0, f.long ? 1500 : 300);
      if (f.key === "link_url" && !safeLink(v)) redirect(`/admin/site-content?err=Link address must start with https:// or /${anchor}`);
      if (f.key === "enabled") v = v.toLowerCase() === "yes" ? "yes" : "no";
      out[f.key] = v;
    }
  }
  if (intent === "publish") await db.from("pages").upsert({ site, key: page, content: out, draft: null, publish: "published", updated_at: new Date().toISOString() }, { onConflict: "site,key" });
  else await db.from("pages").upsert({ site, key: page, content: row?.content ?? {}, draft: out, publish: row ? undefined : "draft", updated_at: new Date().toISOString() }, { onConflict: "site,key" });
  revalidatePath("/", "layout");
  redirect(`/admin/site-content?ok=${intent === "publish" ? "Published. The website now shows this text" : "Draft saved. It is not public until you publish"}${anchor}`);
}
export default async function SiteContent({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireRole(["content_editor"]); const sp = await searchParams;
  const { data: rows } = await serviceDb().from("pages").select("site, key, content, draft, publish, updated_at");
  const map = new Map((rows ?? []).map((r) => [`${r.site}:${r.key}`, r]));
  return (<main style={{ maxWidth: 900 }}><h1>Site content</h1>
    <p className="muted">Edit the main headings, paragraphs, banners and pictures. “Save draft” keeps changes private; “Publish” makes them live. Leave a text box empty to use the original wording.</p>
    {sp.ok && <p role="status" className="alert ok">{sp.ok}</p>}{sp.err && <p role="alert" className="alert error">{sp.err}</p>}
    {BLOCKS.map((b) => { const r = map.get(`${b.site}:${b.page}`); const vals = { ...defaultsFor(b.site, b.page), ...Object.fromEntries(Object.entries((r?.draft ?? r?.content ?? {}) as Record<string, string>).filter(([, v]) => typeof v === "string" && v !== "")) };
      return (<form key={`${b.site}:${b.page}`} id={`${b.site}-${b.page}`} action={act} className="panel" style={{ display: "grid", gap: ".75rem", marginBottom: "1.25rem" }}>
        <input type="hidden" name="block" value={`${b.site}:${b.page}`} />
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{b.title} {r?.draft && <span className="badge upcoming">Unpublished draft</span>} {r?.publish === "published" && !r?.draft && <span className="badge">Live</span>}</h2>
        {b.fields.map((f) => f.image ? <div key={f.key}><strong style={{ fontSize: ".92rem" }}>{f.label}</strong><img src={vals[f.key]} alt="" style={{ maxWidth: 260, margin: ".4rem 0", borderRadius: 8 }} />
          <label>Replace picture (JPEG, PNG or WebP)<input type="file" name={`f_${f.key}`} accept="image/jpeg,image/png,image/webp" /></label><label><input type="checkbox" name={`reset_${f.key}`} /> Go back to the placeholder picture</label></div>
          : <label key={f.key}>{f.label}{f.long ? <textarea name={`f_${f.key}`} rows={3} defaultValue={vals[f.key]} /> : <input name={`f_${f.key}`} defaultValue={vals[f.key]} />}</label>)}
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}><button name="intent" value="draft" className="btn outline">Save draft</button><button name="intent" value="publish">Publish</button>{r?.draft && <button name="intent" value="discard" className="btn outline">Discard draft</button>}</div>
      </form>); })}
  </main>);
}
