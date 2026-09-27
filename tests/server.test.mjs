// Tests for the Express server's API routes, run against the production build.
//
// Run: npm run build && npm run test:server   (reads .env.local)

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const PORT = 5000 + Math.floor(Math.random() * 900) + 100;
const BASE = `http://127.0.0.1:${PORT}`;
const RUN = Date.now().toString(36);
const PASSWORD = `Test-${randomUUID()}`;

const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let server;
let user; // { id, email, token }
let requestCount = 0;

const post = async (path, body, headers = {}) => {
  requestCount++;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, contentType: res.headers.get("content-type") || "" };
};

before(async () => {
  server = spawn(process.execPath, ["dist/index.cjs"], {
    env: { ...process.env, NODE_ENV: "production", PORT: String(PORT), HOST: "127.0.0.1" },
    stdio: "ignore",
  });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${BASE}/api/health`)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  const email = `mimos-test-${RUN}-server@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true, user_metadata: { name: "Server Test", role: "buyer" },
  });
  if (error) throw error;
  const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: session, error: signInError } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (signInError) throw signInError;
  user = { id: data.user.id, email, token: session.session.access_token };
});

after(async () => {
  server?.kill();
  if (user) {
    await admin.from("users").delete().eq("id", user.id);
    await admin.auth.admin.deleteUser(user.id);
  }
});

test("GET /api/health reports ok", async () => {
  const res = await fetch(`${BASE}/api/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("account-status requires an email and never reveals whether an account exists", async () => {
  assert.equal((await post("/api/auth/account-status", {})).status, 400);
  const unknown = await post("/api/auth/account-status", { email: `nobody-${RUN}@example.com` });
  const existing = await post("/api/auth/account-status", { email: user.email.toUpperCase() });
  assert.equal(unknown.status, 200);
  assert.deepEqual(unknown.json, { googleOnly: false });
  assert.deepEqual(existing.json, { googleOnly: false }, "an email/password account answers like an unknown one");
});

test("link-email-identity rejects missing and forged tokens", async () => {
  assert.equal((await post("/api/auth/link-email-identity", { role: "publisher" })).status, 401);
  const forged = await post("/api/auth/link-email-identity", { role: "publisher" }, {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.forged",
  });
  assert.equal(forged.status, 401);
});

test("link-email-identity acts only on the token's own account", async () => {
  const res = await post("/api/auth/link-email-identity", { role: "publisher" }, { Authorization: `Bearer ${user.token}` });
  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.equal(res.json.identityLinked, false, "account already has email sign-in");
  assert.equal(res.json.roleAdded, true);
  const { data: roles } = await admin.from("user_roles").select("roles(role_name)").eq("user_id", user.id);
  assert.deepEqual(roles.map((r) => r.roles.role_name).sort(), ["buyer", "publisher"]);

  const invalidRole = await post("/api/auth/link-email-identity", { role: "admin" }, { Authorization: `Bearer ${user.token}` });
  assert.equal(invalidRole.json.roleAdded, false, "only buyer/publisher can be added");
});

test("the removed add-password route can no longer set anyone's password", async () => {
  const newPassword = `Hijack-${randomUUID()}`;
  const res = await post("/api/auth/add-password", { email: user.email, password: newPassword });
  assert.ok(!res.contentType.includes("application/json"), "no API handles this route any more");
  const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email: user.email, password: newPassword });
  assert.ok(error, "the attacker's password must not work");
});

test("auth endpoints are rate limited per client", async () => {
  let limited = null;
  for (let i = requestCount; i < 30 && !limited; i++) {
    const res = await post("/api/auth/account-status", { email: `nobody-${RUN}@example.com` });
    if (res.status === 429) limited = res;
  }
  assert.ok(limited, "expected a 429 after 20 requests in the window");
  assert.match(limited.json.error, /Too many requests/);
});
