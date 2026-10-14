# Full deployment guide: from your PC to a live website

Follow in order. Tick each step. Nothing here has been done for you: each step needs your own accounts. Provider prices and limits below were checked on 10 October 2026 from public pages and third-party summaries; **confirm each on the provider's own pricing page before paying**.

## 0. Decide the plan (important)
| Part | Recommended | Why / cost (confirm live) |
|---|---|---|
| Hosting for the website | **Vercel Pro** (about US$20 per month per seat, reported) | Vercel's free "Hobby" plan is for non-commercial personal use only; a company website needs Pro. Any Node.js host is possible instead (Netlify, Render, a VPS); the steps differ. |
| Database, sign-in, photo storage | **Supabase Pro** (about US$25 per month, reported) | Free plan projects pause after 1 week of inactivity and have no automatic backups (reported). Pro removes the pause and adds daily backups kept 7 days. Free is fine for testing only. |
| Form delivery | **Formspree Free** to start | Reported 50 submissions per month on the free plan. Paid plans start around US$10-15 per month. Every enquiry is **also saved in your dashboard**, so nothing is lost if the free limit is reached; only the email copy stops. |
| Map | **OpenFreeMap** (free) | No key, no request limits, commercial use allowed, attribution shown automatically. No support guarantee. |
| Domain | any registrar | Yearly fee. |
| Email acknowledgements to customers (optional) | Resend free tier | Needs a verified sending domain. Without it, customers see an on-screen confirmation only. |

Typical running cost: roughly US$45 per month plus the domain. You can launch a trial on free tiers, but do **not** treat Supabase Free as production.

## 1. Prepare the code
1. Finish local testing (`docs/LOCAL_SETUP.md` and `docs/SUPABASE_TEST_SCRIPT.md`).
2. Replace placeholders (`docs/PLACEHOLDER_PHOTOS.md`) and review the text (`docs/UPDATING_THE_SITE.md`).
3. Make sure `npm run typecheck`, `npm test` and `npm run build` pass.
4. Create a **private** repository on GitHub (https://github.com). In the project folder run:
   `git init`, `git add .`, `git commit -m "Initial site"`, then the "push an existing repository" commands GitHub shows. `.gitignore` already excludes `.env.local` and `node_modules`. **Check that no keys were committed.**

## 2. Create the production Supabase project
1. https://supabase.com > New project. Choose a strong database password (save it in a password manager) and the region closest to Nigeria that is offered. Choose **Pro** when you are ready for production.
2. Build the database. Either:
   - **SQL Editor:** open and run, one at a time and in this order: `supabase/migrations/0001_init.sql`, `0002_storage.sql`, `0003_content_feedback.sql`, then `supabase/seed.sql` (categories, features, Abuja and Lagos only); or
   - **CLI from your PC:** `npx supabase login`, `npx supabase link --project-ref YOUR_REF`, `npx supabase db push`, then paste `seed.sql` into the SQL Editor.
   **Never** load anything from `supabase/dev` or `supabase/tests` into production.
3. Check **Storage**: buckets `property-images` and `site-media` exist and are public.
4. **Authentication > Sign In / Providers > Email:** turn **off** "Allow new users to sign up". Staff are created only by you.
5. **Project Settings > API:** copy the Project URL, the anon (publishable) key and the service-role (secret) key. The service-role key is a master key: never put it in a public place.

## 3. Create the Formspree forms
1. https://formspree.io > create an account > **New form** twice: "Garnet Rockhill website" and "Rockhill Homes website". Set the notification email(s) in each form's settings.
2. Copy each form's ID (the part after `/f/` in its endpoint).
3. Submissions are sent from the server (not the visitor's browser). **Test this for real** in step 8; if Formspree rejects server-side posts for your plan, the enquiry is still saved in the admin and the failure is shown there.

## 4. Deploy on Vercel
1. https://vercel.com > sign up with GitHub > **Add New > Project** > import the repository. Framework: Next.js (auto-detected). Upgrade the team to **Pro**.
2. Open **Settings > Environment Variables** and add (Production):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role / secret key (server only; never prefix with NEXT_PUBLIC) |
| `CORPORATE_URL` | `https://garnetrockhill.com` |
| `HOMES_URL` | `https://homes.garnetrockhill.com` |
| `FORMSPREE_FORM_ID_CORPORATE` | corporate form ID |
| `FORMSPREE_FORM_ID_HOMES` | Homes form ID |
| `CONTACT_PHONE`, `CONTACT_EMAIL`, `CONTACT_WHATSAPP`, `CONTACT_ADDRESS` | confirmed company details (later editable in Admin > Settings) |
| `LEGAL_REVIEWED` | `false` for now |
| `RESEND_API_KEY`, `NOTIFY_FROM`, `NOTIFY_TO` | optional, for customer acknowledgements and email backup |

3. Click **Deploy**. When done, open the temporary `*.vercel.app` address and check the corporate site loads.

## 5. Create the first administrator
1. On your PC, edit `.env.local` so it contains the **production** `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (temporarily).
2. Run `npm run create-admin`, and enter your name, email and a long password (12+ characters).
3. **Restore** `.env.local` to your local values (or delete the production keys from it).
4. Later, add other staff in Admin > Staff.

## 6. Register the domain and connect it
1. Register `garnetrockhill.com` (not yet registered at the time of writing; check availability) with your chosen registrar. Turn on the registrar's lock and, if offered, auto-renew.
2. In Vercel > your project > **Settings > Domains**, add three domains: `garnetrockhill.com`, `www.garnetrockhill.com` (set to **redirect** to `garnetrockhill.com`) and `homes.garnetrockhill.com`.
3. Vercel shows the exact DNS records needed for each. **Copy them exactly from Vercel's screen** into your registrar's DNS settings (normally an A record for the main domain and CNAME records for `www` and `homes`). Do not use values from anywhere else; they can change.
4. Wait for DNS to update (minutes to a few hours). Vercel shows "Valid Configuration" and issues HTTPS certificates automatically.
5. Confirm https://garnetrockhill.com shows the corporate site and https://homes.garnetrockhill.com shows Rockhill Homes (same project, different address).
6. Make sure `CORPORATE_URL` and `HOMES_URL` (step 4) use the final `https://` addresses, then **Redeploy** so sitemaps and canonical links are correct.

## 7. Set up the content
Sign in at https://garnetrockhill.com/admin and:
1. **Settings:** check phone, email, WhatsApp and address for each brand.
2. **Site content:** edit headings and banners; upload real hero and service pictures; **Publish**.
3. **Locations:** add neighbourhoods with approximate (area-level) coordinates so listings appear on the map.
4. **Properties:** create real listings with photos (Details tab, then Photos tab). Publish only verified listings.
5. **Projects and news:** add only verified projects (tick "verified") and real articles.
6. **SEO:** adjust titles and descriptions of key pages.

## 8. Test the live site (do not skip)
- Submit a contact enquiry, a feedback form and a viewing request on both sites. Each must show a confirmation, appear in Admin > Enquiries, and (if Formspree is configured) arrive in your email. The enquiry row shows whether the team notification was sent; use **Retry team notification** if not.
- Check pages on a phone, the map page, property filters, a sold listing (must show unavailable), and that a draft listing is not reachable.
- Sign in as each staff role you created and confirm they only see what they should.
- Follow `docs/LAUNCH_CHECKLIST.md`.

## 9. Legal review
Have a Nigerian lawyer review the Privacy Policy, Terms, Cookie notice and Listing disclaimer (text is in `src/components/Legal.tsx`). When approved, set `LEGAL_REVIEWED=true` in Vercel and redeploy to remove the "draft" notice.

## 10. Search engines
1. https://search.google.com/search-console > add both `garnetrockhill.com` and `homes.garnetrockhill.com` (verify by DNS record or HTML tag).
2. Submit `https://garnetrockhill.com/sitemap.xml` and `https://homes.garnetrockhill.com/sitemap.xml`.
3. Rankings cannot be guaranteed; good content and real listings matter most.

## 11. Backups and monitoring
- Supabase Pro keeps daily backups for 7 days (reported). Also take your own copy monthly: Supabase > Database > Backups, or `pg_dump` with the connection string; download the two Storage buckets. Test a restore on a scratch project once.
- Watch **Vercel > Logs** for errors and **Admin > Enquiries** for "not sent" notifications.
- Add a free uptime monitor of your choice for both addresses.
- Calendar reminders: renew the domain, review costs, update dependencies monthly.

## 12. Updating the live site later
- **Content:** use the admin; no deployment needed.
- **Code or design changes:** change locally, test, `git push`; Vercel redeploys automatically. Use Vercel's **Instant Rollback** if something breaks.
- **Database changes:** new numbered files in `supabase/migrations` must be run on production (SQL Editor or `npx supabase db push`) **before** deploying code that needs them.

## What can go wrong
| Problem | Likely cause and fix |
|---|---|
| Site shows "could not be loaded" | Wrong Supabase keys/URL in Vercel, or the Supabase project is paused (free plan). |
| Enquiry saved but no email | Formspree ID missing/placeholder, or free limit reached. Admin shows the reason. |
| `homes.` address shows the corporate site | The domain is not added to the same Vercel project, or DNS not finished. |
| Photos fail to upload | Migration 0002 not applied, or file too large/wrong type. |
| Map blank | Check the browser can reach `tiles.openfreemap.org`; property areas need coordinates. |
| Staff cannot sign in | Account missing in Staff, deactivated, or wrong password. |
