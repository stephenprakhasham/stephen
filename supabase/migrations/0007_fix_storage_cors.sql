-- Fix CORS for product-media storage bucket to allow requests from any domain
-- This is needed for images to display correctly on Vercel deployment

UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50MB limit
WHERE id = 'product-media';

-- Update CORS policy for the bucket to allow all origins
-- This allows images to be accessed from vercel.app and any other domain
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-media', 'product-media', true, 52428800, ARRAY['image/*', 'video/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*', 'video/*'];