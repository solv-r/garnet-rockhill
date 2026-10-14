import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { urls } from "@/lib/config";
export const dynamic = "force-dynamic";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const homes = ((await headers()).get("host") ?? "").toLowerCase().startsWith("homes.");
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }], sitemap: `${homes ? urls.homes : urls.corporate}/sitemap.xml` };
}
