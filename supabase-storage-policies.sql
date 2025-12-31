-- ============================================================
-- MIMOS AI Marketplace - Storage Policies
-- Phase 20B: Configure Storage Policies for model-files Bucket
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- IMPORTANT: Prerequisites
-- ============================================================
-- 1. Storage bucket 'model-files' must be created (Phase 20A)
-- 2. Bucket must be set to PRIVATE (not public)
-- 3. File size limit: 50MB
-- 4. All database tables must exist (Phase 18)
-- 5. RLS policies must be enabled (Phase 19)
-- ============================================================

-- ============================================================
-- 20B. Storage Policies for 'model-files' Bucket
-- ============================================================

-- Upload Policy: Publishers can upload files to their own folder
CREATE POLICY "Publishers can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'model-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Read Policy: Publishers can view own files, Subscribers can download files
CREATE POLICY "Subscribers can download files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'model-files'
    AND (
      -- Publisher can access their own files
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        -- Buyer with active subscription can access files
        SELECT 1 FROM subscriptions s
        JOIN model_files mf ON mf.model_id = s.model_id
        WHERE s.buyer_id = auth.uid()
        AND s.status = 'active'
        AND mf.file_url LIKE '%' || name || '%'
      )
    )
  );

-- Delete Policy: Publishers can delete their own files
CREATE POLICY "Publishers can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'model-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update Policy: Publishers can update their own files
CREATE POLICY "Publishers can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'model-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check all storage policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- Expected: 4 policies for storage.objects
-- 1. Publishers can upload files (INSERT)
-- 2. Subscribers can download files (SELECT)
-- 3. Publishers can delete own files (DELETE)
-- 4. Publishers can update own files (UPDATE)

-- ============================================================
-- Storage Policies Complete!
-- ============================================================
-- File path structure: model-files/{publisher_id}/{model_id}/{filename}
-- Example: model-files/uuid-123/uuid-456/model_weights.h5
-- ============================================================
