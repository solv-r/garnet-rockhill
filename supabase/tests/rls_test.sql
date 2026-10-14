\set ON_ERROR_STOP off
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000a1','lead@x'),('00000000-0000-0000-0000-0000000000a2','pm@x'),('00000000-0000-0000-0000-0000000000a3','off@x');
insert into staff_profiles(id,full_name,role,is_active) values
 ('00000000-0000-0000-0000-0000000000a1','Lead','lead_handler',true),('00000000-0000-0000-0000-0000000000a2','PM','property_manager',true),('00000000-0000-0000-0000-0000000000a3','Inactive','super_admin',false);
create temp table ids as select (select id from property_categories where slug='house') c, (select id from locations where slug='abuja') l;
insert into properties(slug,title,category_id,transaction,status,publish,location_id) select 'pub','Pub',c,'sale','available','published',l from ids;
insert into properties(slug,title,category_id,transaction,status,publish,location_id) select 'draft','Draft',c,'sale','draft','draft',l from ids;
insert into properties(slug,title,category_id,transaction,status,publish,location_id) select 'arch','Arch',c,'sale','available','archived',l from ids;
insert into property_private(property_id,exact_address,exact_lat,exact_lng) select id,'secret',1,1 from properties where slug='pub';
insert into enquiries(source_site,kind,name,email,privacy_ack_at) values ('homes','general','A','a@b.c',now());
select 'T1 reference+listed_at auto', reference, listed_at is not null from properties where slug='pub';

set role anon;
select 'T2 anon sees only published' , count(*) from properties;
select 'T3 anon property_private rows (want 0)', count(*) from property_private;
select 'T4 anon enquiries rows (want 0)', count(*) from enquiries;
insert into enquiries(source_site,kind,name,email,privacy_ack_at) values ('homes','general','Hax','h@x.y',now());
update properties set price=1;
reset role;
select 'T5 anon insert/update blocked: enquiries=', count(*) from enquiries; select 'T5b price untouched (want 0 non-null)', count(*) from properties where price is not null;

-- guards
insert into properties(slug,title,category_id,transaction,status,publish,location_id,is_demo) select 'demo','Demo',c,'sale','available','published',l from ids;
insert into projects(slug,title,publish,verified) values ('p1','P1','published',false);
insert into enquiries(source_site,kind,name,privacy_ack_at) values ('homes','general','NoContact',now());
insert into properties(slug,title,category_id,transaction,status,publish,location_id,price) select 'neg','N',c,'sale','draft','draft',l,-5 from ids;

-- roles
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a1';
select 'T6 lead_handler reads enquiries (want 1)', count(*) from enquiries;
update enquiries set status='contacted'; select 'T7 lead_handler updated', count(*) from enquiries where status='contacted';
update properties set price=99; select 'T8 lead_handler cannot edit properties (want 0)', count(*) from properties where price=99;
select 'T9 lead_handler reads property_private (want 0)', count(*) from property_private;
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a2';
update properties set price=99 where slug='pub'; select 'T10 property_manager edits (want 1)', count(*) from properties where price=99;
select 'T11 pm reads private (want 1)', count(*) from property_private;
update enquiries set status='closed'; select 'T12 pm cannot update enquiries (want 0)', count(*) from enquiries where status='closed';
select 'T13 pm cannot write projects', count(*) from projects;
set request.jwt.claim.sub='00000000-0000-0000-0000-0000000000a3';
select 'T14 inactive super_admin sees enquiries (want 0)', count(*) from enquiries;
reset role;
