-- Reference data only. NO properties, projects or prices are seeded.
insert into property_categories (slug, name, sort_order, uses_bedrooms, uses_plot_size, allowed_transactions) values
 ('house','Houses',1,true,false,'{sale,rent,lease}'),
 ('apartment','Apartments',2,true,false,'{sale,rent,lease}'),
 ('luxury-home','Luxury Homes',3,true,false,'{sale,rent,lease}'),
 ('land','Land & Plots',4,false,true,'{sale,lease}'),
 ('commercial','Commercial Properties',5,false,false,'{sale,rent,lease}'),
 ('estate','Estate Developments',6,true,true,'{sale,off_plan_enquiry}'),
 ('off-plan','Off-plan Developments',7,true,false,'{sale,off_plan_enquiry}'),
 ('short-let','Short-lets',8,true,false,'{rent}')
on conflict (slug) do nothing;

insert into features (slug, name) values
 ('security','24-hour security'),('power-backup','Backup power'),('water','Water supply'),('parking','Parking'),
 ('gated','Gated community'),('swimming-pool','Swimming pool'),('gym','Gym'),('bq','Boys quarters'),('furnished','Furnished'),
 ('c-of-o','Title documents available for inspection'),('internet','Internet ready')
on conflict (slug) do nothing;

-- States and cities only. Add neighbourhoods and their approximate public coordinates in the admin.
insert into locations (kind, name, slug) values ('state','Federal Capital Territory','fct'),('state','Lagos','lagos-state') on conflict (slug) do nothing;
insert into locations (kind, name, slug, parent_id)
  select 'city','Abuja','abuja', id from locations where slug='fct' on conflict (slug) do nothing;
insert into locations (kind, name, slug, parent_id)
  select 'city','Lagos','lagos', id from locations where slug='lagos-state' on conflict (slug) do nothing;

insert into site_settings (site, key, value) values ('homes','whatsapp_message','Hello Rockhill Homes, I would like to make an enquiry.') on conflict do nothing;
