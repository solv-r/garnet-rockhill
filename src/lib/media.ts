// Pure helpers (safe in server and client code).
export const thumb = (path: string) => path.replace(/\.webp$/, "-sm.webp");
export const publicUrl = (bucket: "property-images" | "site-media", path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
