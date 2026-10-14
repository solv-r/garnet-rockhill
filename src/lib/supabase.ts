import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Public client: subject to RLS, only published data is readable.
export const publicDb = () => createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", { auth: { persistSession: false } });
// Server-only client: bypasses RLS. Import only from route handlers / server code.
export const serviceDb = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, key, { auth: { persistSession: false } });
};
