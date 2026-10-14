# Outstanding inputs and decisions (before launch)
**You must supply**
- Real photos (replace placeholders: `docs/PLACEHOLDER_PHOTOS.md`); verified project list and photos (the profile PDF's photos have not been confirmed as company projects).
- Real property listings, descriptions, prices and neighbourhood coordinates; confirm owner approval.
- Confirmed phone, email, WhatsApp for each brand (currently both use the profile's details) and whether a Gmail address is acceptable.
- Real Formspree form IDs (two forms), Supabase production project, Vercel account, domain registration.
- Leadership names/biographies/photos, only if you want them shown (none are used).
- Confirmation of any professional registrations for Urban Planning & Design, and of bridge-construction capability.
- Brand decisions: approve the accent colours (garnet red / gold are proposals) and supply a darker, higher-contrast Garnet Rockhill logo if possible.
- A Nigerian lawyer's review of `src/components/Legal.tsx`, then set `LEGAL_REVIEWED=true`.
- Decide on analytics (none installed) and on a customer-acknowledgement email provider (Resend optional).

**Known limits of this version (not built)**
- Lead status options are fixed (not configurable); no URL-redirect manager (slugs are stable); no per-property approximate map pins (neighbourhood pins by design); no drafts/preview for Site content (article and property previews exist); no automatic WhatsApp messaging or online booking/payments (links and enquiries only, as specified).
- Rate limiting is per server instance.
- No accessibility audit (screen-reader/keyboard testing) or Lighthouse run has been done.
