import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { publicDb } from "@/lib/supabase";
import { services } from "@/lib/corporate-content";
import { urls } from "@/lib/config";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = ((await headers()).get("host") ?? "").toLowerCase(); const db = publicDb();
  if (host.startsWith("homes.")) {
    const b = urls.homes; const { data } = await db.from("properties").select("slug, updated_at").eq("publish", "published").in("status", ["available", "upcoming", "reserved"]);
    const fixed = ["", "/properties", "/sale", "/rent", "/land", "/off-plan", "/commercial", "/estates", "/short-lets", "/map", "/about", "/contact", "/privacy", "/terms", "/cookies", "/disclaimer"];
    return [...fixed.map((p) => ({ url: b + p })), ...(data ?? []).map((p) => ({ url: `${b}/properties/${p.slug}`, lastModified: p.updated_at }))];
  }
  const b = urls.corporate;
  const [{ data: pr }, { data: ar }, { data: seo }] = await Promise.all([db.from("projects").select("slug").eq("publish", "published").eq("verified", true), db.from("articles").select("slug, updated_at").eq("publish", "published"), db.from("seo_meta").select("path").eq("site", "corporate").eq("noindex", true)]);
  const hidden = new Set((seo ?? []).map((s) => s.path));
  const urlsOut = [...["", "/about", "/services", "/sectors", "/projects", "/hse", "/rockhill-homes", "/news", "/contact", "/privacy", "/terms", "/cookies"], ...services.map((s) => `/services/${s.slug}`), ...(pr ?? []).map((p) => `/projects/${p.slug}`), ...(ar ?? []).map((a) => `/news/${a.slug}`)];
  return urlsOut.filter((p) => !hidden.has(p)).map((p) => ({ url: b + p }));
}
