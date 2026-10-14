# Architecture

One Next.js (App Router, TypeScript) project serves both brands and the admin. `src/middleware.ts` rewrites any `homes.*` hostname to `/homes/*`; the corporate site lives in `src/app/(corp)`; the admin is at `/admin` on either host.

| Concern | Choice | Notes |
|---|---|---|
| Database, auth, storage | Supabase (Postgres, Auth, Storage) | Row-level security; one login for both brands. |
| Hosting | Vercel (Pro for commercial use) | Any Node host works. |
| Forms | Saved first in the database, then sent to **Formspree** (server-side), with optional **Resend** as backup and for customer acknowledgements. Outcome recorded per enquiry; admin can retry. | `src/lib/notify.ts` |
| Maps | **MapLibre GL + OpenFreeMap** (free, no key) | One pin per neighbourhood; exact coordinates never leave the staff-only table. |
| Images | `sharp`: validated by file signature, resized to 2000 px WebP + 800 px thumbnail, metadata stripped | Public buckets. |
| Editable text/banners | `pages` table with draft/publish; registry in `src/lib/siteContent.ts` | Falls back to shipped copy. |
| Contact details | `site_settings` per brand, env fallback | `src/lib/config.ts` |
| SEO | `seo_meta` overrides + generated metadata, JSON-LD, per-host sitemap and robots | `src/lib/seo.ts` |
| Sessions | httpOnly cookies, token verified with Supabase on every request, refreshed in middleware | `src/lib/auth.ts`, `src/middleware.ts` |

## Data and privacy model
- Public pages use the anon key; RLS exposes only published rows. Enquiries and `property_private` have no public policy.
- Writes run in server code after `requireRole()`. The service-role key bypasses RLS, so these checks are the real gate; never expose that key.
- Status (`available`, `sold`...) is separate from transaction (`sale`, `rent`...). Demo rows can never be published; projects need `verified`.

## Roles
`super_admin` (everything, plus staff), `property_manager` (properties, photos, locations; read enquiries), `content_editor` (projects, news, content, SEO, settings), `lead_handler` (enquiries).
