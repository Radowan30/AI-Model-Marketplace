-- =====================================================
-- AI Model Marketplace - Security Fixes
-- =====================================================
-- Run after 01-06. Closes the access-control gaps found in the
-- September 2026 security review. Each section is independent and
-- was applied to the live project as its own migration.
-- =====================================================

-- =====================================================
-- SECTION 1: IDENTITY HELPERS AND FUNCTION PRIVILEGES
-- =====================================================

-- Verified login email of the caller (NULL when signed out or unconfirmed).
-- Authorization must use this, never the editable profile email.
CREATE OR REPLACE FUNCTION public.current_user_email()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT lower(u.email) FROM auth.users u
  WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL
$function$;

CREATE OR REPLACE FUNCTION public.is_collaborator_by_email(p_model_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.model_id = p_model_id
      AND lower(c.email) = public.current_user_email()
  )
$function$;

ALTER FUNCTION public.is_model_owner(uuid) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Identity linking is server-only (service role)
REVOKE EXECUTE ON FUNCTION public.add_email_identity_to_user(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_email_identity_to_user(uuid) TO service_role;
ALTER FUNCTION public.add_email_identity_to_user(uuid) SET search_path = public;

-- Collaborators see their own collaborator rows by verified login email
DROP POLICY IF EXISTS "Model owners and collaborators can view collaborators" ON public.collaborators;
CREATE POLICY "Model owners and collaborators can view collaborators"
ON public.collaborators FOR SELECT
USING (public.is_model_owner(model_id) OR lower(email) = public.current_user_email());

-- =====================================================
-- SECTION 2: MODELS
-- =====================================================

-- A model can only be created under the caller's own account
DROP POLICY IF EXISTS "Publishers can create models" ON public.models;
CREATE POLICY "Publishers can create models"
ON public.models FOR INSERT
WITH CHECK (
  publisher_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.role_name = 'publisher'
  )
);

-- Ownership never changes after creation
CREATE OR REPLACE FUNCTION public.prevent_model_owner_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.publisher_id IS DISTINCT FROM OLD.publisher_id THEN
    RAISE EXCEPTION 'The owner of a model cannot be changed' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_model_owner_change ON public.models;
CREATE TRIGGER prevent_model_owner_change
BEFORE UPDATE OF publisher_id ON public.models
FOR EACH ROW EXECUTE FUNCTION public.prevent_model_owner_change();

-- =====================================================
-- SECTION 3: SUBSCRIPTIONS
-- =====================================================

-- Buyers may only subscribe to free, published models (no payment flow exists)
DROP POLICY IF EXISTS "Buyers can create subscriptions" ON public.subscriptions;
CREATE POLICY "Buyers subscribe to free published models"
ON public.subscriptions FOR INSERT
WITH CHECK (
  buyer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.role_name = 'buyer'
  )
  AND EXISTS (
    SELECT 1 FROM public.models m
    WHERE m.id = subscriptions.model_id
      AND m.status = 'published' AND m.subscription_type = 'free'
  )
);

DROP POLICY IF EXISTS "Publishers can approve, buyers can cancel" ON public.subscriptions;
CREATE POLICY "Buyers cancel or reactivate their subscriptions"
ON public.subscriptions FOR UPDATE
USING (buyer_id = auth.uid())
WITH CHECK (
  buyer_id = auth.uid()
  AND (
    status = 'cancelled'
    OR EXISTS (
      SELECT 1 FROM public.models m
      WHERE m.id = subscriptions.model_id
        AND m.status = 'published' AND m.subscription_type = 'free'
    )
  )
);

CREATE POLICY "Owners manage subscriptions to their models"
ON public.subscriptions FOR UPDATE
USING (public.is_model_owner(model_id))
WITH CHECK (public.is_model_owner(model_id));

-- Collaborators see subscribers of models they co-manage (Publisher Dashboard)
CREATE POLICY "Collaborators can view subscriptions to their models"
ON public.subscriptions FOR SELECT
USING (public.is_collaborator_by_email(model_id));

-- A subscription cannot be moved to another buyer or model
CREATE OR REPLACE FUNCTION public.prevent_subscription_key_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.buyer_id IS DISTINCT FROM OLD.buyer_id OR NEW.model_id IS DISTINCT FROM OLD.model_id THEN
    RAISE EXCEPTION 'A subscription cannot be moved to another buyer or model' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_subscription_key_change ON public.subscriptions;
CREATE TRIGGER prevent_subscription_key_change
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.prevent_subscription_key_change();

-- =====================================================
-- SECTION 4: DISCUSSIONS AND COMMENTS
-- =====================================================

-- Posts are always made as the caller
DROP POLICY IF EXISTS "Authenticated users can create discussions" ON public.discussions;
CREATE POLICY "Users create discussions as themselves"
ON public.discussions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Users create comments as themselves"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Display names come from the author's profile, never from the request
CREATE OR REPLACE FUNCTION public.set_discussion_author_name()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.user_name := COALESCE((SELECT u.name FROM public.users u WHERE u.id = NEW.user_id), 'User');
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS set_discussion_author_name ON public.discussions;
CREATE TRIGGER set_discussion_author_name
BEFORE INSERT ON public.discussions
FOR EACH ROW EXECUTE FUNCTION public.set_discussion_author_name();

CREATE OR REPLACE FUNCTION public.set_comment_author_names()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.user_name := COALESCE((SELECT u.name FROM public.users u WHERE u.id = NEW.user_id), 'User');
  IF NEW.parent_comment_id IS NULL THEN
    NEW.recipient_user_id := NULL;
    NEW.recipient_user_name := NULL;
  ELSE
    SELECT c.user_id, c.user_name
      INTO NEW.recipient_user_id, NEW.recipient_user_name
    FROM public.comments c
    WHERE c.id = NEW.parent_comment_id AND c.discussion_id = NEW.discussion_id;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS set_comment_author_names ON public.comments;
CREATE TRIGGER set_comment_author_names
BEFORE INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_comment_author_names();

REVOKE EXECUTE ON FUNCTION public.set_discussion_author_name() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_comment_author_names() FROM PUBLIC, anon, authenticated;

-- The model team can delete discussions and comments (the UI already offers this)
CREATE POLICY "Model team can delete discussions"
ON public.discussions FOR DELETE
TO authenticated
USING (public.is_model_owner(model_id) OR public.is_collaborator_by_email(model_id));

CREATE POLICY "Model team can delete comments"
ON public.comments FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.discussions d
  WHERE d.id = comments.discussion_id
    AND (public.is_model_owner(d.model_id) OR public.is_collaborator_by_email(d.model_id))
));

-- Deleting a comment keeps its replies
ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey,
  ADD CONSTRAINT comments_parent_comment_id_fkey
    FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE SET NULL;

-- =====================================================
-- SECTION 5: VIEWS, DOWNLOADS AND ACTIVITY STATISTICS
-- =====================================================

-- Only signed-in users record views, only as themselves, once per model
DROP POLICY IF EXISTS "Anyone can track views" ON public.views;
CREATE POLICY "Signed-in users record their own views"
ON public.views FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Who viewed what is private; totals come from the functions below
DROP POLICY IF EXISTS "Enable read access for all users" ON public.views;
CREATE POLICY "Users can read their own views"
ON public.views FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE UNIQUE INDEX IF NOT EXISTS views_one_per_user_per_model
  ON public.views (model_id, user_id) WHERE user_id IS NOT NULL;

-- Only users with file access can log a download, so download counts can't be inflated
DROP POLICY IF EXISTS "Authenticated users can insert activities" ON public.user_activities;
CREATE POLICY "Users log their own activities"
ON public.user_activities FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    activity_type <> 'downloaded'
    OR (
      model_id IS NOT NULL
      AND (
        public.is_model_owner(model_id)
        OR public.is_collaborator_by_email(model_id)
        OR EXISTS (
          SELECT 1 FROM public.subscriptions s
          WHERE s.model_id = user_activities.model_id
            AND s.buyer_id = auth.uid() AND s.status = 'active'
        )
      )
    )
  )
);

-- Activities are never edited by the app; editing could forge download records
DROP POLICY IF EXISTS "Users can update own activities" ON public.user_activities;

-- View totals for models the caller can see
CREATE OR REPLACE FUNCTION public.get_model_view_stats(p_model_ids uuid[])
 RETURNS TABLE (model_id uuid, total_views bigint, views_30_days bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT v.model_id,
         count(*),
         count(*) FILTER (WHERE v.timestamp >= now() - interval '30 days')
  FROM public.views v
  JOIN public.models m ON m.id = v.model_id
  WHERE v.model_id = ANY(p_model_ids)
    AND (m.status = 'published' OR m.publisher_id = auth.uid() OR public.is_collaborator_by_email(m.id))
  GROUP BY v.model_id
$function$;

-- View timestamps (no viewer identity) for the model team's weekly chart
CREATE OR REPLACE FUNCTION public.get_model_view_timestamps(p_model_ids uuid[], p_since timestamptz)
 RETURNS TABLE (model_id uuid, viewed_at timestamptz)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT v.model_id, v.timestamp
  FROM public.views v
  WHERE v.model_id = ANY(p_model_ids)
    AND v.timestamp >= p_since
    AND (public.is_model_owner(v.model_id) OR public.is_collaborator_by_email(v.model_id))
$function$;

-- Download totals across all users, for models the caller can see
CREATE OR REPLACE FUNCTION public.get_model_download_counts(p_model_ids uuid[])
 RETURNS TABLE (model_id uuid, downloads bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT ua.model_id, count(*)
  FROM public.user_activities ua
  JOIN public.models m ON m.id = ua.model_id
  WHERE ua.activity_type = 'downloaded'
    AND ua.model_id = ANY(p_model_ids)
    AND (m.status = 'published' OR m.publisher_id = auth.uid() OR public.is_collaborator_by_email(m.id))
  GROUP BY ua.model_id
$function$;

-- Subscriber totals for models the caller can see (each buyer can only read their own row)
CREATE OR REPLACE FUNCTION public.get_model_subscriber_counts(p_model_ids uuid[])
 RETURNS TABLE (model_id uuid, active_subscribers bigint, total_subscribers bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT s.model_id,
         count(*) FILTER (WHERE s.status = 'active'),
         count(*)
  FROM public.subscriptions s
  JOIN public.models m ON m.id = s.model_id
  WHERE s.model_id = ANY(p_model_ids)
    AND (m.status = 'published' OR m.publisher_id = auth.uid() OR public.is_collaborator_by_email(m.id))
  GROUP BY s.model_id
$function$;

-- =====================================================
-- SECTION 6: RATINGS
-- =====================================================

-- The model team cannot rate its own model
DROP POLICY IF EXISTS "Users can rate models" ON public.ratings;
CREATE POLICY "Users can rate models"
ON public.ratings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_model_owner(model_id)
  AND NOT public.is_collaborator_by_email(model_id)
);

DROP POLICY IF EXISTS "Users can update own ratings" ON public.ratings;
CREATE POLICY "Users can update own ratings"
ON public.ratings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_model_owner(model_id)
  AND NOT public.is_collaborator_by_email(model_id)
);

-- Keep the stored average and count in step with the ratings table
CREATE OR REPLACE FUNCTION public.refresh_model_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_model uuid;
  v_models uuid[];
BEGIN
  v_models := CASE TG_OP
    WHEN 'INSERT' THEN ARRAY[NEW.model_id]
    WHEN 'DELETE' THEN ARRAY[OLD.model_id]
    ELSE ARRAY[OLD.model_id, NEW.model_id]
  END;
  FOREACH v_model IN ARRAY v_models LOOP
    IF v_model IS NOT NULL THEN
      UPDATE public.models SET
        average_rating = COALESCE((SELECT round(avg(r.rating_value)::numeric, 2) FROM public.ratings r WHERE r.model_id = v_model), 0),
        total_rating_count = (SELECT count(*) FROM public.ratings r WHERE r.model_id = v_model)
      WHERE id = v_model;
    END IF;
  END LOOP;
  RETURN NULL;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.refresh_model_rating() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS refresh_model_rating ON public.ratings;
CREATE TRIGGER refresh_model_rating
AFTER INSERT OR UPDATE OR DELETE ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.refresh_model_rating();

-- Rating refreshes run inside a trigger; don't let them change a model's "Last Update"
DROP TRIGGER IF EXISTS update_models_updated_at ON public.models;
CREATE TRIGGER update_models_updated_at
BEFORE UPDATE ON public.models
FOR EACH ROW WHEN (pg_trigger_depth() < 1)
EXECUTE FUNCTION public.update_updated_at_column();

UPDATE public.models m SET
  average_rating = COALESCE((SELECT round(avg(r.rating_value)::numeric, 2) FROM public.ratings r WHERE r.model_id = m.id), 0),
  total_rating_count = (SELECT count(*) FROM public.ratings r WHERE r.model_id = m.id);

-- =====================================================
-- SECTION 7: CATEGORIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can create categories" ON public.categories;
CREATE POLICY "Authenticated users can create categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND is_custom = true
  AND char_length(btrim(name)) BETWEEN 1 AND 100
);

-- =====================================================
-- SECTION 8: STORAGE (model-files bucket)
-- =====================================================

-- Owners upload into their own folder; collaborators into their own or the owner's
-- folder; always under an existing model they manage.
DROP POLICY IF EXISTS "Allow owners and collaborators to upload" ON storage.objects;
CREATE POLICY "Allow owners and collaborators to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'model-files'
  AND EXISTS (
    SELECT 1 FROM public.models m
    WHERE m.id::text = (storage.foldername(objects.name))[2]
      AND (
        (m.publisher_id = auth.uid() AND (storage.foldername(objects.name))[1] = auth.uid()::text)
        OR (
          public.is_collaborator_by_email(m.id)
          AND (storage.foldername(objects.name))[1] IN (auth.uid()::text, m.publisher_id::text)
        )
      )
  )
);

-- Owners, collaborators and active subscribers of the file's model can download
DROP POLICY IF EXISTS "Allow owners, subscribers, and collaborators to download" ON storage.objects;
CREATE POLICY "Allow owners, subscribers, and collaborators to download"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'model-files'
  AND (
    (storage.foldername(objects.name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.model_files mf
      WHERE mf.file_path = objects.name
        AND (
          public.is_model_owner(mf.model_id)
          OR public.is_collaborator_by_email(mf.model_id)
          OR EXISTS (
            SELECT 1 FROM public.subscriptions s
            WHERE s.model_id = mf.model_id AND s.buyer_id = auth.uid() AND s.status = 'active'
          )
        )
    )
  )
);

-- Owners and collaborators can delete any file registered to their model
DROP POLICY IF EXISTS "Allow owners and collaborators to delete" ON storage.objects;
CREATE POLICY "Allow owners and collaborators to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'model-files'
  AND (
    (storage.foldername(objects.name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.model_files mf
      WHERE mf.file_path = objects.name
        AND (public.is_model_owner(mf.model_id) OR public.is_collaborator_by_email(mf.model_id))
    )
  )
);

-- =====================================================
-- SECTION 9: USER PROFILES AND ROLES
-- =====================================================

-- A profile is visible only to someone with a reason to see it
CREATE OR REPLACE FUNCTION public.can_view_user(p_target uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT p_target = auth.uid()
    -- publishers of listed models (and of drafts the caller collaborates on)
    OR EXISTS (
      SELECT 1 FROM public.models m
      WHERE m.publisher_id = p_target
        AND (m.status = 'published' OR public.is_collaborator_by_email(m.id))
    )
    -- subscribers of models the caller owns or co-manages
    OR EXISTS (
      SELECT 1 FROM public.subscriptions s
      JOIN public.models m ON m.id = s.model_id
      WHERE s.buyer_id = p_target
        AND (m.publisher_id = auth.uid() OR public.is_collaborator_by_email(m.id))
    )
    -- publishers can see other publishers ("Add Existing Publisher")
    OR (
      EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
              WHERE ur.user_id = auth.uid() AND r.role_name = 'publisher')
      AND EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id
                  WHERE ur.user_id = p_target AND r.role_name = 'publisher')
    )
$function$;

DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users see profiles they have a reason to see"
ON public.users FOR SELECT
USING (public.can_view_user(id));

-- Profiles are created by the system (sign-up trigger / create_user_with_role)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Phone, bio and company are private to their owner (read via get_my_profile)
REVOKE SELECT ON public.users FROM anon, authenticated;
GRANT SELECT (id, name, email, created_at, updated_at) ON public.users TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_profile()
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT json_build_object(
    'id', u.id, 'name', u.name, 'email', u.email,
    'company_name', u.company_name, 'phone', u.phone, 'bio', u.bio,
    'created_at', u.created_at, 'updated_at', u.updated_at
  )
  FROM public.users u WHERE u.id = auth.uid()
$function$;

REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- The profile email mirrors the login email; users cannot change it directly
CREATE OR REPLACE FUNCTION public.protect_user_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    NEW.email := OLD.email;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS protect_user_email ON public.users;
CREATE TRIGGER protect_user_email
BEFORE UPDATE OF email ON public.users
FOR EACH ROW EXECUTE FUNCTION public.protect_user_email();

-- Emails are unique regardless of letter case
UPDATE public.users SET email = lower(email) WHERE email <> lower(email);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON public.users (lower(email));
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;

-- Role assignments are only needed by signed-in flows
REVOKE SELECT ON public.user_roles FROM anon;

-- Unused SECURITY DEFINER view that exposed every user's email and roles
DROP VIEW IF EXISTS public.user_roles_view;

-- =====================================================
-- SECTION 10: ACCOUNT CREATION
-- =====================================================

-- Create the profile (and the requested portal role) when an auth account is created,
-- atomically with sign-up. Never blocks a sign-up.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_role text := NEW.raw_user_meta_data ->> 'role';
  v_name text := COALESCE(
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'User'
  );
BEGIN
  IF NEW.email IS NOT NULL THEN
    INSERT INTO public.users (id, name, email)
    VALUES (NEW.id, v_name, lower(NEW.email))
    ON CONFLICT DO NOTHING;

    IF v_role IN ('buyer', 'publisher') THEN
      INSERT INTO public.user_roles (user_id, role_id)
      SELECT NEW.id, r.id FROM public.roles r WHERE r.role_name = v_role
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_auth_user(%): %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Signed-in callers may only act on their own account. A signed-out call is only
-- accepted to finish a brand-new, unconfirmed sign-up (email confirmation returns no
-- session), and never changes an existing account. The email always comes from auth.
CREATE OR REPLACE FUNCTION public.create_user_with_role(p_user_id uuid, p_name text, p_email text, p_role_name text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_role_id uuid;
  v_user_role_id uuid;
  v_auth_email text;
  v_created_at timestamptz;
  v_confirmed_at timestamptz;
BEGIN
  SELECT lower(u.email), u.created_at, u.email_confirmed_at
    INTO v_auth_email, v_created_at, v_confirmed_at
  FROM auth.users u WHERE u.id = p_user_id;

  IF v_created_at IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  SELECT id INTO v_role_id FROM roles WHERE role_name = p_role_name;
  IF v_role_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', format('Role %s not found', p_role_name));
  END IF;

  IF v_caller IS NULL THEN
    IF v_confirmed_at IS NOT NULL
       OR v_created_at < now() - interval '15 minutes'
       OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p_user_id AND ur.role_id <> v_role_id) THEN
      RETURN json_build_object('success', false, 'error', 'Not allowed');
    END IF;
  ELSIF v_caller <> p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Not allowed');
  END IF;

  INSERT INTO users (id, name, email)
  VALUES (p_user_id, COALESCE(NULLIF(btrim(p_name), ''), split_part(v_auth_email, '@', 1)), v_auth_email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();

  INSERT INTO user_roles (user_id, role_id)
  VALUES (p_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING
  RETURNING id INTO v_user_role_id;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'role_id', v_role_id,
    'user_role_id', v_user_role_id,
    'message', 'User and role created successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM, 'sqlstate', SQLSTATE);
END;
$function$;
