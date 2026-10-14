import { publicDb, serviceDb } from "./supabase";
export const PROPERTY_SELECT =
  "*, location:locations(name, slug, public_lat, public_lng, parent_id), category:property_categories(slug, name, uses_bedrooms, uses_plot_size)," +
  "images:property_images!property_images_property_id_fkey(id, storage_path, alt_text, caption, sort_order), property_features(feature:features(name))";
export async function loadProperty(slug: string) {
  const { data, error } = await publicDb().from("properties").select(PROPERTY_SELECT).eq("slug", slug).eq("publish", "published").maybeSingle();
  if (error) console.error("loadProperty", error.message);
  const p = data as any; // eslint-disable-line
  // Self-referencing embeds are ambiguous in PostgREST (they resolve to the child direction), so fetch the parent explicitly.
  if (p?.location?.parent_id) {
    const { data: parent } = await publicDb().from("locations").select("name").eq("id", p.location.parent_id).maybeSingle();
    p.location.parent = parent ?? null;
  }
  return p;
}

/** Staff preview: loads ANY listing (including drafts) by id. Server-only; callers must check the role first. */
export async function loadPropertyForPreview(id: string) {
  const { data } = await serviceDb().from("properties").select(PROPERTY_SELECT).eq("id", id).maybeSingle();
  const p = data as any; // eslint-disable-line
  if (p?.location?.parent_id) { const { data: parent } = await serviceDb().from("locations").select("name").eq("id", p.location.parent_id).maybeSingle(); p.location.parent = parent ?? null; }
  return p;
}
