# Local setup guide (Windows or Mac)

You will run the whole platform on your own PC: the two websites, the admin, and a **private local database** (Supabase running in Docker). Nothing touches the internet or any live data. Allow about 60 minutes the first time.

> Honest note: the app and database were tested on Postgres/PostgREST. I could not run Docker or the Supabase CLI myself, so the CLI commands below follow its documented usage. If a command prints something different, send me the exact message.

## 1. Install the tools (one time)
1. **Node.js 20 LTS or newer**: https://nodejs.org (choose LTS). Check: open a terminal and run `node -v` (must show v20.6 or higher).
2. **Docker Desktop**: https://www.docker.com/products/docker-desktop (on Windows, accept the WSL 2 option and restart if asked). Start Docker Desktop and wait until it says it is running.
3. **VS Code** (recommended editor): https://code.visualstudio.com
4. A modern browser (Chrome or Edge).

## 2. Open the project
1. Unzip `rockhill-platform.zip` to a folder with a short path, e.g. `C:\Projects\rockhill-platform`.
2. Open the folder in VS Code, then **Terminal > New Terminal**. All commands below run in that terminal, inside the project folder.

## 3. Install the project's packages
```
npm install
```
Expect it to finish without red errors (warnings are fine).

## 4. Start the local database
```
npx supabase init
```
If it asks about VS Code / IntelliJ settings, answer **n**. This creates `supabase/config.toml` and keeps the migrations already in the folder.
```
npx supabase start
```
The first run downloads several Docker images and can take 5-10 minutes. When finished it prints a list of local URLs. Then build the tables and load the starter data (categories, features, Abuja and Lagos):
```
npx supabase db reset
```
Expect it to apply the three migrations (0001, 0002, 0003) and then seed data from `supabase/seed.sql`.

Useful local addresses:
- Database dashboard (Studio): http://127.0.0.1:54323
- API: http://127.0.0.1:54321

Stop it later with `npx supabase stop`; start again with `npx supabase start` (your data is kept).

## 5. Configure the app
1. Copy the template:
   - Windows PowerShell: `copy .env.local.example .env.local`
   - Mac/Linux: `cp .env.local.example .env.local`
2. Get your local keys: `npx supabase status -o env`
3. Open `.env.local` and paste:
   - `ANON_KEY` value into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SERVICE_ROLE_KEY` value into `SUPABASE_SERVICE_ROLE_KEY`
   (If your CLI shows newer "publishable/secret" keys instead, either style works. Use the publishable key as the anon key and the secret key as the service-role key.)
4. Leave the rest as is for now. These local keys only work on your PC.

**Never put the service-role/secret key in any file named `NEXT_PUBLIC_...` and never share it.** `.env.local` is already excluded from git.

## 6. Run the websites
```
npm run dev
```
- Corporate site: http://localhost:3000
- Rockhill Homes: http://homes.localhost:3000 (Chrome and Edge resolve `*.localhost` automatically. If your browser cannot open it, add the line `127.0.0.1 homes.localhost` to your hosts file.)
- Admin: http://localhost:3000/admin (also works on the homes address)

## 7. Create your admin account
Open a **second** terminal (leave `npm run dev` running) in the project folder:
```
npm run create-admin
```
Enter your name, email, and a password of 12+ characters. Then sign in at http://localhost:3000/admin/login.

## 8. Add content to see the site working
**Option A (real way):** in the admin, Locations > add an area (e.g. Maitama, with an approximate latitude/longitude), then Properties > New property, add photos, Publish.

**Option B (fast preview):** load clearly fictional **[TEST]** listings. Open Studio (http://127.0.0.1:54323) > **SQL Editor** > New query, paste the contents of `supabase/dev/LOCAL_TEST_LISTINGS.sql`, Run. Delete them later with `supabase/dev/LOCAL_TEST_LISTINGS_REMOVE.sql`. **Never run these on your live database.**

## 9. Test the database and the app
**a) Look at the data.** Studio > Table Editor: check `properties`, `property_images`, `enquiries` update as you use the site.

**b) Quick automated tests** (no database needed):
```
npm run typecheck
npm test
```
Expect: no type errors; 20 tests pass.

**c) Full automated tests against your local database (optional).** These need a known data set and **delete all properties first**, so only do this on a scratch database:
1. `npx supabase db reset`
2. Studio > SQL Editor: paste and run `supabase/tests/integration_data.sql`
3. `npm run test:integration` (expect 33 tests to pass).
4. `npx supabase db reset` again to return to a clean state.

**d) Manual walk-through.** Follow `docs/SUPABASE_TEST_SCRIPT.md` step by step. This is the most important test because it exercises the admin, which is the part not yet proven.

**e) Security spot checks** (Studio > SQL Editor): run `select count(*) from enquiries;` as the default role to see rows; the website, using the public key, must never return enquiries or exact addresses. The page source of any property page must not contain the exact address you entered in the private fields.

## 10. Configure for your business
- **Contact details:** edit `CONTACT_*` in `.env.local`; restart `npm run dev`.
- **Map:** uses free OpenFreeMap tiles by default (no key). Nothing to configure.
- **Forms:** leave the `YOUR_FORMSPREE_ID...` placeholders locally. Enquiries are still saved and the admin shows "Email not configured". To test delivery, create a free Formspree account, make two forms, and put their IDs in `FORMSPREE_FORM_ID_CORPORATE` and `FORMSPREE_FORM_ID_HOMES`. Restart `npm run dev`.
- **Photos and placeholders:** see `docs/PLACEHOLDER_PHOTOS.md`. **Text, banners, contact details and SEO** can be edited in the admin (Site content, Settings, SEO). **Logos, colours, legal text:** see `docs/UPDATING_THE_SITE.md`.

## 10b. After you replace the project files with a newer zip
Always run `npm install` again (new packages may have been added, for example the map library), then restart `npm run dev`. If you also changed the database setup files, run `npx supabase db reset` (this erases local data; re-create your admin with `npm run create-admin`).

## 11. Troubleshooting
| Problem | Fix |
|---|---|
| `supabase start` fails or hangs | Make sure Docker Desktop is running; free ports 54321-54324; try `npx supabase stop` then start again. |
| Pages show "could not be loaded" | Database not running, or keys in `.env.local` wrong. Run `npx supabase status` and re-copy the keys; restart `npm run dev`. |
| `npm run create-admin` says tables are missing | Run `npx supabase db reset` first. |
| `node: bad option: --env-file` | Node is too old; install Node 20.6+. |
| Photos fail to upload | Check migration `0002_storage.sql` applied (Studio > Storage shows `property-images`), and the file is JPEG/PNG/WebP under 6 MB. |
| `homes.localhost` does not open | Use Chrome/Edge, or add the hosts-file line above. |
| Changed `.env.local` but nothing changed | Stop and restart `npm run dev`. |
| "Module not found" for a package such as `maplibre-gl` | You updated the files but did not run `npm install`. Run it, then restart `npm run dev`. |
| Start fresh | `npx supabase db reset` wipes the local database and re-applies migrations and seed. |

## 12. Going live later
1. Create a hosted Supabase project. Locally linked: `npx supabase login`, `npx supabase link --project-ref YOUR_REF`, `npx supabase db push` (applies the migrations). Then paste `supabase/seed.sql` into the hosted SQL Editor. **Do not** load any `[TEST]` or integration data.
2. Follow `docs/DEPLOYMENT.md` and `docs/LAUNCH_CHECKLIST.md`.
