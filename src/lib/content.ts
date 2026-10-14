import { serviceDb } from "./supabase";
import { processImageSet } from "./images";
import { thumb } from "./media";
export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
export const mediaUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-media/${path}`;
export async function uploadMedia(folder: string, file: File) {
  const { full, small } = await processImageSet(file); const path = `${folder}/${crypto.randomUUID()}.webp`; const st = serviceDb().storage.from("site-media");
  const a = await st.upload(path, full, { contentType: "image/webp" }); if (a.error) throw new Error(a.error.message);
  const b = await st.upload(thumb(path), small, { contentType: "image/webp" }); if (b.error) { await st.remove([path]); throw new Error(b.error.message); }
  return path;
}
export async function saveSeo(path: string, fd: FormData) {
  const t = (k: string) => String(fd.get(k) ?? "").trim() || null;
  await serviceDb().from("seo_meta").upsert({ site: "corporate", path, title: t("seo_title"), description: t("seo_description"), canonical_url: t("seo_canonical"), og_title: t("seo_title"), og_description: t("seo_description"), noindex: fd.get("seo_noindex") === "on" }, { onConflict: "site,path" });
}
