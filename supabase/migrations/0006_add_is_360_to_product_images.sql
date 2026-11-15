-- Add is_360 column to product_images for 360-degree view frames
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS is_360 BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for 360 frames
CREATE INDEX IF NOT EXISTS product_images_360_idx ON public.product_images(product_id, is_360) WHERE is_360 = TRUE;