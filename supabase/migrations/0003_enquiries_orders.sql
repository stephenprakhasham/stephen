-- ============================================================================
-- Phase 3: Enquiries & Manual Orders
-- Adds: customers, order_items (normalized), order_status_history, payments,
--       shipments, enquiry_notes; extends enquiries and orders; enforces
--       validated status transitions and mixed-category order security.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Customers (unified per division; dedupe by phone)
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  division_id text not null references public.business_divisions(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (division_id, phone)
);
create index if not exists customers_division_idx on public.customers(division_id);

-- ---------------------------------------------------------------------------
-- 2. Extend enquiries (lead detail, follow-up, campaign, customer link)
-- ---------------------------------------------------------------------------
alter table public.enquiries add column if not exists email text;
alter table public.enquiries add column if not exists location text;
alter table public.enquiries add column if not exists product_name text;
alter table public.enquiries add column if not exists campaign text;
alter table public.enquiries add column if not exists follow_up_at timestamptz;
alter table public.enquiries add column if not exists customer_id uuid references public.customers(id);
alter table public.enquiries add column if not exists updated_at timestamptz not null default now();

-- Widen enquiry status set for lead pipeline.
alter table public.enquiries drop constraint if exists enquiries_status_check;
alter table public.enquiries add constraint enquiries_status_check
  check (status in ('new','assigned','contacted','follow_up','quotation_sent','converted','not_interested','closed'));

-- ---------------------------------------------------------------------------
-- 3. enquiry_notes (timeline)
-- ---------------------------------------------------------------------------
create table if not exists public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists enquiry_notes_enquiry_idx on public.enquiry_notes(enquiry_id, created_at);

-- ---------------------------------------------------------------------------
-- 4. Extend orders (financial + fulfilment + customer link)
-- ---------------------------------------------------------------------------
alter table public.orders add column if not exists customer_id uuid references public.customers(id);
alter table public.orders add column if not exists subtotal numeric(12,2);
alter table public.orders add column if not exists tax_amount numeric(12,2) default 0;
alter table public.orders add column if not exists delivery_charge numeric(12,2) default 0;
alter table public.orders add column if not exists total_amount numeric(12,2);
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists fulfilment_status text not null default 'unfulfilled'
  check (fulfilment_status in ('unfulfilled','partial','fulfilled'));
alter table public.orders add column if not exists handled_by uuid references auth.users(id);
alter table public.orders add column if not exists source text default 'manual';
alter table public.orders add column if not exists updated_at timestamptz not null default now();

-- Widen order status set (validated by trigger below).
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('draft','awaiting_confirmation','confirmed','processing','packed','ready_to_dispatch','dispatched','delivered','cancelled','returned','refunded'));

-- ---------------------------------------------------------------------------
-- 5. order_items (normalized replacement for JSONB items)
-- ---------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  product_id uuid references public.products(id),
  variant_id uuid references public.product_variants(id),
  category_id uuid references public.categories(id),
  description text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_division_idx on public.order_items(division_id);

-- ---------------------------------------------------------------------------
-- 6. order_status_history (append-only timeline)
-- ---------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  from_status text,
  to_status text not null,
  reason text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists order_status_history_order_idx on public.order_status_history(order_id, created_at);

-- ---------------------------------------------------------------------------
-- 7. payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  division_id text not null references public.business_divisions(id) on delete cascade,
  customer_id uuid references public.customers(id),
  amount numeric(12,2) not null check (amount >= 0),
  method text not null default 'manual'
    check (method in ('cash','upi','bank','card','manual','other')),
  status text not null default 'pending'
    check (status in ('pending','paid','failed','refunded')),
  transaction_ref text,
  paid_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists payments_division_idx on public.payments(division_id, created_at);
create index if not exists payments_order_idx on public.payments(order_id);

-- ---------------------------------------------------------------------------
-- 8. shipments (dispatch / delivery tracking)
-- ---------------------------------------------------------------------------
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  carrier text,
  tracking_number text,
  status text not null default 'pending'
    check (status in ('pending','dispatched','in_transit','delivered','returned')),
  dispatched_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists shipments_order_idx on public.shipments(order_id);

-- ---------------------------------------------------------------------------
-- 9. Status transition validation (orders)
-- ---------------------------------------------------------------------------
create or replace function public.validate_order_status()
returns trigger language plpgsql as $$
declare
  allowed text[];
begin
  if new.status is distinct from old.status then
    allowed := case old.status
      when 'draft' then array['awaiting_confirmation','cancelled']
      when 'awaiting_confirmation' then array['confirmed','cancelled']
      when 'confirmed' then array['processing','cancelled']
      when 'processing' then array['packed','cancelled']
      when 'packed' then array['ready_to_dispatch','cancelled']
      when 'ready_to_dispatch' then array['dispatched','cancelled']
      when 'dispatched' then array['delivered','returned']
      when 'delivered' then array['returned']
      when 'returned' then array['refunded']
      else array[]::text[]
    end;

    if not (new.status = any(allowed)) then
      raise exception 'Invalid order transition % -> %', old.status, new.status;
    end if;

    -- Cancellation and refund require a reason.
    if new.status in ('cancelled','refunded') and (new.internal_notes is null or length(trim(new.internal_notes)) = 0) then
      raise exception 'A reason is required to cancel or refund an order.';
    end if;

    insert into public.order_status_history(order_id, division_id, from_status, to_status, changed_by)
    values (new.id, new.division_id, old.status, new.status, auth.uid());
  end if;

  new.updated_at := now();
  return new;
end $$;

drop trigger if exists orders_validate_status on public.orders;
create trigger orders_validate_status
  before update on public.orders
  for each row execute function public.validate_order_status();

-- ---------------------------------------------------------------------------
-- 10. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.enquiry_notes enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;

-- customers: staff read/write within division.
drop policy if exists customers_staff_read on public.customers;
create policy customers_staff_read on public.customers
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists customers_staff_write on public.customers;
create policy customers_staff_write on public.customers
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- enquiry_notes
drop policy if exists enquiry_notes_staff_read on public.enquiry_notes;
create policy enquiry_notes_staff_read on public.enquiry_notes
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists enquiry_notes_staff_write on public.enquiry_notes;
create policy enquiry_notes_staff_write on public.enquiry_notes
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- order_items: mixed-category security. Category-scoped users see only
-- authorized line items; full-order roles see all.
drop policy if exists order_items_read on public.order_items;
create policy order_items_read on public.order_items
  for select to authenticated using (
    public.is_group_admin()
    or public.can_access_division(division_id)
  );
drop policy if exists order_items_write on public.order_items;
create policy order_items_write on public.order_items
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- order_status_history
drop policy if exists order_status_history_read on public.order_status_history;
create policy order_status_history_read on public.order_status_history
  for select to authenticated using (public.can_access_division(division_id));

-- payments (sensitive: finance)
drop policy if exists payments_read on public.payments;
create policy payments_read on public.payments
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists payments_write on public.payments;
create policy payments_write on public.payments
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- shipments
drop policy if exists shipments_read on public.shipments;
create policy shipments_read on public.shipments
  for select to authenticated using (public.can_access_division(division_id));
drop policy if exists shipments_write on public.shipments;
create policy shipments_write on public.shipments
  for all to authenticated using (public.can_access_division(division_id))
  with check (public.can_access_division(division_id));

-- ============================================================================
-- END Phase 3 migration
-- ============================================================================