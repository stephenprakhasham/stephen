-- YAGA GROUP Supabase database foundation (v2)
-- Run this whole file in Supabase Dashboard > SQL Editor > New query.
-- Safe to run once on a fresh project. Do not run on a live populated DB without review.

create extension if not exists pgcrypto;

-- 1. Divisions
create table if not exists public.business_divisions (
  id text primary key check (id in ('mobiles','jewellery','digital')),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.business_divisions(id,name) values
 ('mobiles','YAGA MOBILES'),
 ('jewellery','YAGA GOLD & FASHION'),
 ('digital','YAGA DIGITAL NEXUS')
on conflict (id) do update set name=excluded.name;

-- 2. Staff/customer profiles and division permissions
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer'
    check (role in ('admin','staff','customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.user_division_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  primary key (user_id, division_id)
);

-- 3. Catalogue
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id),
  name text not null,
  slug text not null,
  parent_id uuid references public.categories(id),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (division_id, slug)
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id),
  category_id uuid references public.categories(id),
  name text not null,
  slug text not null,
  sku text,
  description text,
  retail_price numeric(12,2),
  wholesale_price numeric(12,2),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  material_finish text,
  size_or_variant text,
  image_urls text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (division_id, slug)
);
create index if not exists products_division_published_idx
  on public.products(division_id,is_published);

-- 4. Retailer applications (wholesale pricing must be approval-gated)
create table if not exists public.retailer_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  phone text not null,
  email text,
  city text,
  shop_address text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.retailer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  application_id uuid references public.retailer_applications(id),
  is_approved boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. Enquiries and manually confirmed orders
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id),
  customer_name text not null check (length(customer_name) between 2 and 120),
  phone text not null check (length(phone) between 8 and 18),
  message text not null check (length(message) between 2 and 3000),
  source text not null default 'website',
  status text not null default 'new'
    check (status in ('new','contacted','confirmed','closed')),
  assigned_to uuid references auth.users(id),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists enquiries_division_created_idx
  on public.enquiries(division_id,created_at desc);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  division_id text not null references public.business_divisions(id),
  enquiry_id uuid references public.enquiries(id),
  customer_name text not null,
  phone text not null,
  items jsonb not null default '[]'::jsonb,
  confirmed_total numeric(12,2) check (confirmed_total is null or confirmed_total >= 0),
  status text not null default 'enquiry'
    check (status in ('enquiry','confirmed','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','refunded')),
  internal_notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_division_created_idx
  on public.orders(division_id,created_at desc);

-- 6. Updated-at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();
drop trigger if exists enquiries_updated_at on public.enquiries;
create trigger enquiries_updated_at before update on public.enquiries
for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

-- 7. Authorization helpers (SECURITY DEFINER avoids RLS recursion)
create or replace function public.is_group_admin()
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;
create or replace function public.can_access_division(target_division text)
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select public.is_group_admin()
    or exists (
      select 1 from public.profiles p
      join public.user_division_access a on a.user_id = p.id
      where p.id = auth.uid()
        and p.role = 'staff'
        and a.division_id = target_division
    );
$$;

-- 8. Enable RLS
alter table public.business_divisions enable row level security;
alter table public.profiles enable row level security;
alter table public.user_division_access enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.retailer_applications enable row level security;
alter table public.retailer_profiles enable row level security;
alter table public.enquiries enable row level security;
alter table public.orders enable row level security;

-- Divisions are public-readable; only group admins can edit.
drop policy if exists divisions_public_read on public.business_divisions;
create policy divisions_public_read on public.business_divisions
for select using (is_active = true);
drop policy if exists divisions_admin_all on public.business_divisions;
create policy divisions_admin_all on public.business_divisions
for all using (public.is_group_admin()) with check (public.is_group_admin());

-- Profile: users can read their own; group admin can manage all.
drop policy if exists profiles_self_or_admin_read on public.profiles;
create policy profiles_self_or_admin_read on public.profiles
for select using (id = auth.uid() or public.is_group_admin());
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
for all using (public.is_group_admin()) with check (public.is_group_admin());

drop policy if exists division_access_self_or_admin_read on public.user_division_access;
create policy division_access_self_or_admin_read on public.user_division_access
for select using (user_id = auth.uid() or public.is_group_admin());
drop policy if exists division_access_admin_write on public.user_division_access;
create policy division_access_admin_write on public.user_division_access
for all using (public.is_group_admin()) with check (public.is_group_admin());

-- IMPORTANT: products are not directly readable by anon/authenticated users yet.
-- Use a server-side catalogue endpoint that returns only safe columns and never
-- returns wholesale_price to unapproved users. Admin/staff can manage their divisions.
drop policy if exists products_staff_admin_all on public.products;
create policy products_staff_admin_all on public.products
for all using (public.can_access_division(division_id))
with check (public.can_access_division(division_id));

drop policy if exists categories_public_active_read on public.categories;
create policy categories_public_active_read on public.categories
for select using (is_active = true);
drop policy if exists categories_staff_admin_manage on public.categories;
create policy categories_staff_admin_manage on public.categories
for all using (public.can_access_division(division_id))
with check (public.can_access_division(division_id));

-- Anyone can submit an enquiry; only assigned division staff/admin can read/update.
drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries
for insert to anon, authenticated
with check (
  length(customer_name) between 2 and 120
  and length(phone) between 8 and 18
  and length(message) between 2 and 3000
);
drop policy if exists enquiries_staff_admin_read on public.enquiries;
create policy enquiries_staff_admin_read on public.enquiries
for select using (public.can_access_division(division_id));
drop policy if exists enquiries_staff_admin_update on public.enquiries;
create policy enquiries_staff_admin_update on public.enquiries
for update using (public.can_access_division(division_id))
with check (public.can_access_division(division_id));

-- Retailer applications: public can apply; only group admin can review.
drop policy if exists retailer_application_public_insert on public.retailer_applications;
create policy retailer_application_public_insert on public.retailer_applications
for insert to anon, authenticated with check (
  length(business_name) between 2 and 160
  and length(contact_name) between 2 and 120
  and length(phone) between 8 and 18
);
drop policy if exists retailer_application_admin_read on public.retailer_applications;
create policy retailer_application_admin_read on public.retailer_applications
for select using (public.is_group_admin());
drop policy if exists retailer_application_admin_update on public.retailer_applications;
create policy retailer_application_admin_update on public.retailer_applications
for update using (public.is_group_admin()) with check (public.is_group_admin());

drop policy if exists retailer_profiles_admin_all on public.retailer_profiles;
create policy retailer_profiles_admin_all on public.retailer_profiles
for all using (public.is_group_admin()) with check (public.is_group_admin());
drop policy if exists retailer_profiles_self_read on public.retailer_profiles;
create policy retailer_profiles_self_read on public.retailer_profiles
for select using (user_id = auth.uid());

drop policy if exists orders_staff_admin_all on public.orders;
create policy orders_staff_admin_all on public.orders
for all using (public.can_access_division(division_id))
with check (public.can_access_division(division_id));

-- Bootstrap the first admin:
-- A) Create your user in Supabase Dashboard > Authentication > Users > Add user.
-- B) Copy that user's UUID.
-- C) Run the following, replacing the UUID and name:
-- insert into public.profiles(id,full_name,role)
-- values ('PASTE-AUTH-USER-UUID-HERE','YAGA Group Admin','admin')
-- on conflict(id) do update set role='admin',full_name=excluded.full_name;

-- Create staff:
-- 1) Create an Auth user.
-- 2) Insert a profile with role='staff'.
-- 3) Grant only the required divisions:
-- insert into public.user_division_access(user_id,division_id)
-- values ('STAFF-AUTH-UUID','mobiles');

-- Production hardening still required: CAPTCHA/rate limiting on public forms,
-- server-side catalogue API, storage bucket policies, backups and monitoring.
