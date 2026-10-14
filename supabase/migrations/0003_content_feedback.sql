-- Draft/publish support for editable site content, and a 'feedback' enquiry kind.
alter table pages add column if not exists draft jsonb;
alter table pages add column if not exists updated_at timestamptz not null default now();
alter table enquiries drop constraint if exists enquiries_kind_check;
alter table enquiries add constraint enquiries_kind_check check (kind in ('general','business','property','viewing','upcoming','feedback'));
