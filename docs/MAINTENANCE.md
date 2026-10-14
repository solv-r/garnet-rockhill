# Maintenance
- **Backups**: enable Supabase's backups for your plan (check what your plan includes) and also export the database periodically (`pg_dump` using the connection string from Supabase). Download the `property-images` and `site-media` buckets periodically. **Restore tests have not been performed**: do one before launch.
- **Dependencies**: monthly `npm outdated`, `npm audit`, update, run `npm run typecheck && npm test`, redeploy.
- **Failed emails**: Enquiries page shows "not sent" with the reason. Contact the customer manually; there is no automatic retry button yet.
- **Security**: rotate keys if exposed; deactivate leavers in Staff; never share the service-role key.
- **Add locations**: Admin > Locations.
- **Known weaknesses**: public image buckets (anyone with a URL can fetch an image, including drafts); no session refresh.
