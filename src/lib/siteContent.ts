import { publicDb } from "./supabase";
import type { Site } from "./config";
// Registry of editable text. Admin renders forms from this; pages read with getContent(). Defaults are the shipped copy.
export type Field = { key: string; label: string; long?: boolean; image?: boolean; default: string };
export type Block = { site: Site; page: string; title: string; fields: Field[] };
export const BLOCKS: Block[] = [
  { site: "corporate", page: "banner", title: "Corporate: site-wide banner", fields: [
    { key: "enabled", label: "Show banner (yes / no)", default: "no" }, { key: "text", label: "Banner text", default: "" }, { key: "link_text", label: "Link text (optional)", default: "" }, { key: "link_url", label: "Link address (optional)", default: "" } ] },
  { site: "corporate", page: "home", title: "Corporate: home page", fields: [
    { key: "hero_title", label: "Hero heading (put ** ** around one word to emphasise it)", default: "Built on **quality**. Delivered with care." },
    { key: "hero_image", label: "Hero background image", image: true, default: "/placeholders/hero-corporate.svg" },
    { key: "hero_text", label: "Hero paragraph", long: true, default: "Garnet Rockhill Limited delivers building, civil and infrastructure projects, property development and consultancy from Abuja, Nigeria." },
    { key: "cta_text", label: "Main button text", default: "Make a business enquiry" },
    { key: "services_title", label: "Services section heading", default: "What we do" },
    { key: "manifesto_image", label: "Mission section picture", image: true, default: "/placeholders/manifesto.svg" },
    { key: "homes_title", label: "Rockhill Homes gateway heading", default: "Looking for a home or land?" },
    { key: "homes_text", label: "Rockhill Homes gateway text", long: true, default: "Rockhill Homes is Garnet Rockhill's property brand for homes, plots and developments." } ] },
  { site: "corporate", page: "service_images", title: "Corporate: service pictures", fields: [
    { key: "construction", label: "Construction Services", image: true, default: "/placeholders/service-construction.svg" },
    { key: "real-estate-development", label: "Real Estate Development", image: true, default: "/placeholders/service-real-estate-development.svg" },
    { key: "consultancy", label: "Consultancy", image: true, default: "/placeholders/service-consultancy.svg" },
    { key: "design-build", label: "Design–Build", image: true, default: "/placeholders/service-design-build.svg" },
    { key: "urban-planning-design", label: "Urban Planning & Design", image: true, default: "/placeholders/service-urban-planning-design.svg" } ] },
  { site: "corporate", page: "cta", title: "Corporate: closing call to action (shown above the footer)", fields: [
    { key: "title", label: "Heading (put ** ** around one phrase to emphasise it)", default: "Have a project to discuss? **Let\'s talk.**" },
    { key: "text", label: "Supporting line", long: true, default: "Tell us about your requirements and we will respond to your enquiry." },
    { key: "button", label: "Button text", default: "Let\'s talk" } ] },
  { site: "corporate", page: "about", title: "Corporate: About page", fields: [
    { key: "approach", label: "“How we work” paragraph", long: true, default: "We aim to combine skilled personnel, modern equipment and technology, and efficient project management, with a focus on quality and durability, health, safety and environmental responsibility, and client satisfaction." } ] },
  { site: "corporate", page: "hse", title: "Corporate: HSE page", fields: [
    { key: "intro", label: "Introduction", long: true, default: "Garnet Rockhill states a commitment to protecting its workforce, host communities and the environment on every project." } ] },
  { site: "homes", page: "banner", title: "Homes: site-wide banner", fields: [
    { key: "enabled", label: "Show banner (yes / no)", default: "no" }, { key: "text", label: "Banner text", default: "" }, { key: "link_text", label: "Link text (optional)", default: "" }, { key: "link_url", label: "Link address (optional)", default: "" } ] },
  { site: "homes", page: "home", title: "Homes: home page", fields: [
    { key: "hero_title", label: "Hero heading (put ** ** around one word to emphasise it)", default: "Find a home, plot or development you can **trust**." },
    { key: "hero_image", label: "Hero background image", image: true, default: "/placeholders/hero-homes.svg" },
    { key: "hero_text", label: "Hero paragraph", long: true, default: "Browse homes, land and developments from Rockhill Homes, a division of Garnet Rockhill Limited." },
    { key: "listings_title", label: "Latest listings heading", default: "Latest listings" },
    { key: "empty_text", label: "Text when no listings are published", long: true, default: "No properties are published yet. Please check back soon or contact us." } ] },
  { site: "homes", page: "about", title: "Homes: About page", fields: [
    { key: "body", label: "Main text", long: true, default: "We present homes, land and developments for sale, rent and lease. Listings are published only after the details have been entered and approved by our team." } ] },
];
export const defaultsFor = (site: Site, page: string) => Object.fromEntries((BLOCKS.find((b) => b.site === site && b.page === page)?.fields ?? []).map((f) => [f.key, f.default]));
/** Published text for a page, merged over defaults. Never throws: falls back to defaults. */
export async function getContent(site: Site, page: string): Promise<Record<string, string>> {
  const d = defaultsFor(site, page);
  try {
    const { data } = await publicDb().from("pages").select("content").eq("site", site).eq("key", page).eq("publish", "published").maybeSingle();
    const c = (data?.content ?? {}) as Record<string, unknown>;
    for (const k of Object.keys(d)) if (typeof c[k] === "string" && (c[k] as string).trim() !== "") d[k] = c[k] as string;
  } catch { /* defaults */ }
  return d;
}
