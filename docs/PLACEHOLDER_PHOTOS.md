# Placeholder pictures and how to replace them

The site ships with simple **illustrated placeholders** (clearly labelled "Placeholder image") so layouts look complete before real photos exist. They are drawings, not photographs of real projects, and must be replaced before launch. Uploaded photos are automatically resized (max 2000 px), converted to WebP, given an 800 px thumbnail, and have location data (GPS) removed.

## Where each placeholder appears and how to replace it

| Where it appears | How to replace (no coding) | Fallback file (code route) |
|---|---|---|
| **Corporate home: big hero picture** | Admin > **Site content** > "Corporate: home page" > Hero background image > choose file > **Publish** | `public/placeholders/hero-corporate.svg` |
| **Corporate home: "Our mission" picture** (portrait, beside the mission statement) | Admin > **Site content** > "Corporate: home page" > Mission section picture > **Publish** | `public/placeholders/manifesto.svg` |
| **Corporate: the 5 service pictures** (home page, Services list, service pages) | Admin > **Site content** > "Corporate: service pictures" > replace each > **Publish** | `public/placeholders/service-*.svg` |
| **Corporate: project cards** | Admin > **Projects & news** > open/create a project > "Add photos" (tick *verified* to publish). Projects with no photo show the placeholder. | `public/placeholders/project.svg` |
| **Corporate: news cards** | Admin > **Projects & news** > open an article > "Cover image" | `public/placeholders/news.svg` |
| **Homes: big hero picture** | Admin > **Site content** > "Homes: home page" > Hero background image > **Publish** | `public/placeholders/hero-homes.svg` |
| **Homes: property cards and pages with no photos** | Admin > **Properties** > open the property > **Photos** tab (or click "Manage" in the *Photos* column of the property list) > Upload. The first photo is the cover; reorder and choose cover there. The placeholder disappears automatically once a property has photos. | `public/placeholders/property-house.svg`, `-apartment`, `-land`, `-commercial` |
| **Homes: "Browse by property type" tiles and "Explore cities" tiles** on the home page | These four tiles use the property placeholders. Replace the files below with your own pictures of the same name, or edit `src/lib/placeholders.ts` to point to new files (for example `.jpg`). | `public/placeholders/property-*.svg` |
| **Logos** (header and footer) | Replace `public/brand/garnet-rockhill.png` and `public/brand/rockhill-homes.png` (keep the file names). | |
| **Social sharing picture** | Admin > **SEO** > open a page > "Social sharing image address". Use a JPG or PNG address (social networks do not show SVG). | |

## Finding "Manage photos"
Photos are managed **per property**: Admin > **Properties**. In the list, the **Photos** column shows how many pictures each property has with a **Manage** link. Inside a property there are two tabs, **Details** and **Photos**. For a brand-new property, save the details first; the Photos tab then appears.

## Replacing a file in the code folder
1. Make your picture the same name and type as the placeholder (for example `hero-corporate.svg` becomes your own `hero-corporate.jpg`).
2. Put it in `public/placeholders/` (or `public/brand/` for logos).
3. If the file type changed (for example `.svg` to `.jpg`), update the path in `src/lib/placeholders.ts` (property and project pictures) or in the defaults in `src/lib/siteContent.ts` (hero and service pictures).
4. Check with `npm run dev`, then redeploy.

## Good photo guidelines
- Landscape (wide) photos; at least 1600 px wide; JPEG or PNG under 6 MB each.
- Hero pictures: about 1600 x 700 px or larger, with the subject away from the left side where text sits.
- Use only photographs you own or have permission to use. Do not use stock photos to suggest they are real company projects or real properties.
- Add a short **alt text** to each property photo (Photos tab) for accessibility.
