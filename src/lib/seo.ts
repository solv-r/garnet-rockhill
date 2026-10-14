import type { Metadata } from "next";
import { publicDb } from "./supabase";
import { urls, type Site } from "./config";
/** Page metadata: shipped defaults, overridden by anything saved in the admin "SEO" page (seo_meta table). */
export async function buildMetadata(site: Site, path: string, d: { title: string; description?: string }): Promise<Metadata> {
  let o: Record<string, any> | null = null; // eslint-disable-line
  try { o = (await publicDb().from("seo_meta").select("*").eq("site", site).eq("path", path).maybeSingle()).data; } catch { /* defaults */ }
  const base = site === "homes" ? urls.homes : urls.corporate; const title = o?.title || d.title, description = o?.description || d.description;
  return { title, description, alternates: { canonical: o?.canonical_url || `${base}${path === "/" ? "" : path}` }, robots: o?.noindex ? { index: false, follow: false } : undefined,
    openGraph: { title: o?.og_title || title, description: o?.og_description || description, images: o?.og_image ? [o.og_image] : undefined } };
}
export const SEO_PATHS: Record<Site, [string, string][]> = {
  corporate: [["/", "Home"], ["/about", "About"], ["/services", "Services"], ["/sectors", "Sectors"], ["/projects", "Projects"], ["/hse", "HSE"], ["/news", "News"], ["/contact", "Contact"], ["/rockhill-homes", "Rockhill Homes gateway"]],
  homes: [["/", "Home"], ["/properties", "All properties"], ["/sale", "For sale"], ["/rent", "For rent"], ["/land", "Land & plots"], ["/off-plan", "Off-plan"], ["/commercial", "Commercial"], ["/estates", "Estates"], ["/short-lets", "Short-lets"], ["/map", "Map"], ["/about", "About"], ["/contact", "Contact"]],
};
