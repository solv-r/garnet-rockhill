-- LOCAL DEVELOPMENT ONLY. Never run this on your live (production) database.
-- Adds clearly labelled FICTIONAL listings so you can see the Homes site working. Remove them with LOCAL_TEST_LISTINGS_REMOVE.sql.
insert into locations(kind,name,slug,parent_id,public_lat,public_lng)
  select 'area','Test Area A','test-area-a',id,9.0765,7.3986 from locations where slug='abuja' on conflict (slug) do nothing;
insert into locations(kind,name,slug,parent_id,public_lat,public_lng)
  select 'area','Test Area B','test-area-b',id,6.5244,3.3792 from locations where slug='lagos' on conflict (slug) do nothing;
with k as (select (select id from property_categories where slug='house') house, (select id from property_categories where slug='land') land,
                  (select id from property_categories where slug='apartment') apt, (select id from locations where slug='test-area-a') a, (select id from locations where slug='test-area-b') b)
insert into properties(slug,title,category_id,transaction,status,publish,price,price_period,location_id,bedrooms,bathrooms,plot_size_sqm,description,listed_at)
select * from (
  select 'test-house-1','[TEST] Four-bedroom house',house,'sale'::transaction_type,'available'::listing_status,'published'::publish_state,85000000,'total',a,4,4,null::numeric,'FICTIONAL test listing for local development only.',now() from k union all
  select 'test-apt-1','[TEST] Two-bedroom apartment',apt,'rent','available','published',4500000,'year',b,2,2,null,'FICTIONAL test listing for local development only.',now() from k union all
  select 'test-land-1','[TEST] 600 sqm plot',land,'sale','available','published',30000000,'total',a,null,null,600,'FICTIONAL test listing for local development only.',now() from k union all
  select 'test-upcoming-1','[TEST] Upcoming development',house,'off_plan_enquiry','upcoming','published',null,null,b,3,3,null,'FICTIONAL test listing for local development only.',now() from k union all
  select 'test-sold-1','[TEST] Sold house',house,'sale','sold','published',60000000,'total',a,3,3,null,'FICTIONAL test listing for local development only.',now() from k
) t(slug,title,category_id,transaction,status,publish,price,price_period,location_id,bedrooms,bathrooms,plot_size_sqm,description,listed_at)
on conflict (slug) do nothing;
