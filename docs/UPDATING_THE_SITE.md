# Updating the site before deployment

Two kinds of change: **content in the admin** (no code) and **text/design in the code**. After any code change, the browser reloads automatically while `npm run dev` is running.

## Changes in the admin (no coding)
Properties and photos, prices, statuses, locations, projects, news, **headings/paragraphs/banners/hero and service pictures (Site content)**, **contact details (Settings)**, **SEO**, staff. See `docs/ADMIN_GUIDE.md`. Placeholder pictures: `docs/PLACEHOLDER_PHOTOS.md`.

## Changes in code
| To change | Edit this | Notes |
|---|---|---|
| Phone, email, WhatsApp, address | Admin > **Settings** (per brand). Fallback defaults come from `.env.local` / host settings | WhatsApp is digits only, e.g. `2349036666987`. |
| Service descriptions, mission, vision, values | `src/lib/corporate-content.ts` | Only state capabilities the company has confirmed. |
| Home headings, banners, hero text | Admin > **Site content** (defaults live in `src/lib/siteContent.ts`) | |
| About, HSE, Sectors text | `src/app/(corp)/about/page.tsx`, `hse/page.tsx`, `sectors/page.tsx` | |
| Homes hero text, search box | `src/app/homes/page.tsx` | |
| About Rockhill Homes | `src/app/homes/about/page.tsx` | |
| Menus and footers | `src/app/(corp)/layout.tsx` (corporate), `src/app/homes/layout.tsx` (Homes) | |
| Logos | Replace files in `public/brand/` (`garnet-rockhill.png`, `rockhill-homes.png`) keeping the same names | Use PNGs with transparent background; a darker Garnet Rockhill logo reads better on white. |
| Colours and fonts | `src/styles/tokens.css` | Each brand has its own block. The accent colours are proposals until approved. |
| Privacy, Terms, Cookies, Disclaimer | `src/components/Legal.tsx` | Fill the `[...to be confirmed]` placeholders and have a lawyer review. |
| Page titles/descriptions | `export const metadata` at the top of each page file | Articles and projects use the SEO box in the admin. |
| Property categories, features | Database: Studio > Table Editor (`property_categories`, `features`) or `supabase/seed.sql` for new installs | |

## Adding a page
Corporate: create `src/app/(corp)/your-page/page.tsx`. Homes: `src/app/homes/your-page/page.tsx`. Copy a small existing page such as `about/page.tsx`, change the text, and add a link in the layout file. For Homes pages also add the path to `src/app/sitemap.ts`.

## Check your changes
```
npm run typecheck
npm test
npm run build
```
All three should finish without errors. `npm run build` is what the host runs, so if it passes locally the deploy should too.

## Photos and real content checklist
- Replace placeholder text; make sure nothing says "to be confirmed" on public pages.
- Add only verified projects (tick "verified").
- Add real listings with the owner's approval; confirm prices and availability.
- Remove all `[TEST]` data.

## Before deployment
Complete `docs/OUTSTANDING_INPUTS.md` and `docs/LAUNCH_CHECKLIST.md`, then follow `docs/DEPLOYMENT.md`.
