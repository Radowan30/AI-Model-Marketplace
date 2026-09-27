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
