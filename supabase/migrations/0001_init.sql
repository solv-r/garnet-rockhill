-- Garnet Rockhill + Rockhill Homes: shared schema (Postgres / Supabase)
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type site_key as enum ('corporate','homes');
create type listing_status as enum ('draft','available','upcoming','reserved','sold','rented','leased','withdrawn');
create type transaction_type as enum ('sale','rent','lease','off_plan_enquiry');
create type publish_state as enum ('draft','published','archived');
create type lead_status as enum ('new','contacted','follow_up','viewing_arranged','converted','closed');
create type staff_role as enum ('super_admin','property_manager','content_editor','lead_handler');

create table staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role staff_role not null default 'lead_handler',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create or replace function has_role(r staff_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff_profiles where id = auth.uid() and is_active
                 and (role = 'super_admin' or role = any(r)));
$$;

create table locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references locations(id) on delete restrict,
  kind text not null check (kind in ('state','city','area')),
  name text not null, slug text not null unique,
  public_lat numeric(9,6), public_lng numeric(9,6),
  created_at timestamptz not null default now()
);
create index on locations(parent_id);

create table property_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, name text not null, sort_order int not null default 0,
  uses_bedrooms boolean not null default true,
  uses_plot_size boolean not null default false,
  allowed_transactions transaction_type[] not null
);
create table features (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null);

create table properties (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default '',
  slug text not null unique,
  title text not null,
  category_id uuid not null references property_categories(id),
  transaction transaction_type not null,
  status listing_status not null default 'draft',
  publish publish_state not null default 'draft',
  price numeric(16,2) check (price >= 0),
  price_period text check (price_period in ('total','year','month','night')),
  currency char(3) not null default 'NGN',
  location_id uuid not null references locations(id),
  description text,
  bedrooms smallint, bathrooms smallint, parking smallint,
  plot_size_sqm numeric(12,2), building_area_sqm numeric(12,2),
  furnishing text check (furnishing in ('furnished','semi_furnished','unfurnished')),
  max_guests smallint,
  development_status text, expected_completion date,
  cover_image_id uuid,
  is_featured boolean not null default false,
  is_demo boolean not null default false,
  listed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- fictional demo rows can never be published
  check (not (publish = 'published' and is_demo))
);
create index on properties (publish, status, transaction);
create index on properties (location_id);
create index on properties (price);
create index on properties using gin (title gin_trgm_ops);

-- exact location is staff-only; only the fuzzed neighbourhood pair is ever exposed
create table property_private (
  property_id uuid primary key references properties(id) on delete cascade,
  exact_address text, exact_lat numeric(9,6), exact_lng numeric(9,6),
  internal_notes text
);
create table property_features (
  property_id uuid references properties(id) on delete cascade,
  feature_id uuid references features(id) on delete cascade,
  primary key (property_id, feature_id)
);
create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null, alt_text text, caption text,
  sort_order int not null default 0, created_at timestamptz not null default now()
);
create index on property_images(property_id, sort_order);
alter table properties add constraint fk_cover foreign key (cover_image_id)
  references property_images(id) on delete set null;

create sequence property_ref_seq;
create or replace function set_property_defaults() returns trigger language plpgsql as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'RH-' || lpad(nextval('property_ref_seq')::text, 6, '0');
  end if;
  new.updated_at := now();
  if new.publish = 'published' and new.listed_at is null then new.listed_at := now(); end if;
  return new;
end $$;
create trigger trg_property_defaults before insert or update on properties
  for each row execute function set_property_defaults();

create table projects (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  category text, location_text text, description text,
  status text check (status in ('ongoing','completed')),
  completion_period text, service_area text, technical_details jsonb,
  verified boolean not null default false,
  publish publish_state not null default 'draft', created_at timestamptz default now(),
  check (publish <> 'published' or verified)
);
create table project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  storage_path text not null, alt_text text, caption text, sort_order int default 0
);
create table articles (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  category text, excerpt text, body text, cover_path text,
  publish publish_state not null default 'draft', published_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table pages (
  id uuid primary key default gen_random_uuid(), site site_key not null, key text not null,
  content jsonb not null default '{}', publish publish_state not null default 'draft',
  unique (site, key)
);
create table seo_meta (
  id uuid primary key default gen_random_uuid(), site site_key not null, path text not null,
  title text, description text, canonical_url text, og_title text, og_description text, og_image text,
  noindex boolean not null default false, unique (site, path)
);
create table site_settings (
  site site_key not null, key text not null, value text, primary key (site, key)
);

create sequence enquiry_ref_seq;
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('ENQ-' || lpad(nextval('enquiry_ref_seq')::text, 6, '0')),
  source_site site_key not null,
  kind text not null check (kind in ('general','business','property','viewing','upcoming')),
  property_id uuid references properties(id) on delete set null,
  name text not null, email text, phone text, message text,
  preferred_viewing timestamptz,
  privacy_ack_at timestamptz not null,
  status lead_status not null default 'new',
  staff_notes text,
  idempotency_key text unique,
  team_notified_at timestamptz, team_notify_error text,
  customer_notified_at timestamptz, customer_notify_error text,
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);
create index on enquiries(status, created_at desc);
create index on enquiries(source_site, created_at desc);

-- RLS everywhere; enquiries have NO public policy (inserts go through the server with the service role)
alter table staff_profiles enable row level security;
alter table locations enable row level security;
alter table property_categories enable row level security;
alter table features enable row level security;
alter table properties enable row level security;
alter table property_private enable row level security;
alter table property_features enable row level security;
alter table property_images enable row level security;
alter table projects enable row level security;
alter table project_images enable row level security;
alter table articles enable row level security;
alter table pages enable row level security;
alter table seo_meta enable row level security;
alter table site_settings enable row level security;
alter table enquiries enable row level security;

create policy staff_self on staff_profiles for select using (id = auth.uid() or has_role('{}'));
create policy staff_admin on staff_profiles for all using (has_role('{}')) with check (has_role('{}'));

create policy pub_loc on locations for select using (true);
create policy pub_cat on property_categories for select using (true);
create policy pub_feat on features for select using (true);
create policy pub_prop on properties for select using (publish = 'published' and status <> 'draft');
create policy pub_pf on property_features for select using (exists (select 1 from properties p where p.id = property_id and p.publish = 'published'));
create policy pub_pi on property_images for select using (exists (select 1 from properties p where p.id = property_id and p.publish = 'published'));
create policy pub_proj on projects for select using (publish = 'published' and verified);
create policy pub_pimg on project_images for select using (exists (select 1 from projects p where p.id = project_id and p.publish = 'published'));
create policy pub_art on articles for select using (publish = 'published');
create policy pub_page on pages for select using (publish = 'published');
create policy pub_seo on seo_meta for select using (true);
create policy pub_set on site_settings for select using (key not like 'private\_%');

create policy prop_staff_r on properties for select using (has_role('{property_manager,content_editor,lead_handler}'));
create policy prop_w on properties for all using (has_role('{property_manager}')) with check (has_role('{property_manager}'));
create policy priv_w on property_private for all using (has_role('{property_manager}')) with check (has_role('{property_manager}'));
create policy pf_w on property_features for all using (has_role('{property_manager}')) with check (has_role('{property_manager}'));
create policy pi_w on property_images for all using (has_role('{property_manager}')) with check (has_role('{property_manager}'));
create policy loc_w on locations for all using (has_role('{property_manager}')) with check (has_role('{property_manager}'));
create policy cat_w on property_categories for all using (has_role('{}')) with check (has_role('{}'));
create policy feat_w on features for all using (has_role('{property_manager}')) with check (has_role('{property_manager}'));
create policy proj_w on projects for all using (has_role('{content_editor}')) with check (has_role('{content_editor}'));
create policy pimg_w on project_images for all using (has_role('{content_editor}')) with check (has_role('{content_editor}'));
create policy art_w on articles for all using (has_role('{content_editor}')) with check (has_role('{content_editor}'));
create policy page_w on pages for all using (has_role('{content_editor}')) with check (has_role('{content_editor}'));
create policy seo_w on seo_meta for all using (has_role('{content_editor}')) with check (has_role('{content_editor}'));
create policy set_w on site_settings for all using (has_role('{}')) with check (has_role('{}'));
create policy enq_r on enquiries for select using (has_role('{lead_handler,property_manager}'));
create policy enq_u on enquiries for update using (has_role('{lead_handler}')) with check (has_role('{lead_handler}'));
