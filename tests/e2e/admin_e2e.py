import re, sys, json, uuid, subprocess, urllib.request, urllib.parse, http.client
from html.parser import HTMLParser
BASE=("localhost",3100)
def sql(q): return subprocess.run(["su","postgres","-c",f"psql -d rh -At -c \"{q}\""],capture_output=True,text=True).stdout.strip()
def req(method,path,role=None,host="garnet.test",body=None,headers=None):
    c=http.client.HTTPConnection(*BASE); h={"Host":host,"Origin":f"http://{host}"}
    if role: h["Cookie"]=f"rh_at={role}"
    h.update(headers or {}); c.request(method,path,body=body,headers=h); r=c.getresponse(); data=r.read().decode("utf8","replace"); return r.status,dict(r.getheaders()),data
class F(HTMLParser):
    def __init__(s): super().__init__(); s.forms=[]; s.cur=None; s.sel=None; s.ta=None
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=="form": s.cur={"fields":[],"names":set()}; s.forms.append(s.cur)
        if not s.cur: return
        if t=="input":
            n=a.get("name"); 
            if n:
                s.cur["names"].add(n); ty=a.get("type","text")
                if ty in("checkbox","radio"):
                    if "checked" in a: s.cur["fields"].append((n,a.get("value","on")))
                elif ty!="file": s.cur["fields"].append((n,a.get("value","")))
        elif t=="select": s.sel=a.get("name"); s.cur["names"].add(s.sel); s.selval=None; s.first=None
        elif t=="option" and s.sel:
            if s.first is None and a.get("value") not in(None,""): s.first=a.get("value")
            if "selected" in a: s.selval=a.get("value")
        elif t=="textarea": s.ta=a.get("name"); s.cur["names"].add(s.ta); s.tabuf=""
    def handle_data(s,d):
        if s.ta: s.tabuf+=d
    def handle_endtag(s,t):
        if t=="select" and s.sel: s.cur["fields"].append((s.sel,s.selval if s.selval is not None else (s.first or ""))); s.sel=None
        if t=="textarea" and s.ta: s.cur["fields"].append((s.ta,s.tabuf)); s.ta=None
        if t=="form": s.cur=None
def forms(html): p=F(); p.feed(html); return p.forms
def find(html,field=None,hidden=None,idx=0):
    out=[]
    for f in forms(html):
        if field and field not in f["names"]: continue
        if hidden and (hidden[0],hidden[1]) not in f["fields"]: continue
        out.append(f)
    return out[idx]
def submit(path,role,form,over=None,files=None,host="garnet.test",drop=()):
    fields=[(k,v) for k,v in form["fields"] if k not in (over or {}) and k not in drop]+[(k,v) for k,v in (over or {}).items() if v is not None]
    b="----B"+uuid.uuid4().hex; parts=[]
    for k,v in fields: parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for name,v in (files or {}).items():
        for fn,data,ct in (v if isinstance(v,list) else [v]): parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{name}"; filename="{fn}"\r\nContent-Type: {ct}\r\n\r\n'.encode()+data+b"\r\n")
    parts.append(f"--{b}--\r\n".encode())
    st,h,body=req("POST",path,role,host,b"".join(parts),{"Content-Type":f"multipart/form-data; boundary={b}"})
    return st,h.get("location") or h.get("Location") or "",body
ok=0; bad=0
def check(name,cond,extra=""):
    global ok,bad
    if cond: ok+=1; print("PASS",name)
    else: bad+=1; print("FAIL",name,extra)
