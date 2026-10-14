# First real-environment test (about 45 minutes)

Goal: prove the admin and the public sites work on a real Supabase project. Use a **test** project, not the final one. Write down any step that does not match "Expect".

## A. Setup
1. Create a Supabase project. In **SQL Editor** run, one at a time: `supabase/migrations/0001_init.sql`, `0002_storage.sql`, `supabase/seed.sql`. Expect: no errors; Storage shows buckets `property-images` and `site-media`.
2. Copy the Project URL, anon key and service-role key (Project Settings > API) into `.env.local` (see `.env.example`). Never share the service-role key in chat.
3. `npm install`, then `npm run dev`.
4. Create the first admin: run `scripts/create-admin.mjs` with the variables in its header. Expect: "Super admin created".

## B. Admin checks (open http://localhost:3000/admin)
| # | Do | Expect |
|---|---|---|
| 1 | Open /admin while signed out | Redirect to sign-in |
| 2 | Sign in with a wrong password | Generic failure message |
| 3 | Sign in correctly | Dashboard with all counts at 0 |
| 4 | Locations: add area "Maitama" under Abuja with an approximate latitude/longitude | Appears in the list |
| 5 | Properties > New: fill required fields, price, description, 2 features; Save | "Saved", reference like RH-000001 |
| 6 | Open the **Photos** tab of the property (or the Photos > Manage link in the list); upload 3 photos (one large JPEG, one PNG) | All appear; first is Cover |
| 7 | Upload a text file renamed to .jpg | Rejected with a message |
| 8 | Reorder photos, make another the cover, add alt text, delete one | Each change persists after refresh |
| 8b | Open the **Preview** tab | The page shows with a "Preview" notice |
| 9 | Publish | Status shows published |
| 10 | Staff: add a "lead handler" account; sign in as them in a private window | They see enquiries, but cannot open /admin/properties/new to save (error) or /admin/staff |
| 11 | As the lead handler, change an enquiry status and add a note | Persists |

## C. Public checks (open Homes at http://homes.localhost:3000)
| # | Do | Expect |
|---|---|---|
| 1 | Home and /properties | Your property appears with cover photo and ₦ price |
| 2 | Filter by location, price, bedrooms; sort price | Results change correctly |
| 3 | Open the property page | Photos, features, area name only (no exact address), WhatsApp link mentions the reference |
| 4 | Submit a viewing request with a phone number | Success message with ENQ reference; it appears in /admin/enquiries |
| 5 | Submit the same form twice quickly | Only one enquiry |
| 6 | In admin set status to Sold | Property page says not available; gone from search |
| 7 | Unpublish | Property page 404s |
| 8 | /map | A pin for Maitama listing the property |
| 9 | Check on a phone-sized window | No horizontal scrolling; forms usable |

## D. Corporate checks (http://localhost:3000)
1. Projects & news > New article; save as draft; open the preview link; then publish. Expect it on /news.
2. New project: try to publish without ticking "verified". Expect a refusal. Tick it, add a photo, publish. Expect it on /projects.
3. Submit the Contact form; expect it in admin with source "corporate".
4. Click "Rockhill Homes" in the header and the homes footer link back; both should reach the other site.

## E. Editable content, settings and forms
1. Admin > **Site content**: change the corporate hero heading, **Save draft** (public page unchanged), then **Publish** (public page changes). Turn on the **banner** for Homes and check it appears there only.
2. Admin > **Settings**: change the Homes phone; check the Homes footer and contact page; corporate is unchanged.
3. Admin > **SEO**: set a title for /about; check the browser tab.
4. Submit the **Feedback** form on a contact page; it appears in Enquiries.
5. With no Formspree ID set, the enquiry shows "not sent (Email not configured)" and a **Retry** button. With real IDs set, the email arrives and the card shows "sent".

## Send back
The step numbers that failed, the exact message on screen, and (for server errors) the terminal output with any keys removed.
