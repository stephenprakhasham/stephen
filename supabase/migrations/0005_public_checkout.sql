-- ============================================================================
-- Public storefront checkout (COD).
-- Allows anonymous (anon) customers to create orders, order_items, payments,
-- shipments and customer records. Read/update/delete remain staff-only.
-- ============================================================================

-- orders: anon may insert only.
drop policy if exists orders_public_insert on public.orders;
create policy orders_public_insert on public.orders
  for insert to anon, authenticated
  with check (source = 'website' or source = 'manual' or source is null);

-- customers: anon may insert (checkout creates/looks up customer by phone).
drop policy if exists customers_public_insert on public.customers;
create policy customers_public_insert on public.customers
  for insert to anon, authenticated
  with check (true);

-- order_items: anon may insert (for their own new order).
drop policy if exists order_items_public_insert on public.order_items;
create policy order_items_public_insert on public.order_items
  for insert to anon, authenticated
  with check (true);

-- payments: anon may insert (COD record).
drop policy if exists payments_public_insert on public.payments;
create policy payments_public_insert on public.payments
  for insert to anon, authenticated
  with check (method = 'cash' and status = 'pending');

-- shipments: anon may insert (pending shipment record).
drop policy if exists shipments_public_insert on public.shipments;
create policy shipments_public_insert on public.shipments
  for insert to anon, authenticated
  with check (status = 'pending');

-- ============================================================================
-- END
-- ============================================================================