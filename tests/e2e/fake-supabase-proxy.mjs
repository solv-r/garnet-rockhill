// Test harness only: forwards /rest/v1 to PostgREST and fakes just enough of Supabase Auth + Storage for admin tests.
import http from "http";
const USERS = { TT_SUPER: "b0000000-0000-0000-0000-000000000001", TT_PM: "b0000000-0000-0000-0000-000000000002", TT_EDITOR: "b0000000-0000-0000-0000-000000000003", TT_LEAD: "b0000000-0000-0000-0000-000000000004" };
const json = (res, code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
globalThis.storageLog = [];
http.createServer((req, res) => {
  const u = req.url;
  if (u.startsWith("/auth/v1/user")) { const t = (req.headers.authorization ?? "").replace("Bearer ", ""); const id = USERS[t]; return id ? json(res, 200, { id, email: t.toLowerCase() + "@test.local", aud: "authenticated", role: "authenticated" }) : json(res, 401, { msg: "bad token" }); }
  if (u.startsWith("/auth/v1/token")) { return json(res, 200, { access_token: "TT_SUPER", refresh_token: "NEWRT", expires_in: 3600, token_type: "bearer", user: { id: USERS.TT_SUPER, email: "super@test.local" } }); }
  if (u.startsWith("/storage/v1/")) { storageLog.push(req.method + " " + u); let n = 0; req.on("data", (c) => (n += c.length)); req.on("end", () => json(res, 200, { Key: u, bytes: n })); return; }
  if (u === "/__storage_log") return json(res, 200, storageLog);
  const p = http.request({ host: "localhost", port: 3001, path: u.replace(/^\/rest\/v1/, ""), method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  req.pipe(p);
}).listen(3002);
