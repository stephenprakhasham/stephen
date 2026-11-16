-- Fix catalogue_products view to include images from product_images table
CREATE OR REPLACE VIEW public.catalogue_products AS
SELECT
  p.id,
  p.division_id,
  p.category_id,
  p.brand_id,
  p.name,
  p.slug,
  p.short_description,
  p.description,
  p.retail_price,
  p.compare_at_price,
  CASE
    WHEN p.image_urls IS NOT NULL AND array_length(p.image_urls, 1) > 0 THEN p.image_urls
    ELSE COALESCE(
      ARRAY_AGG(pi.url ORDER BY pi.sort_order) FILTER (WHERE pi.url IS NOT NULL),
      ARRAY[]::text[]
    )
  END AS image_urls,
  p.material_finish,
  p.size_or_variant,
  p.status,
  p.is_published,
  p.created_at,
  p.updated_at
FROM public.products p
LEFT JOIN public.product_images pi ON pi.product_id = p.id AND pi.is_360 = false
WHERE p.is_published = true
GROUP BY p.id, p.division_id, p.category_id, p.brand_id, p.name, p.slug,
         p.short_description, p.description, p.retail_price, p.compare_at_price,
         p.image_urls, p.material_finish, p.size_or_variant, p.status,
         p.is_published, p.created_at, p.updated_at;

GRANT SELECT ON public.catalogue_products TO anon, authenticated;