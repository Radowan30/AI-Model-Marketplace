// Security and data-integrity tests against a real Supabase project.
//
// Every request goes through the public REST/Storage/RPC API exactly as the app
// (or an attacker) would. The suite creates its own temporary accounts and data
// with the service-role key and deletes everything afterwards.
//
// Run: npm run test:security   (reads .env.local)

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON_KEY || !SERVICE_KEY) throw new Error("Missing Supabase env vars in .env.local");

const RUN = Date.now().toString(36);
const PASSWORD = `Test-${randomUUID()}`;
const BUCKET = "model-files";

const admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const newClient = () => createClient(URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const anon = newClient();

const createdUserIds = [];
const createdCategoryIds = [];
const u = {}; // actors: { id, email, client }
const m = {}; // models: free, paid, draft

async function makeUser(label, roles) {
  const email = `mimos-test-${RUN}-${label}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: `Test ${label}`, role: roles[0] },
  });
  if (error) throw error;
  createdUserIds.push(data.user.id);

  const client = newClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (signInError) throw signInError;

  for (const role of roles.slice(1)) {
    const { data: res, error: rpcError } = await client.rpc("create_user_with_role", {
      p_user_id: data.user.id, p_name: `Test ${label}`, p_email: email, p_role_name: role,
    });
    if (rpcError || !res?.success) throw new Error(`add role failed: ${rpcError?.message || res?.error}`);
  }
  return { id: data.user.id, email, client };
}

async function insertModel(client, publisherId, overrides) {
  const { data, error } = await client.from("models").insert({
    model_name: `Test ${RUN} ${overrides.status}-${overrides.subscription_type}`,
    detailed_description: "Detailed description",
    short_description: "Short description",
    version: "1.0.0",
    response_time: 100,
    accuracy: 90,
    publisher_id: publisherId,
    ...overrides,
  }).select().single();
  if (error) throw error;
  return data;
}

async function upload(client, path, modelId) {
  const { error } = await client.storage.from(BUCKET).upload(path, new Blob(["test file"], { type: "text/plain" }));
  if (error) return { error };
  const { error: rowError } = await client.from("model_files").insert({
    model_id: modelId, file_name: path.split("/").pop(), file_type: "upload",
    file_url: "test", file_path: path, file_size: 9,
  });
  return { error: rowError };
}

// Mirrors the app: sign a fresh URL (checked against RLS) and fetch it. A plain
// download() can be answered from Supabase's CDN cache after access is revoked.
const canDownload = async (client, path) => {
  const { data, error } = await client.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error) return false;
  return (await fetch(data.signedUrl)).ok;
};

before(async () => {
  u.owner = await makeUser("owner", ["publisher"]);
  u.collab = await makeUser("collab", ["publisher"]);
  u.buyer = await makeUser("buyer", ["buyer"]);
  u.attacker = await makeUser("attacker", ["publisher", "buyer"]);

  m.free = await insertModel(u.owner.client, u.owner.id, { status: "published", subscription_type: "free" });
  m.paid = await insertModel(u.owner.client, u.owner.id, { status: "published", subscription_type: "paid", subscription_amount: 10 });
  m.draft = await insertModel(u.owner.client, u.owner.id, { status: "draft", subscription_type: "free" });

  // Collaborator entered in upper case: matching must ignore case
  const { error } = await u.owner.client.from("collaborators").insert(
    [m.free, m.paid, m.draft].map((model) => ({ model_id: model.id, name: "Collab", email: u.collab.email.toUpperCase() })),
  );
  if (error) throw error;

  for (const model of [m.free, m.paid]) {
    const res = await upload(u.owner.client, `${u.owner.id}/${model.id}/owner.txt`, model.id);
    if (res.error) throw res.error;
  }
});

after(async () => {
  // Storage objects first, then profiles (cascades to roles, models, subscriptions,
  // ratings, notifications), then categories and auth accounts.
  for (const id of createdUserIds) {
    const { data: folders } = await admin.storage.from(BUCKET).list(id);
    for (const folder of folders || []) {
      const { data: files } = await admin.storage.from(BUCKET).list(`${id}/${folder.name}`);
      const paths = (files || []).map((f) => `${id}/${folder.name}/${f.name}`);
      if (paths.length) await admin.storage.from(BUCKET).remove(paths);
    }
  }
  if (createdCategoryIds.length) await admin.from("categories").delete().in("id", createdCategoryIds);
  if (createdUserIds.length) {
    await admin.from("discussions").delete().in("user_id", createdUserIds);
    await admin.from("users").delete().in("id", createdUserIds);
  }
  for (const id of createdUserIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.error("cleanup: could not delete user", id, error.message);
  }
});

// ---------------------------------------------------------------------------
// Account creation (H2)
// ---------------------------------------------------------------------------

test("sign-up trigger creates the profile and the requested role", async () => {
  const { data: profile } = await admin.from("users").select("name, email").eq("id", u.buyer.id).single();
  assert.equal(profile.email, u.buyer.email.toLowerCase());
  assert.equal(profile.name, "Test buyer");
  const { data: roles } = await admin.from("user_roles").select("roles(role_name)").eq("user_id", u.buyer.id);
  assert.deepEqual(roles.map((r) => r.roles.role_name), ["buyer"]);
});

test("create_user_with_role: signed-out caller cannot modify an existing account", async () => {
  const { data } = await anon.rpc("create_user_with_role", {
    p_user_id: u.buyer.id, p_name: "x", p_email: "hijacked@example.com", p_role_name: "publisher",
  });
  assert.equal(data.success, false);
  const { data: profile } = await admin.from("users").select("email").eq("id", u.buyer.id).single();
  assert.equal(profile.email, u.buyer.email.toLowerCase());
});

test("create_user_with_role: signed-in caller cannot modify another account", async () => {
  const { data } = await u.attacker.client.rpc("create_user_with_role", {
    p_user_id: u.buyer.id, p_name: "x", p_email: "hijacked@example.com", p_role_name: "publisher",
  });
  assert.equal(data.success, false);
});

test("create_user_with_role: email always comes from auth, even for your own account", async () => {
  const { data } = await u.buyer.client.rpc("create_user_with_role", {
    p_user_id: u.buyer.id, p_name: "x", p_email: "spoofed@example.com", p_role_name: "buyer",
  });
  assert.equal(data.success, true);
  const { data: profile } = await admin.from("users").select("email").eq("id", u.buyer.id).single();
  assert.equal(profile.email, u.buyer.email.toLowerCase());
});

test("create_user_with_role: signed-out call can finish a brand-new unconfirmed sign-up only", async () => {
  // generateLink creates an unconfirmed account without sending an email
  const email = `mimos-test-${RUN}-pending@example.com`;
  const { data: link, error } = await admin.auth.admin.generateLink({
    type: "signup", email, password: PASSWORD, options: { data: { name: "Pending" } },
  });
  if (error) throw error;
  createdUserIds.push(link.user.id);

  const { data: first } = await anon.rpc("create_user_with_role", {
    p_user_id: link.user.id, p_name: "Pending", p_email: email, p_role_name: "buyer",
  });
  assert.equal(first.success, true, "fresh unconfirmed sign-up can get its role");

  const { data: second } = await anon.rpc("create_user_with_role", {
    p_user_id: link.user.id, p_name: "Pending", p_email: email, p_role_name: "publisher",
  });
  assert.equal(second.success, false, "cannot add a second role while signed out");
});

test("add_email_identity_to_user is not callable by signed-out or signed-in users", async () => {
  for (const client of [anon, u.attacker.client]) {
    const { error } = await client.rpc("add_email_identity_to_user", { p_user_id: u.buyer.id });
    assert.ok(error, "expected permission error");
  }
});

// ---------------------------------------------------------------------------
// Profiles (H4) and collaborator identity (H1)
// ---------------------------------------------------------------------------

test("signed-out visitors cannot read private profile fields or buyer profiles", async () => {
  const { error: phoneError } = await anon.from("users").select("phone").limit(1);
  assert.ok(phoneError, "phone must not be selectable");
  const { data: buyerRows } = await anon.from("users").select("id").eq("id", u.buyer.id);
  assert.equal(buyerRows.length, 0, "buyer profile must be hidden");
  const { data: ownerRows } = await anon.from("users").select("name, email").eq("id", u.owner.id);
  assert.equal(ownerRows.length, 1, "publisher of a published model is visible (model page)");
});

test("signed-out visitors cannot read role assignments or the removed view", async () => {
  const { error: rolesError } = await anon.from("user_roles").select("id").limit(1);
  assert.ok(rolesError);
  const { error: viewError } = await anon.from("user_roles_view").select("*").limit(1);
  assert.ok(viewError);
});

test("get_my_profile returns the caller's own private fields", async () => {
  await u.buyer.client.from("users").update({ phone: "+60 12-000 0000" }).eq("id", u.buyer.id);
  const { data } = await u.buyer.client.rpc("get_my_profile");
  assert.equal(data.id, u.buyer.id);
  assert.equal(data.phone, "+60 12-000 0000");
});

test("profile email cannot be changed by the user", async () => {
  await u.attacker.client.from("users").update({ email: u.collab.email.toUpperCase(), name: "Renamed" }).eq("id", u.attacker.id);
  const { data } = await admin.from("users").select("email, name").eq("id", u.attacker.id).single();
  assert.equal(data.email, u.attacker.email.toLowerCase());
  assert.equal(data.name, "Renamed", "other fields still save");
});

test("impersonating a collaborator's email grants no access", async () => {
  const { data: isCollab } = await u.attacker.client.rpc("is_collaborator_by_email", { p_model_id: m.draft.id });
  assert.equal(isCollab, false);
  const { data: draft } = await u.attacker.client.from("models").select("id").eq("id", m.draft.id);
  assert.equal(draft.length, 0);
  const { data: files } = await u.attacker.client.from("model_files").select("id").eq("model_id", m.paid.id);
  assert.equal(files.length, 0);
});

test("a real collaborator (email stored in different case) gets access", async () => {
  const { data: isCollab } = await u.collab.client.rpc("is_collaborator_by_email", { p_model_id: m.draft.id });
  assert.equal(isCollab, true);
  const { data: draft } = await u.collab.client.from("models").select("id").eq("id", m.draft.id);
  assert.equal(draft.length, 1);
  const { data: updated } = await u.collab.client.from("models").update({ version: "1.0.1" }).eq("id", m.draft.id).select("id");
  assert.equal(updated.length, 1);
});

// ---------------------------------------------------------------------------
// Model ownership (H1 takeover, M4)
// ---------------------------------------------------------------------------

test("a collaborator cannot take ownership of a model", async () => {
  const { error } = await u.collab.client.from("models").update({ publisher_id: u.collab.id }).eq("id", m.free.id);
  assert.ok(error, "owner change must be rejected");
  const { data } = await admin.from("models").select("publisher_id").eq("id", m.free.id).single();
  assert.equal(data.publisher_id, u.owner.id);
});

test("a collaborator cannot delete the model", async () => {
  const { data } = await u.collab.client.from("models").delete().eq("id", m.draft.id).select("id");
  assert.equal(data.length, 0);
});

test("a publisher cannot create a model under someone else's name", async () => {
  const { error } = await u.attacker.client.from("models").insert({
    model_name: "Fake", detailed_description: "x", short_description: "x", version: "1",
    response_time: 1, accuracy: 1, publisher_id: u.owner.id, status: "published",
  });
  assert.ok(error);
});

// ---------------------------------------------------------------------------
// Subscriptions (H3) and file access
// ---------------------------------------------------------------------------

test("buyers cannot subscribe to paid or draft models", async () => {
  for (const model of [m.paid, m.draft]) {
    const { error } = await u.buyer.client.from("subscriptions").insert({ buyer_id: u.buyer.id, model_id: model.id, status: "active" });
    assert.ok(error, `subscription to ${model.status}/${model.subscription_type} must fail`);
  }
});

test("free subscription works, grants file access, and cannot be moved to a paid model", async () => {
  const { data: sub, error } = await u.buyer.client.from("subscriptions")
    .insert({ buyer_id: u.buyer.id, model_id: m.free.id, status: "active" }).select().single();
  assert.ifError(error);
  assert.equal(await canDownload(u.buyer.client, `${u.owner.id}/${m.free.id}/owner.txt`), true);
  assert.equal(await canDownload(u.buyer.client, `${u.owner.id}/${m.paid.id}/owner.txt`), false);

  const { error: moveError } = await u.buyer.client.from("subscriptions").update({ model_id: m.paid.id }).eq("id", sub.id);
  assert.ok(moveError, "moving to a paid model must fail");
  assert.equal(await canDownload(u.buyer.client, `${u.owner.id}/${m.paid.id}/owner.txt`), false);
});

test("cancel removes file access and resubscribing reactivates the same record", async () => {
  const { data: cancelled } = await u.buyer.client.from("subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("buyer_id", u.buyer.id).eq("model_id", m.free.id).select("id");
  assert.equal(cancelled.length, 1);
  const { data: visibleFiles } = await u.buyer.client.from("model_files").select("id").eq("model_id", m.free.id);
  assert.equal(visibleFiles.length, 0, "file list is hidden after cancelling");
  assert.equal(await canDownload(u.buyer.client, `${u.owner.id}/${m.free.id}/owner.txt`), false);

  const { data: reactivated } = await u.buyer.client.from("subscriptions")
    .update({ status: "active", cancelled_at: null })
    .eq("buyer_id", u.buyer.id).eq("model_id", m.free.id).select("id");
  assert.equal(reactivated.length, 1);
  assert.equal(await canDownload(u.buyer.client, `${u.owner.id}/${m.free.id}/owner.txt`), true);
});

test("collaborators can read subscribers of models they co-manage; others can't", async () => {
  const { data: collabView } = await u.collab.client.from("subscriptions").select("id").eq("model_id", m.free.id);
  assert.equal(collabView.length, 1);
  const { data: attackerView } = await u.attacker.client.from("subscriptions").select("id").eq("model_id", m.free.id);
  assert.equal(attackerView.length, 0);
});

test("subscriber counts are correct for any viewer", async () => {
  const { data } = await u.attacker.client.rpc("get_model_subscriber_counts", { p_model_ids: [m.free.id] });
  assert.equal(Number(data[0].active_subscribers), 1);
  assert.equal(Number(data[0].total_subscribers), 1);
});

// ---------------------------------------------------------------------------
// Storage (B2, L3)
// ---------------------------------------------------------------------------

test("collaborator uploads (owner's or own folder) are downloadable and deletable by the owner", async () => {
  const inOwnerFolder = `${u.owner.id}/${m.free.id}/collab-a.txt`;
  const inCollabFolder = `${u.collab.id}/${m.free.id}/collab-b.txt`;
  assert.ifError((await upload(u.collab.client, inOwnerFolder, m.free.id)).error);
  assert.ifError((await upload(u.collab.client, inCollabFolder, m.free.id)).error);

  assert.equal(await canDownload(u.owner.client, inOwnerFolder), true);
  assert.equal(await canDownload(u.owner.client, inCollabFolder), true);

  const { data: removed } = await u.owner.client.storage.from(BUCKET).remove([inCollabFolder]);
  assert.equal(removed.length, 1, "owner can delete a collaborator's upload");
});

test("uploads are only allowed under a model the uploader manages", async () => {
  const { error: noModel } = await u.attacker.client.storage.from(BUCKET)
    .upload(`${u.attacker.id}/${randomUUID()}/x.txt`, new Blob(["x"]));
  assert.ok(noModel, "upload outside any model must fail");
  const { error: othersModel } = await u.attacker.client.storage.from(BUCKET)
    .upload(`${u.attacker.id}/${m.free.id}/x.txt`, new Blob(["x"]));
  assert.ok(othersModel, "upload under someone else's model must fail");
});

// ---------------------------------------------------------------------------
// Discussions (M3, B4)
// ---------------------------------------------------------------------------

test("discussions and comments are always posted as the author with their real name", async () => {
  const { error: spoof } = await u.attacker.client.from("discussions")
    .insert({ model_id: m.free.id, user_id: u.owner.id, user_name: "MIMOS Admin", title: "x", content: "x" });
  assert.ok(spoof, "posting as another user must fail");

  const { data: disc } = await u.attacker.client.from("discussions")
    .insert({ model_id: m.free.id, user_id: u.attacker.id, user_name: "MIMOS Admin", title: "t", content: "c" })
    .select().single();
  assert.equal(disc.user_name, "Renamed", "display name comes from the profile");

  const { data: comment } = await u.buyer.client.from("comments")
    .insert({ discussion_id: disc.id, user_id: u.buyer.id, user_name: "Fake", content: "c1" }).select().single();
  const { data: reply } = await u.owner.client.from("comments")
    .insert({ discussion_id: disc.id, user_id: u.owner.id, user_name: "Fake", content: "r1",
      parent_comment_id: comment.id, recipient_user_id: u.attacker.id, recipient_user_name: "Wrong" })
    .select().single();
  assert.equal(reply.recipient_user_id, u.buyer.id, "reply recipient comes from the parent comment");

  // Only the model team can delete; deleting a comment keeps its replies
  const { data: notAllowed } = await u.buyer.client.from("discussions").delete().eq("id", disc.id).select("id");
  assert.equal(notAllowed.length, 0);
  const { data: deletedComment } = await u.collab.client.from("comments").delete().eq("id", comment.id).select("id");
  assert.equal(deletedComment.length, 1);
  const { data: replyAfter } = await admin.from("comments").select("parent_comment_id").eq("id", reply.id).single();
  assert.equal(replyAfter.parent_comment_id, null);
  const { data: deletedDisc } = await u.owner.client.from("discussions").delete().eq("id", disc.id).select("id");
  assert.equal(deletedDisc.length, 1);
});

// ---------------------------------------------------------------------------
// Notifications (M2, B1, F2)
// ---------------------------------------------------------------------------

test("notifications cannot be created directly or through create_notification", async () => {
  const { error: rpcError } = await u.attacker.client.rpc("create_notification", {
    p_user_id: u.owner.id, p_notification_type: "new_comment", p_title: "Phish", p_message: "Phish",
  });
  assert.ok(rpcError);
  const { error: insertError } = await u.attacker.client.from("notifications")
    .insert({ user_id: u.owner.id, notification_type: "new_comment", title: "Phish", message: "Phish" });
  assert.ok(insertError);
});

test("notify_event rejects events the caller didn't perform", async () => {
  const { error: noSub } = await u.attacker.client.rpc("notify_event", { p_event: "subscribed", p_ref: m.free.id });
  assert.ok(noSub);
  const { error: notTeam } = await u.attacker.client.rpc("notify_event", {
    p_event: "model_updated", p_ref: m.free.id, p_changes: [{ field: "version" }],
  });
  assert.ok(notTeam);
  const { error: anonCall } = await anon.rpc("notify_event", { p_event: "rating", p_ref: m.free.id });
  assert.ok(anonCall);
});

test("subscribing notifies the owner, the collaborator and the subscriber", async () => {
  const { data: count, error } = await u.buyer.client.rpc("notify_event", { p_event: "subscribed", p_ref: m.free.id });
  assert.ifError(error);
  assert.equal(count, 3);
  const types = async (userId) => (await admin.from("notifications").select("notification_type")
    .eq("user_id", userId).eq("related_model_id", m.free.id)).data.map((n) => n.notification_type);
  assert.ok((await types(u.owner.id)).includes("new_subscription"));
  assert.ok((await types(u.collab.id)).includes("collaborator_subscription"));
  assert.ok((await types(u.buyer.id)).includes("subscription_success"));
});

test("a collaborator's model edit notifies active subscribers (one per changed field)", async () => {
  await u.collab.client.from("models").update({ version: "2.0.0" }).eq("id", m.free.id);
  const { data: count, error } = await u.collab.client.rpc("notify_event", {
    p_event: "model_updated", p_ref: m.free.id, p_changes: [{ field: "version" }, { field: "not_a_field" }],
  });
  assert.ifError(error);
  assert.equal(count, 1);
  const { data } = await admin.from("notifications").select("message, metadata")
    .eq("user_id", u.buyer.id).eq("notification_type", "model_updated").eq("related_model_id", m.free.id);
  assert.equal(data[0].message, "New version 2.0.0 released");
  assert.deepEqual(data[0].metadata.updatedFields, ["version"]);
});

// ---------------------------------------------------------------------------
// Ratings (L4)
// ---------------------------------------------------------------------------

test("the model team cannot rate its own model; a buyer's rating updates the stored average only", async () => {
  for (const actor of [u.owner, u.collab]) {
    const { error } = await actor.client.from("ratings").insert({ model_id: m.paid.id, user_id: actor.id, rating_value: 5 });
    assert.ok(error, "team rating must fail");
  }
  const { data: before } = await admin.from("models").select("updated_at").eq("id", m.paid.id).single();
  const { error } = await u.buyer.client.from("ratings")
    .upsert({ model_id: m.paid.id, user_id: u.buyer.id, rating_value: 4 }, { onConflict: "model_id,user_id" });
  assert.ifError(error);
  const { data: after } = await admin.from("models").select("average_rating, total_rating_count, updated_at").eq("id", m.paid.id).single();
  assert.equal(Number(after.average_rating), 4);
  assert.equal(after.total_rating_count, 1);
  assert.equal(after.updated_at, before.updated_at, "rating must not change Last Update");

  const { data: count } = await u.buyer.client.rpc("notify_event", { p_event: "rating", p_ref: m.paid.id });
  assert.equal(count, 2, "owner and collaborator are notified");
});

// ---------------------------------------------------------------------------
// Views, downloads and activity (L1, B3)
// ---------------------------------------------------------------------------

test("views: only signed-in users record their own view, once; history is private", async () => {
  const { error: anonError } = await anon.from("views").insert({ model_id: m.free.id, user_id: u.buyer.id });
  assert.ok(anonError);
  const { error: forged } = await u.attacker.client.from("views").insert({ model_id: m.free.id, user_id: u.buyer.id });
  assert.ok(forged);
  assert.ifError((await u.buyer.client.from("views").insert({ model_id: m.free.id, user_id: u.buyer.id })).error);
  const { error: duplicate } = await u.buyer.client.from("views").insert({ model_id: m.free.id, user_id: u.buyer.id });
  assert.ok(duplicate, "second view by the same user must be rejected");

  const { data: othersViews } = await u.attacker.client.from("views").select("id").eq("model_id", m.free.id);
  assert.equal(othersViews.length, 0);
  const { data: stats } = await u.attacker.client.rpc("get_model_view_stats", { p_model_ids: [m.free.id] });
  assert.equal(Number(stats[0].total_views), 1);
  const { data: stamps } = await u.owner.client.rpc("get_model_view_timestamps", {
    p_model_ids: [m.free.id], p_since: new Date(Date.now() - 86400000).toISOString(),
  });
  assert.equal(stamps.length, 1);
  const { data: noStamps } = await u.attacker.client.rpc("get_model_view_timestamps", {
    p_model_ids: [m.free.id], p_since: new Date(Date.now() - 86400000).toISOString(),
  });
  assert.equal(noStamps.length, 0, "only the model team gets timestamps");
});

test("downloads: only users with access can log one; totals include every user", async () => {
  const activity = (userId, modelId) => ({ user_id: userId, activity_type: "downloaded", title: "t", model_id: modelId, role: "buyer" });
  const { error: noAccess } = await u.attacker.client.from("user_activities").insert(activity(u.attacker.id, m.free.id));
  assert.ok(noAccess, "no subscription, no download record");
  assert.ifError((await u.buyer.client.from("user_activities").insert(activity(u.buyer.id, m.free.id))).error);

  const { data } = await u.attacker.client.rpc("get_model_download_counts", { p_model_ids: [m.free.id] });
  assert.equal(Number(data[0].downloads), 1, "another user's download is counted");
  const { data: ownOnly } = await u.attacker.client.from("user_activities").select("id").eq("model_id", m.free.id);
  assert.equal(ownOnly.length, 0, "activity rows stay private");
});

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

test("custom categories must be attributed to their creator", async () => {
  const { error: spoof } = await u.attacker.client.from("categories")
    .insert({ name: `Spoof ${RUN}`, is_custom: true, created_by: u.owner.id });
  assert.ok(spoof);
  const { data, error } = await u.attacker.client.from("categories")
    .insert({ name: `Own ${RUN}`, is_custom: true, created_by: u.attacker.id }).select().single();
  assert.ifError(error);
  createdCategoryIds.push(data.id);
});
