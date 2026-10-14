exec(open('tests/e2e/admin_e2e.py').read())
import io
from PIL import Image
def jpeg():
    b=io.BytesIO(); Image.new("RGB",(1600,1200),(120,140,160)).save(b,"JPEG"); return b.getvalue()
sql("delete from properties where title like 'E2E%'")
# ---- create property as property manager
st,h,html=req("GET","/admin/properties/new","TT_PM"); check("PM opens new-property form",st==200 and 'name="title"' in html)
f=find(html,field="title")
cat=sql("select id from property_categories where slug='house'"); loc=sql("select id from locations where slug='maitama'")
st,loc_,_=submit("/admin/properties/new","TT_PM",f,{"title":"E2E Test House","category_id":cat,"transaction":"sale","status":"draft","location_id":loc,"description":"Test description","price":"12345678","bedrooms":"3","bathrooms":"2"})
pid=re.search(r"/admin/properties/([0-9a-f-]{36})\?saved=1",loc_); check("create property redirects with saved flag",bool(pid),loc_)
pid=pid.group(1) if pid else ""
row=sql(f"select title,status,publish,price,reference like 'RH-%' from properties where id='{pid}'"); check("property stored as draft with reference",row.startswith("E2E Test House|draft|draft|12345678.00|t"),row)
# ---- not public while draft
slug=sql(f"select slug from properties where id='{pid}'")
check("draft property is 404 publicly",req("GET",f"/properties/{slug}",None,"homes.garnet.test")[0]==404)
# ---- edit page has Photos tab + features
st,h,html=req("GET",f"/admin/properties/{pid}","TT_PM"); check("edit page shows Photos tab",st==200 and f"/admin/properties/{pid}/images" in html and "Photos" in html)
# ---- features + price change
fid=sql("select id from features where slug='security'")
f=find(html,field="title"); 
st,loc_,_=submit(f"/admin/properties/{pid}","TT_PM",f,{"price":"15000000","features":fid})
check("edit persists price and feature",sql(f"select price from properties where id='{pid}'")=="15000000.00" and sql(f"select count(*) from property_features where property_id='{pid}'")=="1")
# ---- publish needs description; publish works; status becomes available
st,h,html=req("GET",f"/admin/properties/{pid}","TT_PM"); pf=find(html,hidden=("to","published"))
st,loc_,_=submit(f"/admin/properties/{pid}","TT_PM",pf); check("publish ok",sql(f"select publish||'/'||status from properties where id='{pid}'")=="published/available",loc_)
st,_,html=req("GET",f"/properties/{slug}",None,"homes.garnet.test"); check("published property visible publicly with price",st==200 and "E2E Test House" in html and "15,000,000" in html)
# ---- delete blocked while published
st,h,html=req("GET",f"/admin/properties/{pid}","TT_PM"); 
check("delete form hidden while published",'Delete permanently' not in html)
# ---- image upload (real jpeg) + text file rejected
st,h,html=req("GET",f"/admin/properties/{pid}/images","TT_PM"); check("images page opens with tabs",st==200 and "Upload" in html and 'class="tabs"' in html)
uf=find(html,hidden=("id",pid))
st,loc_,_=submit(f"/admin/properties/{pid}/images","TT_PM",uf,files={"files":[("a.jpg",jpeg(),"image/jpeg"),("b.jpg",jpeg(),"image/jpeg")]})
n=sql(f"select count(*) from property_images where property_id='{pid}'"); check("two photos uploaded and recorded",n=="2" and "saved=1" in loc_,loc_)
log=json.loads(req("GET","/__storage_log",None,"localhost")[2]) if False else None
c=http.client.HTTPConnection("localhost",3002); c.request("GET","/__storage_log"); log=json.loads(c.getresponse().read()); 
check("storage got full image AND thumbnail for each photo",sum("-sm.webp" in x for x in log)>=2 and sum(x.endswith(".webp") and "-sm" not in x for x in log)>=2)
check("first photo became the cover",sql(f"select cover_image_id is not null from properties where id='{pid}'")=="t")
st,loc_,_=submit(f"/admin/properties/{pid}/images","TT_PM",find(req('GET',f'/admin/properties/{pid}/images','TT_PM')[2],hidden=("id",pid)),files={"files":[("evil.jpg",b"<script>alert(1)</script>","image/jpeg")]})
check("text file renamed .jpg is rejected",("err=" in loc_) and sql(f"select count(*) from property_images where property_id='{pid}'")=="2",loc_)
# reorder / cover / alt / delete
st,h,html=req("GET",f"/admin/properties/{pid}/images","TT_PM")
ids=sql(f"select id from property_images where property_id='{pid}' order by sort_order").split("\n")
mv=[f_ for f_ in forms(html) if ("dir","down") in f_["fields"] and ("img",ids[0]) in f_["fields"]][0]
submit(f"/admin/properties/{pid}/images","TT_PM",mv)
check("move later reorders photos",sql(f"select id from property_images where property_id='{pid}' order by sort_order").split("\n")[0]==ids[1])
cv=[f_ for f_ in forms(html) if ("img",ids[1]) in f_["fields"] and len(f_["fields"])<=4 and not any(k=="dir" for k,_ in f_["fields"]) and "alt" not in f_["names"]]
submit(f"/admin/properties/{pid}/images","TT_PM",cv[0]) 
check("make cover sets cover image",sql(f"select cover_image_id from properties where id='{pid}'")==ids[1])
alt=find(html,field="alt"); submit(f"/admin/properties/{pid}/images","TT_PM",alt,{"alt":"Front view","caption":"Front"})
check("alt text saved",sql("select count(*) from property_images where alt_text='Front view'")=="1")
st,_,html=req("GET",f"/properties/{slug}",None,"homes.garnet.test"); check("public page uses real cover thumb/full and alt text",'Front view' in html and "-sm.webp" in html or "storage/v1/object/public/property-images" in html)
dl=[f_ for f_ in forms(req('GET',f'/admin/properties/{pid}/images','TT_PM')[2]) if ("img",ids[0]) in f_["fields"] and "dir" not in dict(f_["fields"]) and "alt" not in f_["names"] and not any(n=="img" and v==ids[0] for n,v in []) ]
# find the delete form: it has only id & img & action hidden fields; pick the last one for ids[0]
cands=[f_ for f_ in forms(req('GET',f'/admin/properties/{pid}/images','TT_PM')[2]) if ("img",ids[0]) in f_["fields"]]
submit(f"/admin/properties/{pid}/images","TT_PM",cands[-1])
check("delete photo removes row",sql(f"select count(*) from property_images where property_id='{pid}'")=="1")
# ---- list page quick edit + photos link
st,h,html=req("GET","/admin/properties","TT_PM"); check("list shows photo count link",f"/admin/properties/{pid}/images" in html and "1<!-- --> photo" in html)
q=find(html,field="price",hidden=("id",pid)); submit("/admin/properties","TT_PM",q,{"status":"sold","price":"99"})
check("quick edit updates status and price",sql(f"select status||'/'||price from properties where id='{pid}'")=="sold/99.00")
st,_,html=req("GET",f"/properties/{slug}",None,"homes.garnet.test"); check("sold property labelled unavailable",st==200 and "not currently available" in html)
# ---- unpublish then delete safeguard
st,h,html=req("GET",f"/admin/properties/{pid}","TT_PM"); submit(f"/admin/properties/{pid}","TT_PM",find(html,hidden=("to","draft")))
st,h,html=req("GET",f"/admin/properties/{pid}","TT_PM"); dform=find(html,field="confirm")
st,loc_,_=submit(f"/admin/properties/{pid}","TT_PM",dform,{"confirm":"wrong"}); check("delete refused with wrong confirmation","err=" in loc_ and sql(f"select count(*) from properties where id='{pid}'")=="1",loc_)
ref=sql(f"select reference from properties where id='{pid}'"); st,loc_,_=submit(f"/admin/properties/{pid}","TT_PM",dform,{"confirm":ref})
check("delete works with typed reference",sql(f"select count(*) from properties where id='{pid}'")=="0",loc_)
# ---- role enforcement on actions
st,h,html=req("GET","/admin/properties/new","TT_PM"); f=find(html,field="title")
for role in ("TT_LEAD","TT_EDITOR"):
    st,loc_,_=submit("/admin/properties/new",role,f,{"title":"E2E Hacked","category_id":cat,"transaction":"sale","status":"draft","location_id":loc})
    check(f"{role} cannot create a property (denied redirect, nothing saved)","denied=1" in loc_ and sql("select count(*) from properties where title='E2E Hacked'")=="0",loc_)
check("lead handler is redirected away from property editor page","denied=1" in req("GET","/admin/properties/new","TT_LEAD")[1].get("location",""))
check("signed-out user is sent to login","/admin/login" in req("GET","/admin/properties")[1].get("location",""))
check("bad token is sent to login","/admin/login" in req("GET","/admin","BADTOKEN")[1].get("location",""))
print(f"\nPART1 {ok} passed, {bad} failed")
