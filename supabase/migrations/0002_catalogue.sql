-- ============================================================================
-- Phase 2: Dynamic Catalogue
-- Adds: brands, product variants, dynamic attribute builder (definitions,
--       options, values), product media, extended category/product fields,
--       and RLS. Public catalogue access is restricted to published products
--       and public fields only.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extend categories (hierarchy metadata, SEO, featured, depth guard)
-- ---------------------------------------------------------------------------
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists image_url text;
alter table public.categories add column if not exists seo_title text;
alter table public.categories add column if not exists seo_description text;
alter table public.categories add column if not exists is_featured boolean not null default false;
alter table public.categories add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 2. Brands
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  name text not null,
  slug text not null,
  logo_url text,
  description text,
  website text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (division_id, slug)
);
create index if not exists brands_division_idx on public.brands(division_id, is_active);

-- ---------------------------------------------------------------------------
-- 3. Extend products (brand, cost, compare-at, tax, SEO, lifecycle)
-- ---------------------------------------------------------------------------
alter table public.products add column if not exists brand_id uuid references public.brands(id);
alter table public.products add column if not exists cost_price numeric(12,2);
alter table public.products add column if not exists compare_at_price numeric(12,2);
alter table public.products add column if not exists tax_rate numeric(6,4) default 0;
alter table public.products add column if not exists short_description text;
alter table public.products add column if not exists seo_title text;
alter table public.products add column if not exists seo_description text;
alter table public.products add column if not exists barcode text;
alter table public.products add column if not exists status text not null default 'draft'
  check (status in ('draft','pending','published','unpublished','archived'));
alter table public.products add column if not exists updated_at timestamptz not null default now();

-- Keep is_published in sync with status for backward compatibility.
alter table public.products add column if not exists _status_synced boolean not null default false;

-- ---------------------------------------------------------------------------
-- 4. Product variants
-- ---------------------------------------------------------------------------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  sku text,
  barcode text,
  title text,
  options jsonb not null default '{}'::jsonb,
  retail_price numeric(12,2),
  wholesale_price numeric(12,2),
  cost_price numeric(12,2),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants(product_id, is_active);
create unique index if not exists product_variants_sku_uidx
  on public.product_variants(division_id, sku) where sku is not null;

-- ---------------------------------------------------------------------------
-- 5. Dynamic attribute builder
-- ---------------------------------------------------------------------------
create table if not exists public.product_attribute_definitions (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  key text not null,
  label text not null,
  field_type text not null default 'text'
    check (field_type in ('text','longtext','number','decimal','dropdown','multiselect','checkbox','date')),
  required boolean not null default false,
  searchable boolean not null default false,
  public_display boolean not null default true,
  variant_defining boolean not null default false,
  unit text,
  validation jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (division_id, category_id, key)
);
create index if not exists pad_division_category_idx
  on public.product_attribute_definitions(division_id, category_id, is_active);

create table if not exists public.product_attribute_options (
  id uuid primary key default gen_random_uuid(),
  definition_id uuid not null references public.product_attribute_definitions(id) on delete cascade,
  value text not null,
  sort_order integer not null default 0,
  unique (definition_id, value)
);

create table if not exists public.product_attribute_values (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  definition_id uuid not null references public.product_attribute_definitions(id) on delete cascade,
  value text,
  created_at timestamptz not null default now(),
  unique (product_id, definition_id)
);
create index if not exists pav_product_idx on public.product_attribute_values(product_id);

-- ---------------------------------------------------------------------------
-- 6. Product media (structured images/video)
-- ---------------------------------------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  url text not null,
  alt text,
  is_main boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images(product_id, sort_order);

-- ---------------------------------------------------------------------------
-- 7. Sync trigger: is_published <-> status
-- ---------------------------------------------------------------------------
create or replace function public.sync_product_published()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    new.is_published := (new.status = 'published');
  end if;
  if new.is_published is distinct from old.is_published then
    new.status := case when new.is_published then 'published' else 'unpublished' end;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists products_sync_published on public.products;
create trigger products_sync_published
  before update on public.products
  for each row execute function public.sync_product_published();

-- Backfill status from is_published for existing rows.
update public.products
   set status = case when is_published then 'published' else 'draft' end
 where status is null or status = 'draft';

-- ---------------------------------------------------------------------------
-- 8. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.brands enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_attribute_definitions enable row level security;
alter table public.product_attribute_options enable row level security;
alter table public.product_attribute_values enable row level security;
alter table public.product_images enable row level security;

-- Brands: authenticated staff read within division; super admin manages.
drop policy if exists brands_staff_read on public.brands;
create policy brands_staff_read on public.brands
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists brands_admin_write on public.brands;
create policy brands_admin_write on public.brands
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- Product variants: staff read within division; write with catalogue.edit.
drop policy if exists product_variants_staff_read on public.product_variants;
create policy product_variants_staff_read on public.product_variants
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists product_variants_staff_write on public.product_variants;
create policy product_variants_staff_write on public.product_variants
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- Attribute definitions: staff read within division; write with catalogue.edit.
drop policy if exists pad_staff_read on public.product_attribute_definitions;
create policy pad_staff_read on public.product_attribute_definitions
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists pad_staff_write on public.product_attribute_definitions;
create policy pad_staff_write on public.product_attribute_definitions
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

drop policy if exists pao_staff_read on public.product_attribute_options;
create policy pao_staff_read on public.product_attribute_options
  for select to authenticated using (
    exists (
      select 1 from public.product_attribute_definitions d
      where d.id = definition_id and public.can_access_division(d.division_id)
    )
  );
drop policy if exists pao_staff_write on public.product_attribute_options;
create policy pao_staff_write on public.product_attribute_options
  for all to authenticated using (
    exists (
      select 1 from public.product_attribute_definitions d
      where d.id = definition_id and public.can_access_division(d.division_id)
    )
  )
  with check (
    exists (
      select 1 from public.product_attribute_definitions d
      where d.id = definition_id and public.can_access_division(d.division_id)
    )
  );

drop policy if exists pav_staff_read on public.product_attribute_values;
create policy pav_staff_read on public.product_attribute_values
  for select to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and public.can_access_division(p.division_id))
  );
drop policy if exists pav_staff_write on public.product_attribute_values;
create policy pav_staff_write on public.product_attribute_values
  for all to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and public.can_access_division(p.division_id))
  )
  with check (
    exists (select 1 from public.products p where p.id = product_id and public.can_access_division(p.division_id))
  );

drop policy if exists product_images_staff_read on public.product_images;
create policy product_images_staff_read on public.product_images
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists product_images_staff_write on public.product_images;
create policy product_images_staff_write on public.product_images
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- ---------------------------------------------------------------------------
-- 9. Public catalogue exposure.
--    RLS restricts rows, not columns. cost_price / wholesale_price must never
--    reach anon. So: revoke anon SELECT on products, and expose a view with
--    only public columns. PostgREST serves the view at /rest/v1/catalogue_products.
-- ---------------------------------------------------------------------------
drop policy if exists products_public_read on public.products;

create or replace view public.catalogue_products as
  select
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
    p.image_urls,
    p.material_finish,
    p.size_or_variant,
    p.status,
    p.is_published,
    p.created_at,
    p.updated_at
  from public.products p
  where p.is_published = true;

comment on view public.catalogue_products is
  'Public storefront catalogue. Excludes cost_price, wholesale_price, tax_rate, barcode, supplier data.';

grant select on public.catalogue_products to anon, authenticated;

-- Categories: no restricted columns; allow public read of active categories.
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated using (is_active = true);

drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands
  for select to anon, authenticated using (is_active = true);

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.is_published = true)
  );

drop policy if exists product_variants_public_read on public.product_variants;
create policy product_variants_public_read on public.product_variants
  for select to anon, authenticated using (
    is_active = true
    and exists (select 1 from public.products p where p.id = product_id and p.is_published = true)
  );

drop policy if exists pad_public_read on public.product_attribute_definitions;
create policy pad_public_read on public.product_attribute_definitions
  for select to anon, authenticated using (is_active = true and public_display = true);

-- ============================================================================
-- END Phase 2 migration
-- ============================================================================