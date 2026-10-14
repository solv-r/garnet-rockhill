# Testing report (10 October 2026)
Environment: Postgres 16 + PostgREST 12.2.3 on a developer machine, with minimal stand-ins for Supabase's `auth` and `storage` schemas, and (for admin tests) a small fake of Supabase Auth and Storage. This is **not** a real Supabase project, Vercel deployment, or browser.

## Passed
| Check | Result |
|---|---|
| `tsc --noEmit` (type check) | No errors |
| `next build` (production build) | Succeeds |
| Unit tests (`npm test`) | 20 passed: price formatting, enquiry validation, WhatsApp links, image validation and metadata stripping, host routing, admin session refresh, rate limit, content registry, placeholder/Formspree-ID handling |
| Integration tests (`npm run test:integration`) | 33 passed against a real database: every search filter alone and combined, sorting, pagination, out-of-range page, features (all must match), sold/draft exclusion, detail query, map pins (one per area, no private coordinates), enquiry save-first, duplicate-submit guard, spam trap, rate limit, Formspree success/failure/placeholder handling and payload, Resend fallback and customer acknowledgement, feedback kind, draft vs published content, per-brand contact settings, SEO overrides |
| SQL security tests (`supabase/tests`) | Public sees only published rows; no public access to enquiries or exact coordinates; per-role read/write limits; inactive staff blocked; demo rows and unverified projects cannot be published; bad data rejected |
| Admin end-to-end (`tests/e2e`, 96 checks) | Real admin pages and forms submitted to a production build as 4 different roles: property create/edit/publish/unpublish, photo upload (full + thumbnail), reject disguised file, reorder, cover, alt text, delete, preview of drafts, quick status/price edit, delete safeguard, role denial on every sensitive action, site content draft/publish/banner/hero upload, contact settings per brand, SEO overrides and noindex, enquiries (status, notes, retry), locations, projects (verified rule), news (draft, preview, publish), staff roles and self-lockout guard, **location add/edit/delete rules**, and the redesigned public pages (search pills, featured listing, counts, menus, filter chips) |
| Smoke test of ~40 URLs on both hostnames | Correct status codes; 404 page; per-host sitemap and robots; placeholders, thumbnails, legal text and map style present |

## Bugs found and fixed by testing
Browser console error "Cannot specify a encType or method for a form that specifies a function as the action" (removed from four admin forms; only visible in a real browser), map CSS import failing to resolve (CSS is now bundled in the project), no way to edit or delete locations (added), property page query failures (self-referencing join), out-of-range page error, unreachable spam-trap branch, bare 500 error for denied roles (now a friendly redirect), property editor wrongly open to non-managers (now property managers only), contact form kinds, stale test data between suites.

## NOT tested (needs real accounts, browser or devices)
- **Real Supabase Auth** (sign-in, password creation, token refresh, "Add staff"): faked in tests. The `create-admin` script and Staff > Create account call Supabase's admin API and have not run against a real project.
- **Real image storage** (uploads were verified to be sent to the storage API, not stored).
- **Real Formspree and Resend delivery:** only simulated. Formspree accepts server-side JSON posts per its documentation, but confirm with a real test submission.
- Local Supabase CLI/Docker commands (you ran Docker successfully; commands in the guide follow documented usage).
- Map rendering in a browser; mobile and tablet layouts; keyboard and screen-reader accessibility; Lighthouse performance.
- Deployment, DNS and HTTPS; backup restore.
