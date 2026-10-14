# Administrator guide
Sign in at `/admin/login` (on either address, e.g. `garnetrockhill.com/admin`). Sessions refresh automatically for about two weeks of activity. The menu shows only what your role allows.

| Role | Can do |
|---|---|
| Super admin | Everything, including Staff |
| Property manager | Properties, photos, locations; can read enquiries |
| Content editor | Projects, news, Site content, SEO, Settings |
| Lead handler | Enquiries (status, notes, retry) |

If you open something your role does not allow, you are sent to the Dashboard with a notice.

## Properties
- **Add:** Properties > **+ New property**. Fill title, category, transaction, status, location and description; add a price (leave empty to show "Price on request"). Fill only the details that apply (no bedrooms for land). Tick features. **Save**. Nothing is public until you Publish.
- **Photos:** after saving, use the **Photos** tab (also the *Photos > Manage* link in the property list). Upload JPEG, PNG or WebP up to 6 MB each; use *Move earlier / Move later* to reorder, *Make cover* to pick the cover, add alt text and a caption, or delete. Photos are resized, converted to WebP and stripped of location data automatically.
- **Preview:** the **Preview** tab shows exactly how the public page will look, even for drafts.
- **Publish / unpublish / archive:** buttons at the bottom of the Details tab. Publishing needs a description. Drafts and archived listings are never public.
- **Change price or status quickly:** in the property list, change the status and price on the row and press Save. Mark properties *sold*, *rented* or *leased* when done: they stop showing as available and are hidden from search engines.
- **Delete:** only for unpublished listings; type the reference to confirm. This removes the photos too.
- **Location privacy:** the public map shows neighbourhoods only. Exact addresses are never shown; share them with customers yourself.

## Locations
Admin > **Locations** shows places as a tree: **state > city > area (neighbourhood)**, with the number of properties in each. Click a row's **Edit** to:
- **Change** the name, the parent (the city an area belongs to, or the state a city belongs to) and the map point. The web address (slug) stays the same, so existing links and filters keep working.
- **Delete** it: tick the confirmation box and press Delete. Deleting is refused, with a clear message, while the location still has properties or sub-locations; move or delete those first.
- **Add** a new state, city or area with the form at the top. An area must belong to a city and a city to a state. If you enter coordinates, enter both latitude and longitude (neighbourhood centre, never a house). Locations without a map point are still usable but do not show on the map.

## Enquiries
Enquiries: search by name, phone, email or reference; filter by status or website. Each card shows whether the team notification and the customer acknowledgement were sent. If the team notification failed, press **Retry team notification**. Lead handlers set the status (new, contacted, follow-up, viewing arranged, converted, closed) and write internal notes, which are never public. Every enquiry is saved before any email is attempted.

## Site content (text, banners, pictures)
Site content: change headings, paragraphs, the site-wide **banner** (set "Show banner" to yes), the hero pictures, the mission picture, the service pictures and the **closing call to action** shown above the footer on corporate pages that have no form. **Save draft** keeps changes private; **Publish** makes them live; **Discard draft** throws them away. Leave a box empty to use the original wording. Links must start with `https://` or `/`.

**Emphasising a word:** in the hero headings and the closing call to action, put two asterisks around the word or phrase you want highlighted, for example `Built on **quality**. Delivered with care.`

## Settings (contact details)
Settings: phone, email, WhatsApp number (digits with country code), address and the default WhatsApp message, separately for Garnet Rockhill and Rockhill Homes. Empty means "use the default". Changes appear in headers, footers, contact pages and WhatsApp links.

## SEO
SEO: for each main page set the title, description, canonical address, social sharing text and image, and "hide from search engines". Empty means default. Articles and projects have their own SEO box; property pages are generated from the listing.

## Projects and news
- **Projects:** Projects & news > New project. Add photos. Tick **verified** only for real company work; only verified projects can be published.
- **News:** write the article, add a cover image, save as a draft, use **open preview**, then tick **Published**.

## Staff (super admin)
Staff: create accounts with a temporary password of 12+ characters, change roles, or untick **Active** to remove access. You cannot demote or deactivate yourself.

## Form delivery
Contact, viewing and feedback forms are saved in Enquiries and sent to your email through Formspree (and optionally Resend). The Formspree form IDs are set in the hosting settings, not in the admin. See `docs/DEPLOYMENT.md`.
