-- ============================================================================
-- Phase 4: Inventory, Warehouses, Purchasing & Wholesale
-- Adds: warehouses, inventory, stock_movements (audit ledger), vendors,
--       purchase_orders + lines, customer tier/wholesale fields, wholesale
--       pricing, RLS policies, and default warehouse seeding.
-- Single warehouse per division; simple integer stock; INR only.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Customer tier enum + extend customers
-- ---------------------------------------------------------------------------
create type public.customer_tier as enum ('retail', 'bronze', 'silver', 'gold', 'platinum');

alter table public.customers add column if not exists tier public.customer_tier not null default 'retail';
alter table public.customers add column if not exists wholesale boolean not null default false;
alter table public.customers add column if not exists gst_number text;
alter table public.customers add column if not exists credit_limit numeric(12,2) default 0;
alter table public.customers add column if not exists net_terms integer default 0;

-- ---------------------------------------------------------------------------
-- 1. Warehouses (one per division by default; supports more later)
-- ---------------------------------------------------------------------------
create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  name text not null,
  code text not null,
  address jsonb,
  contact_name text,
  contact_phone text,
  contact_email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (division_id, code)
);
create index if not exists warehouses_division_idx on public.warehouses(division_id, is_active);

-- ---------------------------------------------------------------------------
-- 2. Inventory (per product variant, single warehouse, simple quantity)
-- ---------------------------------------------------------------------------
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  quantity_available integer generated always as (quantity_on_hand - quantity_reserved) stored,
  safety_stock integer not null default 0,
  reorder_point integer not null default 0,
  unit_cost numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_variant_id, warehouse_id)
);
create index if not exists inventory_division_idx on public.inventory(division_id);
create index if not exists inventory_variant_idx on public.inventory(product_variant_id);

-- ---------------------------------------------------------------------------
-- 3. Stock movements (append-only audit ledger)
-- ---------------------------------------------------------------------------
create type public.stock_movement_type as enum (
  'purchase_receipt',
  'sale',
  'return',
  'adjustment',
  'transfer_out',
  'transfer_in'
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id),
  warehouse_id uuid not null references public.warehouses(id),
  movement_type public.stock_movement_type not null,
  quantity_change integer not null,
  reference_type text,
  reference_id uuid,
  unit_cost numeric(12,2),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists stock_movements_division_idx on public.stock_movements(division_id, created_at desc);
create index if not exists stock_movements_variant_idx on public.stock_movements(product_variant_id, created_at desc);
create index if not exists stock_movements_ref_idx on public.stock_movements(reference_type, reference_id);

-- ---------------------------------------------------------------------------
-- 4. Vendors (suppliers)
-- ---------------------------------------------------------------------------
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  gst_number text,
  payment_terms text not null default 'net30',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vendors_division_idx on public.vendors(division_id, is_active);

-- ---------------------------------------------------------------------------
-- 5. Purchase orders + lines
-- ---------------------------------------------------------------------------
create type public.po_status as enum ('draft', 'submitted', 'partial', 'received', 'cancelled');

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id),
  po_number text not null,
  status public.po_status not null default 'draft',
  order_date date not null default current_date,
  expected_date date,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'INR',
  notes text,
  warehouse_id uuid references public.warehouses(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (division_id, po_number)
);
create index if not exists purchase_orders_division_idx on public.purchase_orders(division_id, created_at desc);
create index if not exists purchase_orders_vendor_idx on public.purchase_orders(vendor_id);

create table if not exists public.purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id),
  quantity_ordered integer not null check (quantity_ordered > 0),
  quantity_received integer not null default 0 check (quantity_received >= 0),
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) generated always as (quantity_ordered * unit_price) stored,
  received_at timestamptz,
  received_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists po_lines_po_idx on public.purchase_order_lines(purchase_order_id);

-- ---------------------------------------------------------------------------
-- 6. Wholesale prices (tiered pricing per variant)
-- ---------------------------------------------------------------------------
create table if not exists public.wholesale_prices (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete cascade,
  tier public.customer_tier not null,
  min_quantity integer not null default 1 check (min_quantity > 0),
  price numeric(12,2) not null check (price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_variant_id, tier, min_quantity)
);
create index if not exists wholesale_prices_division_idx on public.wholesale_prices(division_id);

-- ---------------------------------------------------------------------------
-- 7. PO numbering helper (sequence per division)
-- ---------------------------------------------------------------------------
create table if not exists public.po_counters (
  division_id text primary key references public.business_divisions(id) on delete cascade,
  next_value integer not null default 1
);

create or replace function public.next_po_number(div text)
returns text language plpgsql as $$
declare
  v_next integer;
begin
  insert into public.po_counters (division_id, next_value)
  values (div, 1)
  on conflict (division_id) do update
    set next_value = public.po_counters.next_value + 1
    returning next_value into v_next;
  return 'PO-' || to_char(current_date, 'YYYY') || '-' || lpad(v_next::text, 4, '0');
end $$;

-- ---------------------------------------------------------------------------
-- 8. Stock update trigger (keep inventory in sync with movements)
-- ---------------------------------------------------------------------------
create or replace function public.apply_stock_movement()
returns trigger language plpgsql as $$
begin
  insert into public.inventory (division_id, product_variant_id, warehouse_id, quantity_on_hand, unit_cost)
  values (new.division_id, new.product_variant_id, new.warehouse_id, new.quantity_change, new.unit_cost)
  on conflict (product_variant_id, warehouse_id) do update
    set quantity_on_hand = public.inventory.quantity_on_hand + excluded.quantity_on_hand,
        unit_cost = coalesce(excluded.unit_cost, public.inventory.unit_cost),
        updated_at = now();

  -- Also sync product_variants.stock_quantity for backward compatibility
  update public.product_variants
     set stock_quantity = greatest(0, stock_quantity + new.quantity_change),
         updated_at = now()
   where id = new.product_variant_id;

  return new;
end $$;

drop trigger if exists stock_movements_apply on public.stock_movements;
create trigger stock_movements_apply
  after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- ---------------------------------------------------------------------------
-- 9. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.warehouses enable row level security;
alter table public.inventory enable row level security;
alter table public.stock_movements enable row level security;
alter table public.vendors enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_lines enable row level security;
alter table public.wholesale_prices enable row level security;
alter table public.po_counters enable row level security;

-- Warehouses: staff read within division; write with admin/group roles.
drop policy if exists warehouses_staff_read on public.warehouses;
create policy warehouses_staff_read on public.warehouses
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists warehouses_staff_write on public.warehouses;
create policy warehouses_staff_write on public.warehouses
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- Inventory: staff read within division; write with inventory permissions.
drop policy if exists inventory_staff_read on public.inventory;
create policy inventory_staff_read on public.inventory
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists inventory_staff_write on public.inventory;
create policy inventory_staff_write on public.inventory
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- Stock movements: append-only (insert by authenticated, select by staff).
drop policy if exists stock_movements_staff_read on public.stock_movements;
create policy stock_movements_staff_read on public.stock_movements
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists stock_movements_staff_insert on public.stock_movements;
create policy stock_movements_staff_insert on public.stock_movements
  for insert to authenticated with check (public.can_access_division(division_id));

-- Vendors: staff read/write within division.
drop policy if exists vendors_staff_read on public.vendors;
create policy vendors_staff_read on public.vendors
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists vendors_staff_write on public.vendors;
create policy vendors_staff_write on public.vendors
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- Purchase orders: staff read/write within division.
drop policy if exists purchase_orders_staff_read on public.purchase_orders;
create policy purchase_orders_staff_read on public.purchase_orders
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists purchase_orders_staff_write on public.purchase_orders;
create policy purchase_orders_staff_write on public.purchase_orders
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- Purchase order lines: read/write scoped via parent PO.
drop policy if exists po_lines_staff_read on public.purchase_order_lines;
create policy po_lines_staff_read on public.purchase_order_lines
  for select to authenticated using (
    exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and public.can_access_division(po.division_id))
  );
drop policy if exists po_lines_staff_write on public.purchase_order_lines;
create policy po_lines_staff_write on public.purchase_order_lines
  for all to authenticated using (
    exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and public.can_access_division(po.division_id))
  )
  with check (
    exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and public.can_access_division(po.division_id))
  );

-- Wholesale prices: staff read/write within division.
drop policy if exists wholesale_prices_staff_read on public.wholesale_prices;
create policy wholesale_prices_staff_read on public.wholesale_prices
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists wholesale_prices_staff_write on public.wholesale_prices;
create policy wholesale_prices_staff_write on public.wholesale_prices
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- PO counters: only service role / trigger function touches this.
drop policy if exists po_counters_admin_read on public.po_counters;
create policy po_counters_admin_read on public.po_counters
  for select to authenticated using (public.is_group_admin());

-- ---------------------------------------------------------------------------
-- 10. Public read for active warehouses (storefront availability)
-- ---------------------------------------------------------------------------
drop policy if exists warehouses_public_read on public.warehouses;
create policy warehouses_public_read on public.warehouses
  for select to anon, authenticated using (is_active = true);

-- ---------------------------------------------------------------------------
-- 11. Seed default warehouse per existing division
-- ---------------------------------------------------------------------------
insert into public.warehouses (division_id, name, code, is_active)
select
  bd.id,
  'Default Warehouse — ' || bd.name,
  'WH-' || upper(bd.id),
  true
from public.business_divisions bd
on conflict (division_id, code) do nothing;

-- ---------------------------------------------------------------------------
-- 12. Backfill inventory rows for existing variants
-- ---------------------------------------------------------------------------
insert into public.inventory (division_id, product_variant_id, warehouse_id, quantity_on_hand, unit_cost)
select
  pv.division_id,
  pv.id,
  w.id,
  pv.stock_quantity,
  pv.cost_price
from public.product_variants pv
join public.warehouses w on w.division_id = pv.division_id
on conflict (product_variant_id, warehouse_id) do update
  set quantity_on_hand = greatest(public.inventory.quantity_on_hand, excluded.quantity_on_hand),
      unit_cost = coalesce(excluded.unit_cost, public.inventory.unit_cost);

-- ============================================================================
-- END Phase 4 migration
-- ============================================================================