grant insert, update, delete on all tables in schema public to anon;
insert into properties(slug,title,category_id,transaction,status,publish,location_id,is_demo) select 'demo','Demo',c,'sale','available','published',l,true from (select (select id from property_categories where slug='house') c,(select id from locations where slug='abuja') l) x;
set role anon;
insert into enquiries(source_site,kind,name,email,privacy_ack_at) values ('homes','general','Hax','h@x.y',now());
update properties set price=1; delete from properties;
reset role;
select 'RLS blocks anon write: enquiries (want 1)', count(*) from enquiries;
select 'anon update/delete blocked: published props still (want 1)', count(*) from properties where slug='pub';
select 'demo row not stored (want 0)', count(*) from properties where slug='demo';
