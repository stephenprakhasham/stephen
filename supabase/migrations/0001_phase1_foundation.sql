-- ============================================================================
-- Phase 1: Foundation & Security
-- Adds: fine-grained roles/permissions, category/module access, audit logs,
--       system/integration settings, RLS policies, authorization helpers.
-- Run once on the existing YAGA GROUP database (safe: uses if not exists /
-- drop-if-exists before create). See README for apply instructions.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extend profiles.role to include super_admin
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'staff', 'customer'));

-- ---------------------------------------------------------------------------
-- 1. Roles, permissions, role_permissions, user_role_assignments
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  division_id text references public.business_divisions(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (division_id, key)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  action text not null,
  description text,
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  division_id text references public.business_divisions(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, role_id, division_id, category_id)
);
create index if not exists user_role_assignments_user_idx
  on public.user_role_assignments (user_id);

-- ---------------------------------------------------------------------------
-- 2. Explicit category and module access scopes
-- ---------------------------------------------------------------------------
create table if not exists public.user_category_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  division_id text not null references public.business_divisions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, category_id)
);

create table if not exists public.user_module_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, module)
);

-- ---------------------------------------------------------------------------
-- 3. Audit logs
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  division_id text references public.business_divisions(id),
  old_values jsonb,
  new_values jsonb,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_user_id);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- 4. System and integration settings (secrets never stored in client-visible
--    tables; integration.config is server-side only and protected by RLS)
-- ---------------------------------------------------------------------------
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.integration_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  provider text,
  is_enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Authorization helpers (SECURITY DEFINER avoids RLS recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  );
$$;

-- Group admin now includes super_admin.
create or replace function public.is_group_admin()
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
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
    )
    or exists (
      select 1 from public.user_role_assignments ra
      where ra.user_id = auth.uid()
        and ra.division_id = target_division
        and (ra.expires_at is null or ra.expires_at > now())
    );
$$;

create or replace function public.can_access_category(target_category uuid)
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select public.is_group_admin()
    or exists (
      select 1 from public.user_category_access a
      where a.user_id = auth.uid() and a.category_id = target_category
    )
    or exists (
      select 1 from public.user_role_assignments ra
      where ra.user_id = auth.uid()
        and ra.category_id = target_category
        and (ra.expires_at is null or ra.expires_at > now())
    );
$$;

create or replace function public.can_access_module(target_module text)
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select public.is_super_admin()
    or exists (
      select 1 from public.user_module_access a
      where a.user_id = auth.uid() and a.module = target_module
    );
$$;

-- Effective permissions for a user (permission keys, modules, actions).
create or replace function public.effective_permissions(uid uuid)
returns table (permission_key text, module text, action text)
language sql stable security definer
set search_path = public, auth as $$
  select distinct p.key, p.module, p.action
  from public.user_role_assignments ura
  join public.role_permissions rp on rp.role_id = ura.role_id
  join public.permissions p on p.id = rp.permission_id
  where ura.user_id = uid
    and (ura.expires_at is null or ura.expires_at > now());
$$;

-- ---------------------------------------------------------------------------
-- 6. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_role_assignments enable row level security;
alter table public.user_category_access enable row level security;
alter table public.user_module_access enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;
alter table public.integration_settings enable row level security;

-- Roles & permissions: readable by authenticated users, managed by super admin.
drop policy if exists roles_read on public.roles;
create policy roles_read on public.roles
  for select to authenticated using (true);
drop policy if exists roles_admin_write on public.roles;
create policy roles_admin_write on public.roles
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists permissions_read on public.permissions;
create policy permissions_read on public.permissions
  for select to authenticated using (true);
drop policy if exists permissions_admin_write on public.permissions;
create policy permissions_admin_write on public.permissions
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists role_permissions_read on public.role_permissions;
create policy role_permissions_read on public.role_permissions
  for select to authenticated using (true);
drop policy if exists role_permissions_admin_write on public.role_permissions;
create policy role_permissions_admin_write on public.role_permissions
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

-- User assignments: self-read or super admin; super admin writes.
drop policy if exists ura_self_or_admin_read on public.user_role_assignments;
create policy ura_self_or_admin_read on public.user_role_assignments
  for select to authenticated using (user_id = auth.uid() or public.is_super_admin());
drop policy if exists ura_admin_write on public.user_role_assignments;
create policy ura_admin_write on public.user_role_assignments
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists uca_self_or_admin_read on public.user_category_access;
create policy uca_self_or_admin_read on public.user_category_access
  for select to authenticated using (user_id = auth.uid() or public.is_super_admin());
drop policy if exists uca_admin_write on public.user_category_access;
create policy uca_admin_write on public.user_category_access
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists uma_self_or_admin_read on public.user_module_access;
create policy uma_self_or_admin_read on public.user_module_access
  for select to authenticated using (user_id = auth.uid() or public.is_super_admin());
drop policy if exists uma_admin_write on public.user_module_access;
create policy uma_admin_write on public.user_module_access
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

-- Audit logs: append-only via service role; only super admin may read.
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
  for select to authenticated using (public.is_super_admin());

-- System settings: readable by authenticated users; only super admin writes.
drop policy if exists system_settings_read on public.system_settings;
create policy system_settings_read on public.system_settings
  for select to authenticated using (true);
drop policy if exists system_settings_admin_write on public.system_settings;
create policy system_settings_admin_write on public.system_settings
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

-- Integration settings: super admin only (may contain secrets).
drop policy if exists integration_settings_admin_all on public.integration_settings;
create policy integration_settings_admin_all on public.integration_settings
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- 7. Seed permissions
-- ---------------------------------------------------------------------------
insert into public.permissions (key, module, action, description, is_sensitive) values
  ('catalogue.view',    'catalogue', 'view',    'View products and categories', false),
  ('catalogue.create',  'catalogue', 'create',  'Create products and categories', false),
  ('catalogue.edit',    'catalogue', 'edit',    'Edit products and categories', false),
  ('catalogue.delete',  'catalogue', 'delete',  'Archive products and categories', true),
  ('catalogue.publish', 'catalogue', 'publish', 'Publish or unpublish products', false),
  ('catalogue.pricing', 'catalogue', 'pricing', 'Manage retail and wholesale prices', true),
  ('inventory.view',    'inventory', 'view',    'View stock levels', false),
  ('inventory.update',  'inventory', 'update',  'Update stock levels', false),
  ('inventory.adjust',  'inventory', 'adjust',  'Manual stock adjustments', true),
  ('purchase.view',     'purchase',  'view',    'View suppliers and purchase orders', false),
  ('purchase.create',   'purchase',  'create',  'Create purchase orders', false),
  ('purchase.receive',  'purchase',  'receive', 'Receive goods and update stock', false),
  ('orders.view',       'orders',    'view',    'View orders', false),
  ('orders.create',     'orders',    'create',  'Create orders', false),
  ('orders.status',     'orders',    'status',  'Change order status', false),
  ('orders.refund',     'orders',    'refund',  'Approve refunds', true),
  ('customers.view',    'customers', 'view',    'View customers', false),
  ('customers.edit',    'customers', 'edit',    'Edit customer records', false),
  ('retailers.view',    'retailers', 'view',    'View retailer applications', false),
  ('retailers.approve', 'retailers', 'approve', 'Approve or reject retailers', true),
  ('enquiries.view',    'enquiries', 'view',    'View enquiries', false),
  ('enquiries.assign',  'enquiries', 'assign',  'Assign enquiries to staff', false),
  ('enquiries.edit',    'enquiries', 'edit',    'Update enquiry status and notes', false),
  ('digital.leads.view',   'digital.leads',   'view',   'View leads', false),
  ('digital.leads.create', 'digital.leads',   'create', 'Create leads', false),
  ('digital.leads.edit',   'digital.leads',   'edit',   'Edit and assign leads', false),
  ('digital.services.view',  'digital.services',  'view',   'View services and packages', false),
  ('digital.services.edit',  'digital.services',  'edit',   'Manage services and packages', false),
  ('digital.quotations.view',  'digital.quotations',  'view',   'View quotations', false),
  ('digital.quotations.edit',  'digital.quotations',  'edit',   'Create and send quotations', false),
  ('digital.projects.view',  'digital.projects',  'view',   'View projects', false),
  ('digital.projects.edit',  'digital.projects',  'edit',   'Manage projects and tasks', false),
  ('digital.deliverables.review', 'digital.deliverables', 'review', 'Review and approve deliverables', false),
  ('finance.view',      'finance',   'view',    'View payments and expenses', true),
  ('finance.edit',      'finance',   'edit',    'Record payments and expenses', true),
  ('reports.view',      'reports',   'view',    'View reports', false),
  ('reports.export',    'reports',   'export',  'Export reports (CSV/Excel)', true),
  ('users.view',        'users',     'view',    'View users', false),
  ('users.manage',      'users',     'manage',  'Create and manage users and roles', true),
  ('settings.view',     'settings',  'view',    'View system settings', false),
  ('settings.manage',   'settings',  'manage',  'Change system settings', true),
  ('audit.view',        'audit',     'view',    'View audit logs', true)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 8. Seed roles (org-level + division-level + Digital Nexus modules)
-- ---------------------------------------------------------------------------
insert into public.roles (division_id, key, name, description, is_system) values
  (null, 'super_admin',        'Super Admin',          'Full access to all divisions and modules', true),
  (null, 'group_admin',        'Group Admin',          'Manage assigned divisions', true),
  (null, 'finance_controller', 'Finance Controller',   'Finance access for assigned divisions', true),
  ('mobiles',   'division_manager',   'Division Manager',    'Manage the Mobiles division', false),
  ('mobiles',   'catalogue_manager',  'Catalogue Manager',   'Manage Mobiles catalogue', false),
  ('mobiles',   'product_editor',     'Product Editor',      'Create and edit products', false),
  ('mobiles',   'inventory_manager',  'Inventory Manager',   'Manage stock', false),
  ('mobiles',   'order_manager',      'Order Manager',       'Manage orders and dispatch', false),
  ('mobiles',   'retailer_manager',   'Retailer Manager',    'Approve retailers and wholesale', false),
  ('mobiles',   'reports_viewer',     'Reports Viewer',      'View reports only', false),
  ('jewellery', 'division_manager',   'Division Manager',    'Manage the Jewellery division', false),
  ('jewellery', 'catalogue_manager',  'Catalogue Manager',   'Manage Jewellery catalogue', false),
  ('jewellery', 'order_manager',      'Order Manager',       'Manage orders, returns and exchanges', false),
  ('jewellery', 'reports_viewer',     'Reports Viewer',      'View reports only', false),
  ('digital',   'lead_manager',           'Lead Manager',              'Manage leads and pipeline', false),
  ('digital',   'service_catalogue_manager','Service Catalogue Manager', 'Manage services and packages', false),
  ('digital',   'project_manager',        'Project Manager',           'Manage projects and tasks', false),
  ('digital',   'creative_team_member',   'Creative Team Member',      'Upload and review deliverables', false),
  ('digital',   'ads_manager',            'Ads Manager',               'Manage campaigns and ad records', false),
  ('digital',   'digital_reports_viewer', 'Digital Reports Viewer',    'View Digital Nexus reports', false)
on conflict (division_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- 9. Map role -> permissions (super_admin bypasses via is_super_admin(), but
--    explicit grants keep effective_permissions() correct for everyone)
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  p record;
  grant_keys text[];
begin
  -- group_admin: broad read + manage within assigned divisions
  grant_keys := array[
    'catalogue.view','catalogue.create','catalogue.edit','catalogue.publish',
    'inventory.view','inventory.update','orders.view','orders.create','orders.status',
    'customers.view','enquiries.view','enquiries.assign','enquiries.edit',
    'retailers.view','retailers.approve','finance.view','reports.view','reports.export',
    'users.view','settings.view','audit.view'
  ];
  for r in select id from public.roles where key = 'group_admin' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- finance_controller: finance + reports only
  grant_keys := array['finance.view','finance.edit','reports.view','reports.export'];
  for r in select id from public.roles where key = 'finance_controller' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- division_manager: everything in their division except user management
  grant_keys := array[
    'catalogue.view','catalogue.create','catalogue.edit','catalogue.delete','catalogue.publish','catalogue.pricing',
    'inventory.view','inventory.update','inventory.adjust',
    'purchase.view','purchase.create','purchase.receive',
    'orders.view','orders.create','orders.status','orders.refund',
    'customers.view','customers.edit','retailers.view','retailers.approve',
    'enquiries.view','enquiries.assign','enquiries.edit',
    'finance.view','reports.view','reports.export','settings.view'
  ];
  for r in select id from public.roles where key = 'division_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- catalogue_manager: catalogue only
  grant_keys := array['catalogue.view','catalogue.create','catalogue.edit','catalogue.publish','catalogue.pricing','reports.view'];
  for r in select id from public.roles where key = 'catalogue_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- product_editor: catalogue create/edit, no publish/pricing
  grant_keys := array['catalogue.view','catalogue.create','catalogue.edit'];
  for r in select id from public.roles where key = 'product_editor' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- inventory_manager: inventory + purchase receive
  grant_keys := array['inventory.view','inventory.update','inventory.adjust','purchase.view','purchase.receive','catalogue.view'];
  for r in select id from public.roles where key = 'inventory_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- order_manager: orders + customers + enquiries
  grant_keys := array['orders.view','orders.create','orders.status','customers.view','customers.edit','enquiries.view','enquiries.assign','enquiries.edit','catalogue.view'];
  for r in select id from public.roles where key = 'order_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- retailer_manager: retailers + wholesale
  grant_keys := array['retailers.view','retailers.approve','orders.view','customers.view','catalogue.view','catalogue.pricing','reports.view'];
  for r in select id from public.roles where key = 'retailer_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- reports_viewer (mobiles + jewellery): read-only reports
  grant_keys := array['reports.view','catalogue.view','orders.view'];
  for r in select id from public.roles where key = 'reports_viewer' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  -- Digital Nexus roles
  grant_keys := array['digital.leads.view','digital.leads.create','digital.leads.edit','enquiries.view','enquiries.assign','reports.view'];
  for r in select id from public.roles where key = 'lead_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  grant_keys := array['digital.services.view','digital.services.edit','catalogue.view'];
  for r in select id from public.roles where key = 'service_catalogue_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  grant_keys := array['digital.projects.view','digital.projects.edit','digital.deliverables.review','digital.quotations.view','digital.quotations.edit','digital.leads.view'];
  for r in select id from public.roles where key = 'project_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  grant_keys := array['digital.deliverables.review','digital.projects.view'];
  for r in select id from public.roles where key = 'creative_team_member' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  grant_keys := array['digital.projects.view','digital.quotations.view','digital.leads.view','reports.view'];
  for r in select id from public.roles where key = 'ads_manager' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;

  grant_keys := array['reports.view','digital.leads.view','digital.projects.view','digital.quotations.view'];
  for r in select id from public.roles where key = 'digital_reports_viewer' loop
    for p in select id from public.permissions where key = any(grant_keys) loop
      insert into public.role_permissions(role_id, permission_id) values (r.id, p.id)
      on conflict do nothing;
    end loop;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 10. Promote the existing bootstrap account to super_admin
--     (idempotent; matches the confirmed admin@yagagroup.com auth user)
-- ---------------------------------------------------------------------------
update public.profiles p
   set role = 'super_admin'
  from auth.users u
 where p.id = u.id
   and u.email = 'admin@yagagroup.com';

-- ---------------------------------------------------------------------------
-- 11. Default system settings
-- ---------------------------------------------------------------------------
insert into public.system_settings (key, value) values
  ('whatsapp_numbers', '{"mobiles":"","jewellery":"","digital":""}'::jsonb),
  ('default_currency', '"INR"'::jsonb),
  ('low_stock_threshold', '5'::jsonb)
on conflict (key) do nothing;

-- ============================================================================
-- END Phase 1 migration
-- ============================================================================