# Cost and maintenance summary
Prices below were checked on **10 October 2026** from public pages and third-party summaries. **Confirm each on the provider's own pricing page before paying**, as they change.

| Item | Chosen provider | Cost (reported) | Limits and when to upgrade |
|---|---|---|---|
| Domain | any registrar | yearly fee | Renew each year. |
| Website hosting | **Vercel** | Free "Hobby" plan is **non-commercial only** (Vercel's fair-use guidelines), so a company website needs **Pro (about US$20/month per seat)** | Upgrade trigger: going live commercially (immediately). Alternatives: other Node hosts or a VPS (not evaluated here). |
| Database, sign-in, photos | **Supabase** | Free: US$0. **Pro: about US$25/month** plus usage | Free: 500 MB database, 1 GB file storage, 5 GB egress; **projects pause after 1 week of inactivity; no automatic backups**. Pro: 8 GB database, 100 GB storage, 250 GB egress, no pausing, daily backups kept 7 days. Use Pro for production. Photo-heavy sites reach the 1 GB storage limit first. |
| Form email delivery | **Formspree** | Free: US$0 (about 50 submissions/month reported). Paid plans from about US$10-15/month | Enquiries are always saved in the dashboard; if the free limit is reached the email copy stops and the dashboard shows "not sent". Upgrade, or use Resend as backup. |
| Customer acknowledgement email (optional) | Resend | Free tier exists (limits not verified) | Needs a verified sending domain. |
| Map tiles | **OpenFreeMap** | Free, no key, no request limits, commercial use allowed, attribution shown automatically | No SLA or support guarantee. Can self-host or switch to another MapLibre-compatible provider with `MAP_STYLE_URL`. |
| Map library | MapLibre GL | Free, open source | |
| Anti-spam | built in (honeypot, duplicate guard, per-instance rate limit) | free | Rate limit is per server instance (weak on serverless). Add Cloudflare Turnstile or Upstash Redis if spam appears. |
| Error monitoring, uptime monitor | not integrated | free tiers exist | Optional. |

**Typical running cost:** roughly US$45 per month (Vercel Pro + Supabase Pro) plus the domain; Formspree free. One-time: domain registration (and any legal review).

## Maintenance
- Monthly: `npm outdated`, `npm audit`, update, run `npm run typecheck && npm test && npm run build`, redeploy.
- Monthly: download a database export and the two storage buckets; test a restore once on a scratch project.
- Weekly: look at Admin > Enquiries for "not sent" items.
- Yearly: renew the domain; review provider prices and limits.
- Rotate keys if they are ever exposed; deactivate departed staff immediately.
