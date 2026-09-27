// Removes accounts (and their data) left behind by an interrupted test run.
// Only touches accounts whose email starts with "mimos-test-".
//
// Run: npm run test:cleanup   (reads .env.local)

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const testUsers = [];
for (let page = 1; ; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  testUsers.push(...data.users.filter((user) => user.email?.startsWith("mimos-test-")));
  if (data.users.length < 1000) break;
}

for (const user of testUsers) {
  const { data: folders } = await admin.storage.from("model-files").list(user.id);
  for (const folder of folders || []) {
    const { data: files } = await admin.storage.from("model-files").list(`${user.id}/${folder.name}`);
    const paths = (files || []).map((f) => `${user.id}/${folder.name}/${f.name}`);
    if (paths.length) await admin.storage.from("model-files").remove(paths);
  }
  await admin.from("discussions").delete().eq("user_id", user.id);
  await admin.from("categories").delete().eq("created_by", user.id);
  await admin.from("users").delete().eq("id", user.id);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  console.log(error ? `could not delete ${user.email}: ${error.message}` : `deleted ${user.email}`);
}

console.log(`${testUsers.length} test account(s) processed`);
