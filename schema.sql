


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_user_with_role"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_role_name" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_role_id UUID;
  v_user_role_id UUID;
  v_result JSON;
BEGIN
  -- Step 1: Insert or update user in users table
  INSERT INTO users (id, name, email)
  VALUES (p_user_id, p_name, p_email)
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      email = EXCLUDED.email,
      updated_at = NOW();

  -- Step 2: Get role ID
  SELECT id INTO v_role_id
  FROM roles
  WHERE role_name = p_role_name;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % not found', p_role_name;
  END IF;

  -- Step 3: Insert user_role (skip if already exists)
  INSERT INTO user_roles (user_id, role_id)
  VALUES (p_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING
  RETURNING id INTO v_user_role_id;

  -- Step 4: Return success result
  v_result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'role_id', v_role_id,
    'user_role_id', v_user_role_id,
    'message', 'User and role created successfully'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    v_result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE
    );
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."create_user_with_role"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_role_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "is_custom" boolean DEFAULT false
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborators" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "model_id" "uuid",
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collaborators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "discussion_id" "uuid",
    "user_id" "uuid",
    "user_name" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discussions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "model_id" "uuid",
    "user_id" "uuid",
    "user_name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."discussions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid",
    "category_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."model_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_files" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "model_id" "uuid",
    "file_name" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "description" "text",
    "file_size" bigint,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "file_path" "text",
    CONSTRAINT "model_files_file_type_check" CHECK (("file_type" = ANY (ARRAY['upload'::"text", 'external_url'::"text"])))
);


ALTER TABLE "public"."model_files" OWNER TO "postgres";


COMMENT ON COLUMN "public"."model_files"."file_path" IS 'Storage path for uploaded files (null for external URLs). Used for file deletion and management.';



CREATE TABLE IF NOT EXISTS "public"."models" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "model_name" "text" NOT NULL,
    "detailed_description" "text" NOT NULL,
    "version" "text" NOT NULL,
    "features" "text"[],
    "response_time" integer NOT NULL,
    "accuracy" numeric(5,2) NOT NULL,
    "average_rating" numeric(3,2) DEFAULT 0,
    "total_rating_count" integer DEFAULT 0,
    "api_documentation" "text",
    "publisher_id" "uuid",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "subscription_type" "text" DEFAULT 'free'::"text" NOT NULL,
    "subscription_amount" numeric(10,2),
    "view_count" integer DEFAULT 0,
    "published_on" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "api_spec_format" "text" DEFAULT 'text'::"text",
    "short_description" "text" DEFAULT ''::"text" NOT NULL,
    CONSTRAINT "models_accuracy_check" CHECK ((("accuracy" >= (0)::numeric) AND ("accuracy" <= (100)::numeric))),
    CONSTRAINT "models_api_spec_format_check" CHECK (("api_spec_format" = ANY (ARRAY['json'::"text", 'yaml'::"text", 'markdown'::"text", 'text'::"text"]))),
    CONSTRAINT "models_average_rating_check" CHECK ((("average_rating" >= (0)::numeric) AND ("average_rating" <= (5)::numeric))),
    CONSTRAINT "models_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text"]))),
    CONSTRAINT "models_subscription_type_check" CHECK (("subscription_type" = ANY (ARRAY['free'::"text", 'paid'::"text"])))
);


ALTER TABLE "public"."models" OWNER TO "postgres";


COMMENT ON COLUMN "public"."models"."detailed_description" IS 'Detailed description of the model, shown in the Detailed Description section';



COMMENT ON COLUMN "public"."models"."short_description" IS 'Brief summary of the model (max 700 characters), shown in cards and at top of detail page';



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "notification_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "related_model_id" "uuid",
    "related_model_name" "text",
    "related_discussion_id" "uuid",
    "is_read" boolean DEFAULT false,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_notification_type_check" CHECK (("notification_type" = ANY (ARRAY['new_subscription'::"text", 'discussion_message'::"text", 'model_rating_changed'::"text", 'subscription_success'::"text", 'discussion_reply'::"text", 'model_updated'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ratings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "model_id" "uuid",
    "user_id" "uuid",
    "rating_value" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ratings_rating_value_check" CHECK ((("rating_value" >= 1) AND ("rating_value" <= 5)))
);


ALTER TABLE "public"."ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "role_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "roles_role_name_check" CHECK (("role_name" = ANY (ARRAY['buyer'::"text", 'publisher'::"text"])))
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "buyer_id" "uuid",
    "model_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "subscribed_at" timestamp with time zone DEFAULT "now"(),
    "approved_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "activity_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "model_id" "uuid",
    "model_name" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_activities_activity_type_check" CHECK (("activity_type" = ANY (ARRAY['subscribed'::"text", 'unsubscribed'::"text", 'downloaded'::"text", 'commented'::"text", 'rated'::"text"])))
);


ALTER TABLE "public"."user_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "role_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "company_name" "text",
    "bio" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_roles_view" AS
 SELECT "u"."id" AS "user_id",
    "u"."name",
    "u"."email",
    "r"."role_name",
    "ur"."created_at" AS "role_assigned_at"
   FROM (("public"."users" "u"
     JOIN "public"."user_roles" "ur" ON (("u"."id" = "ur"."user_id")))
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")));


ALTER VIEW "public"."user_roles_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."views" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "model_id" "uuid",
    "user_id" "uuid",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."views" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_model_id_user_id_key" UNIQUE ("model_id", "user_id");



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."model_categories"
    ADD CONSTRAINT "model_categories_model_id_category_id_key" UNIQUE ("model_id", "category_id");



ALTER TABLE ONLY "public"."model_categories"
    ADD CONSTRAINT "model_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."model_files"
    ADD CONSTRAINT "model_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_model_id_user_id_key" UNIQUE ("model_id", "user_id");



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_role_name_key" UNIQUE ("role_name");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_buyer_id_model_id_key" UNIQUE ("buyer_id", "model_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_id_key" UNIQUE ("user_id", "role_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."views"
    ADD CONSTRAINT "views_pkey" PRIMARY KEY ("id");



CREATE INDEX "collaborators_model_id_idx" ON "public"."collaborators" USING "btree" ("model_id");



CREATE INDEX "collaborators_user_id_idx" ON "public"."collaborators" USING "btree" ("user_id");



CREATE INDEX "comments_created_at_idx" ON "public"."comments" USING "btree" ("created_at");



CREATE INDEX "comments_discussion_id_idx" ON "public"."comments" USING "btree" ("discussion_id");



CREATE INDEX "discussions_created_at_idx" ON "public"."discussions" USING "btree" ("created_at" DESC);



CREATE INDEX "discussions_model_id_idx" ON "public"."discussions" USING "btree" ("model_id");



CREATE INDEX "idx_categories_name" ON "public"."categories" USING "btree" ("name");



CREATE INDEX "idx_model_categories_category_id" ON "public"."model_categories" USING "btree" ("category_id");



CREATE INDEX "idx_model_categories_model_id" ON "public"."model_categories" USING "btree" ("model_id");



CREATE INDEX "idx_user_activities_created_at" ON "public"."user_activities" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_activities_type" ON "public"."user_activities" USING "btree" ("activity_type");



CREATE INDEX "idx_user_activities_user_created" ON "public"."user_activities" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_user_activities_user_id" ON "public"."user_activities" USING "btree" ("user_id");



CREATE INDEX "model_files_model_id_idx" ON "public"."model_files" USING "btree" ("model_id");



CREATE INDEX "models_created_at_idx" ON "public"."models" USING "btree" ("created_at" DESC);



CREATE INDEX "models_publisher_id_idx" ON "public"."models" USING "btree" ("publisher_id");



CREATE INDEX "models_status_idx" ON "public"."models" USING "btree" ("status");



CREATE INDEX "models_subscription_type_idx" ON "public"."models" USING "btree" ("subscription_type");



CREATE INDEX "notifications_created_at_idx" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "notifications_is_read_idx" ON "public"."notifications" USING "btree" ("is_read");



CREATE INDEX "notifications_type_idx" ON "public"."notifications" USING "btree" ("notification_type");



CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "ratings_model_id_idx" ON "public"."ratings" USING "btree" ("model_id");



CREATE INDEX "ratings_user_id_idx" ON "public"."ratings" USING "btree" ("user_id");



CREATE INDEX "subscriptions_buyer_id_idx" ON "public"."subscriptions" USING "btree" ("buyer_id");



CREATE INDEX "subscriptions_model_id_idx" ON "public"."subscriptions" USING "btree" ("model_id");



CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions" USING "btree" ("status");



CREATE INDEX "user_roles_role_id_idx" ON "public"."user_roles" USING "btree" ("role_id");



CREATE INDEX "user_roles_user_id_idx" ON "public"."user_roles" USING "btree" ("user_id");



CREATE INDEX "users_email_idx" ON "public"."users" USING "btree" ("email");



CREATE INDEX "views_model_id_idx" ON "public"."views" USING "btree" ("model_id");



CREATE INDEX "views_timestamp_idx" ON "public"."views" USING "btree" ("timestamp" DESC);



CREATE OR REPLACE TRIGGER "update_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_discussions_updated_at" BEFORE UPDATE ON "public"."discussions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_models_updated_at" BEFORE UPDATE ON "public"."models" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ratings_updated_at" BEFORE UPDATE ON "public"."ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."model_categories"
    ADD CONSTRAINT "model_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."model_categories"
    ADD CONSTRAINT "model_categories_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."model_files"
    ADD CONSTRAINT "model_files_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_related_discussion_id_fkey" FOREIGN KEY ("related_discussion_id") REFERENCES "public"."discussions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_related_model_id_fkey" FOREIGN KEY ("related_model_id") REFERENCES "public"."models"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_activities"
    ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."views"
    ADD CONSTRAINT "views_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."views"
    ADD CONSTRAINT "views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Anyone can track views" ON "public"."views" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view categories" ON "public"."categories" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anyone can view model categories" ON "public"."model_categories" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Authenticated users can create categories" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can create comments" ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can create discussions" ON "public"."discussions" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can create notifications" ON "public"."notifications" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can insert activities" ON "public"."user_activities" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Buyers can create subscriptions" ON "public"."subscriptions" FOR INSERT WITH CHECK ((("buyer_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("r"."role_name" = 'buyer'::"text"))))));



CREATE POLICY "Buyers can delete own subscriptions" ON "public"."subscriptions" FOR DELETE USING (("buyer_id" = "auth"."uid"()));



CREATE POLICY "Comments are public" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Discussions are public" ON "public"."discussions" FOR SELECT USING (true);



CREATE POLICY "Model files are viewable by subscribers and owners" ON "public"."model_files" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."models" "m"
  WHERE (("m"."id" = "model_files"."model_id") AND (("m"."publisher_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."subscriptions" "s"
          WHERE (("s"."model_id" = "m"."id") AND ("s"."buyer_id" = "auth"."uid"()) AND ("s"."status" = 'active'::"text")))))))));



CREATE POLICY "Model owners and collaborators can view collaborators" ON "public"."collaborators" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."models"
  WHERE (("models"."id" = "collaborators"."model_id") AND ("models"."publisher_id" = "auth"."uid"())))) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Model owners can add collaborators" ON "public"."collaborators" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."models"
  WHERE (("models"."id" = "collaborators"."model_id") AND ("models"."publisher_id" = "auth"."uid"())))));



CREATE POLICY "Model owners can manage files" ON "public"."model_files" USING ((EXISTS ( SELECT 1
   FROM "public"."models"
  WHERE (("models"."id" = "model_files"."model_id") AND ("models"."publisher_id" = "auth"."uid"())))));



CREATE POLICY "Model owners can remove collaborators" ON "public"."collaborators" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."models"
  WHERE (("models"."id" = "collaborators"."model_id") AND ("models"."publisher_id" = "auth"."uid"())))));



CREATE POLICY "Published models are viewable by everyone" ON "public"."models" FOR SELECT USING ((("status" = 'published'::"text") OR ("publisher_id" = "auth"."uid"())));



CREATE POLICY "Publishers can add categories to their models" ON "public"."model_categories" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."models"
  WHERE (("models"."id" = "model_categories"."model_id") AND ("models"."publisher_id" = "auth"."uid"())))));



CREATE POLICY "Publishers can approve, buyers can cancel" ON "public"."subscriptions" FOR UPDATE USING ((("buyer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."models"
  WHERE (("models"."id" = "subscriptions"."model_id") AND ("models"."publisher_id" = "auth"."uid"()))))));



CREATE POLICY "Publishers can create models" ON "public"."models" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("r"."role_name" = 'publisher'::"text")))));



CREATE POLICY "Publishers can delete own models" ON "public"."models" FOR DELETE USING (("publisher_id" = "auth"."uid"()));



CREATE POLICY "Publishers can remove categories from their models" ON "public"."model_categories" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."models"
  WHERE (("models"."id" = "model_categories"."model_id") AND ("models"."publisher_id" = "auth"."uid"())))));



CREATE POLICY "Publishers can update own models" ON "public"."models" FOR UPDATE USING (("publisher_id" = "auth"."uid"()));



CREATE POLICY "Ratings are public" ON "public"."ratings" FOR SELECT USING (true);



CREATE POLICY "Roles are viewable by everyone" ON "public"."roles" FOR SELECT USING (true);



CREATE POLICY "User roles are viewable by everyone" ON "public"."user_roles" FOR SELECT USING (true);



CREATE POLICY "Users are viewable by everyone" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Users can add their own roles" ON "public"."user_roles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own activities" ON "public"."user_activities" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own notifications" ON "public"."notifications" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own ratings" ON "public"."ratings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can rate models" ON "public"."ratings" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (NOT (EXISTS ( SELECT 1
   FROM "public"."ratings" "r"
  WHERE (("r"."model_id" = "ratings"."model_id") AND ("r"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can remove their own roles" ON "public"."user_roles" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own activities" ON "public"."user_activities" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own ratings" ON "public"."ratings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own activities" ON "public"."user_activities" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view relevant subscriptions" ON "public"."subscriptions" FOR SELECT USING ((("buyer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."models"
  WHERE (("models"."id" = "subscriptions"."model_id") AND ("models"."publisher_id" = "auth"."uid"()))))));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discussions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."views" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_user_with_role"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_role_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_with_role"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_role_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_with_role"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_role_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."collaborators" TO "anon";
GRANT ALL ON TABLE "public"."collaborators" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborators" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."discussions" TO "anon";
GRANT ALL ON TABLE "public"."discussions" TO "authenticated";
GRANT ALL ON TABLE "public"."discussions" TO "service_role";



GRANT ALL ON TABLE "public"."model_categories" TO "anon";
GRANT ALL ON TABLE "public"."model_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."model_categories" TO "service_role";



GRANT ALL ON TABLE "public"."model_files" TO "anon";
GRANT ALL ON TABLE "public"."model_files" TO "authenticated";
GRANT ALL ON TABLE "public"."model_files" TO "service_role";



GRANT ALL ON TABLE "public"."models" TO "anon";
GRANT ALL ON TABLE "public"."models" TO "authenticated";
GRANT ALL ON TABLE "public"."models" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."ratings" TO "anon";
GRANT ALL ON TABLE "public"."ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."ratings" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."user_activities" TO "anon";
GRANT ALL ON TABLE "public"."user_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activities" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles_view" TO "anon";
GRANT ALL ON TABLE "public"."user_roles_view" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles_view" TO "service_role";



GRANT ALL ON TABLE "public"."views" TO "anon";
GRANT ALL ON TABLE "public"."views" TO "authenticated";
GRANT ALL ON TABLE "public"."views" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































