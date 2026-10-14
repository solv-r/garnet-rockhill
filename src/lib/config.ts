import { publicDb } from "./supabase";
export type Site = "corporate" | "homes";
// Environment values are the fallback; the admin "Settings" page stores per-brand overrides in the site_settings table.
const env = {
  phone: process.env.CONTACT_PHONE ?? "+2349036666987",
  email: process.env.CONTACT_EMAIL ?? "garnetrockhill@gmail.com",
  whatsapp: process.env.CONTACT_WHATSAPP ?? "2349036666987",
  address: process.env.CONTACT_ADDRESS ?? "Suite 60/63 Block C, New Extension, EFAB Mall, Area 11, Abuja, FCT, Nigeria",
};
export type Contact = { phone: string; email: string; whatsapp: string; address: string; whatsapp_message: string };
export const contact = env; // legacy sync default (env only)
export const urls = {
  corporate: process.env.CORPORATE_URL ?? "http://localhost:3000",
  homes: process.env.HOMES_URL ?? "http://homes.localhost:3000",
};
export const SETTING_KEYS = ["phone", "email", "whatsapp", "address", "whatsapp_message"] as const;
export async function getContact(site: Site): Promise<Contact> {
  const base: Contact = { ...env, whatsapp_message: site === "homes" ? "Hello Rockhill Homes, I would like to make an enquiry." : "Hello Garnet Rockhill, I would like to make an enquiry." };
  try {
    const { data } = await publicDb().from("site_settings").select("key, value").eq("site", site).in("key", [...SETTING_KEYS]);
    for (const r of data ?? []) if (r.value && r.value.trim()) (base as Record<string, string>)[r.key] = r.value.trim();
  } catch { /* fall back to env */ }
  return base;
}
export function whatsappLink(message: string, number: string = env.whatsapp) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
