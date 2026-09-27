import type { Express, NextFunction, Request, Response } from "express";
import { type Server } from "http";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabase-admin";

// Every sign-in provider linked to an account (metadata and identities can disagree)
function getProviders(user: User): string[] {
  const providersFromMeta: string[] = user.app_metadata?.providers || [];
  const providersFromIdentities = user.identities?.map((i) => i.provider) || [];
  return Array.from(new Set([...providersFromMeta, ...providersFromIdentities]));
}

// Find an account by email, paging through the admin user list
async function findUserByEmail(email: string): Promise<User | null> {
  const perPage = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < perPage) return null;
  }
}

// The signed-in user behind the request's Supabase access token, verified by Supabase Auth
async function getRequestUser(req: Request): Promise<User | null> {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// Simple fixed-window rate limit per client IP for the auth endpoints
const AUTH_RATE_LIMIT = 20;
const AUTH_RATE_WINDOW_MS = 10 * 60 * 1000;
const authRequestCounts = new Map<string, { count: number; windowStart: number }>();

function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || "unknown";
  const entry = authRequestCounts.get(key);

  if (!entry || now - entry.windowStart >= AUTH_RATE_WINDOW_MS) {
    authRequestCounts.set(key, { count: 1, windowStart: now });
    return next();
  }

  entry.count++;
  if (entry.count > AUTH_RATE_LIMIT) {
    res.setHeader("Retry-After", Math.ceil((entry.windowStart + AUTH_RATE_WINDOW_MS - now) / 1000));
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  next();
}

// Forget expired windows so the map doesn't grow without bound
setInterval(() => {
  const now = Date.now();
  authRequestCounts.forEach((entry, key) => {
    if (now - entry.windowStart >= AUTH_RATE_WINDOW_MS) authRequestCounts.delete(key);
  });
}, AUTH_RATE_WINDOW_MS).unref();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Used by the Docker / docker-compose health checks
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRateLimit);

  // Tells the sign-up form whether an email belongs to a Google-only account.
  // Read-only: it never changes an account, and unknown emails get the same
  // answer as accounts that already have a password.
  app.post("/api/auth/account-status", async (req, res) => {
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const user = await findUserByEmail(email);
      const providers = user ? getProviders(user) : [];

      return res.json({
        googleOnly: providers.includes("google") && !providers.includes("email"),
      });
    } catch (error) {
      console.error("Error checking account status:", error);
      return res.status(500).json({ error: "Failed to check account status" });
    }
  });

  // Finishes adding email/password sign-in to a Google account. The caller must
  // be signed in as that account (via the verification link emailed from the
  // sign-up form), so it can only ever act on the caller's own account.
  app.post("/api/auth/link-email-identity", async (req, res) => {
    try {
      const user = await getRequestUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: "Not authenticated" });
      }

      const providers = getProviders(user);
      let identityLinked = false;

      if (providers.includes("google") && !providers.includes("email")) {
        const { error: identityError } = await supabaseAdmin.rpc("add_email_identity_to_user", {
          p_user_id: user.id,
        });

        if (identityError) {
          // The password is already set, so email sign-in still works
          console.error("Error adding email identity:", identityError);
        } else {
          identityLinked = true;
        }
      }

      // Add the portal role the user was registering for, if they don't have it yet
      let roleAdded = false;
      const role = req.body?.role;

      if (role === "buyer" || role === "publisher") {
        const { data: roleRow, error: roleError } = await supabaseAdmin
          .from("roles")
          .select("id")
          .eq("role_name", role)
          .single();

        if (roleError || !roleRow) {
          console.error("Error finding role:", roleError);
        } else {
          const { error: userRoleError } = await supabaseAdmin
            .from("user_roles")
            .upsert(
              { user_id: user.id, role_id: roleRow.id },
              { onConflict: "user_id,role_id", ignoreDuplicates: true }
            );

          if (userRoleError) {
            console.error("Error adding role:", userRoleError);
          } else {
            roleAdded = true;
          }
        }
      }

      return res.json({ success: true, identityLinked, roleAdded });
    } catch (error: any) {
      console.error("Server error in link-email-identity:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  return httpServer;
}
