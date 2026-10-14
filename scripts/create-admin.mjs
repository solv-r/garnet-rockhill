// Creates the FIRST super admin. Run with:  npm run create-admin
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local. Asks for name, email and password.
import { createClient } from "@supabase/supabase-js";
import readline from "node:readline";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"); process.exit(1); }

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));
function askHidden(q) { // masks typing
  return new Promise((resolve) => {
    process.stdout.write(q); const out = rl.output; let muted = true;
    rl._writeToOutput = (s) => { if (!muted) out.write(s); else if (s.includes("\n") || s.includes("\r")) out.write("\n"); };
    rl.question("", (a) => { muted = false; resolve(a); });
  });
}

const db = createClient(url, key, { auth: { persistSession: false } });
const { count, error: cErr } = await db.from("staff_profiles").select("id", { count: "exact", head: true }).eq("role", "super_admin");
if (cErr) { console.error("Cannot reach the database or tables are missing:", cErr.message); process.exit(1); }
if (count) { console.error("A super admin already exists. Add more staff from /admin/staff."); process.exit(1); }

const name = (process.env.ADMIN_NAME || await ask("Full name: ")).trim();
const email = (process.env.ADMIN_EMAIL || await ask("Email: ")).trim();
const password = process.env.ADMIN_PASSWORD || await askHidden("Password (12+ characters): ");
rl.close();
if (!name || !email) { console.error("Name and email are required."); process.exit(1); }
if (password.length < 12) { console.error("Use a password of at least 12 characters."); process.exit(1); }

const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
if (error) { console.error(error.message); process.exit(1); }
const r = await db.from("staff_profiles").insert({ id: data.user.id, full_name: name, role: "super_admin" });
if (r.error) { await db.auth.admin.deleteUser(data.user.id); console.error(r.error.message); process.exit(1); }
console.log(`\nSuper admin created: ${email}\nSign in at /admin/login`);
