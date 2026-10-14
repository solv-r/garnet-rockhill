-- Public-read buckets; writes happen only via server code using the service-role key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('property-images','property-images', true, 6291456, array['image/webp']),
  ('site-media','site-media', true, 6291456, array['image/webp'])
on conflict (id) do nothing;
-- NOTE: image paths use random UUIDs, but public buckets are readable by anyone holding the URL, including images of drafts.
