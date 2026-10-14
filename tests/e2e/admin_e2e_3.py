exec(open('tests/e2e/admin_e2e.py').read())
sql("delete from properties where title like 'E2E%'"); sql("delete from locations where name like 'E2E%'")
abuja=sql("select id from locations where slug='abuja'"); fct=sql("select id from locations where slug='fct'")
def locform(): return find(req("GET","/admin/locations","TT_PM")[2],field="kind",idx=0)
st,h,html=req("GET","/admin/locations","TT_PM"); check("locations page renders hierarchy with edit controls",st==200 and "Federal Capital Territory" in html and "Edit" in html and "Delete" in html)
# add with validation
st,loc_,_=submit("/admin/locations","TT_PM",locform(),{"name":"E2E Area","kind":"area","parent":abuja,"lat":"9.1","lng":"7.4"}); check("add area ok (shows success message)","ok=" in loc_ and sql("select count(*) from locations where name='E2E Area'")=="1",loc_)
st,loc_,_=submit("/admin/locations","TT_PM",locform(),{"name":"E2E Area","kind":"area","parent":abuja,"lat":"","lng":""}); check("duplicate name gets its own unique slug (no silent failure)","ok=" in loc_ and sql("select count(distinct slug) from locations where name='E2E Area'")=="2",loc_)
st,loc_,_=submit("/admin/locations","TT_PM",locform(),{"name":"E2E NoParent","kind":"area","parent":"","lat":"","lng":""}); check("area without a city refused","err=" in loc_ and sql("select count(*) from locations where name='E2E NoParent'")=="0")
st,loc_,_=submit("/admin/locations","TT_PM",locform(),{"name":"E2E State","kind":"state","parent":abuja,"lat":"","lng":""}); check("state with a parent refused","err=" in loc_)
st,loc_,_=submit("/admin/locations","TT_PM",locform(),{"name":"E2E City under city","kind":"city","parent":abuja,"lat":"","lng":""}); check("city under a city refused (must be under a state)","err=" in loc_)
st,loc_,_=submit("/admin/locations","TT_PM",locform(),{"name":"E2E Half","kind":"area","parent":abuja,"lat":"9.1","lng":""}); check("latitude without longitude refused","err=" in loc_)
# edit
lid=sql("select id from locations where name='E2E Area' and public_lat is not null"); slug0=sql(f"select slug from locations where id='{lid}'")
html=req("GET","/admin/locations","TT_PM")[2]; uf=[f for f in forms(html) if ("id",lid) in f["fields"] and "name" in f["names"]][0]
st,loc_,_=submit("/admin/locations","TT_PM",uf,{"name":"E2E Renamed","lat":"9.2","lng":"7.5"})
check("edit renames and moves map point, keeps slug stable",sql(f"select name||'/'||public_lat||'/'||public_lng||'/'||(slug='{slug0}')::text from locations where id='{lid}'")=="E2E Renamed/9.200000/7.500000/true",loc_)
st,loc_,_=submit("/admin/locations","TT_PM",uf,{"name":"E2E Renamed","lat":"500","lng":"7.5"}); check("edit rejects bad coordinates","err=" in loc_ and sql(f"select public_lat from locations where id='{lid}'")=="9.200000")
st,loc_,_=submit("/admin/locations","TT_PM",uf,{"name":"E2E Renamed","parent":lid}); check("area cannot be its own parent","err=" in loc_)
# delete rules
cat=sql("select id from property_categories where slug='house'")
sql(f"insert into properties(slug,title,category_id,transaction,status,publish,location_id) values ('e2e-loc-prop','E2E Prop','{cat}','sale','draft','draft','{lid}')")
html=req("GET","/admin/locations","TT_PM")[2]; df=[f for f in forms(html) if ("id",lid) in f["fields"] and "confirm" in f["names"]][0]
st,loc_,_=submit("/admin/locations","TT_PM",df,{"confirm":None}); check("delete without ticking confirmation refused","err=" in loc_ and sql(f"select count(*) from locations where id='{lid}'")=="1")
st,loc_,_=submit("/admin/locations","TT_PM",df,{"confirm":"on"}); check("delete blocked while a property uses it (clear message)","err=" in loc_ and "propert" in urllib.parse.unquote(loc_) and sql(f"select count(*) from locations where id='{lid}'")=="1",loc_)
sql("delete from properties where title='E2E Prop'")
html=req("GET","/admin/locations","TT_PM")[2]; cf=[f for f in forms(html) if ("id",abuja) in f["fields"] and "confirm" in f["names"]][0]
st,loc_,_=submit("/admin/locations","TT_PM",cf,{"confirm":"on"}); check("delete blocked while it has sub-locations","err=" in loc_ and sql(f"select count(*) from locations where id='{abuja}'")=="1",loc_)
df=[f for f in forms(req("GET","/admin/locations","TT_PM")[2]) if ("id",lid) in f["fields"] and "confirm" in f["names"]][0]
st,loc_,_=submit("/admin/locations","TT_PM",df,{"confirm":"on"}); check("delete works once nothing depends on it",sql(f"select count(*) from locations where id='{lid}'")=="0" and "ok=" in loc_,loc_)
# roles
st,loc_,_=submit("/admin/locations","TT_LEAD",locform(),{"name":"E2E Hack","kind":"area","parent":abuja}); check("lead handler cannot add locations","denied=1" in loc_ and sql("select count(*) from locations where name='E2E Hack'")=="0")
st,loc_,_=submit("/admin/locations","TT_EDITOR",cf,{"confirm":"on"}); check("content editor cannot delete locations","denied=1" in loc_)
sql("delete from locations where name like 'E2E%'")
# ---- public pages for the new design
H="homes.garnet.test"
sql("delete from properties where slug like 'e2e-feat%'")
loc=sql("select id from locations where slug='maitama'")
sql(f"insert into properties(slug,title,category_id,transaction,status,publish,price,location_id,bedrooms,bathrooms,is_featured,listed_at,description) values ('e2e-feat','E2E Featured Home','{cat}','sale','available','published',50000000,'{loc}',3,2,true,now(),'x')")
home=req("GET","/",None,H)[2]
check("homes: tabbed search with pills, type/location/bedrooms/price","search-xl" in home and 'name="tx"' in home and 'name="beds"' in home and 'name="maxPrice"' in home and 'name="category"' in home)
check("homes: featured listing appears with Featured ribbon and price","E2E Featured Home" in home and "Featured</span>" in home and "50,000,000" in home)
check("homes: category tiles show counts","tile" in home and "propert" in home)
check("homes: numbered reasons, enquiry form, WhatsApp float button","01" in home and "Tell us what you are looking for" in home and "float-wa" in home)
check("homes: nav dropdown + mobile menu present","has-dd" in home and "mobile-menu" in home and "Request a viewing" in home)
check("homes: search by pill+filters returns the listing",( "E2E Featured Home" in req("GET","/properties?tx=sale&category=house&location=maitama&beds=3&maxPrice=100000000",None,H)[2]) and ("E2E Featured Home" not in req("GET","/properties?tx=sale&beds=4",None,H)[2]))
res=re.sub(r"<!--.*?-->","",req("GET","/properties?location=maitama&tx=sale",None,H)[2]); check("results page shows active filter chips and count","chips" in res and "Location: Maitama" in res and "found" in res)
corp=req("GET","/",None,"garnet.test")[2]; check("corporate: dropdown, numbered section, enquiry form, float button","has-dd" in corp and "Quality and durability" in corp and "Discuss your project with us" in corp and "float-wa" in corp)
sql("delete from properties where slug like 'e2e-feat%'")
print(f"\nPART3 {ok} passed, {bad} failed")
