# YAGA GROUP

# Enterprise Commerce Management Platform

## Master Product Requirements, Admin Architecture & Claude Code Development Specification

**Version:** 1.0\
**Status:** Master development specification\
**Purpose:** Authoritative requirements document for Claude Code\
**Business divisions:** YAGA MOBILES \| YAGA GOLD & FASHION \| YAGA
DIGITAL NEXUS

------------------------------------------------------------------------

# 1. Executive Summary

YAGA GROUP requires a unified, secure, scalable commerce and business
management platform. It should provide relevant operational capabilities
comparable to Shopify Admin, Amazon Seller Central, and Flipkart Seller
Hub, tailored to YAGA GROUP's business model.

This is not a simple catalogue website or a basic admin dashboard. It is
one integrated platform with: - One central YAGA GROUP Super Admin. -
Three independent business divisions. - Division-specific dashboards,
workflows, reports, and staff access. - Granular category-level access
for physical commerce divisions. - Module-level access for Digital
Nexus. - Dynamic categories, subcategories, brands, attributes,
variants, products, inventory, orders, customers, retailers, marketing,
finance, and analytics. - Separate customer journeys for each
division. - An initial WhatsApp enquiry and manual order-confirmation
workflow. - Architecture ready for future cart, checkout, payment,
shipping, and automation.

The system is for YAGA GROUP's own businesses. Do not turn it into a
third-party seller marketplace unless explicitly approved later.

## 1.1 Product vision

Create one central digital operating system through which the group can
manage all divisions while each division and authorized category team
operates independently.

## 1.2 Non-negotiable principles

1.  One platform, three divisions.
2.  Least-privilege access.
3.  Dynamic configuration; do not hardcode business categories or
    permissions.
4.  Enforce permissions in backend services and database policies, not
    only in the UI.
5.  Reports must use real data; never fabricate sales, profit, stock, or
    customer metrics.
6.  Distinguish enquiries from confirmed orders and completed sales.
7.  Protect cost price, wholesale price, customer data, and supplier
    information.
8.  Preserve approved existing Digital Nexus content and enquiry flow.
9.  Build progressively; do not claim incomplete features are
    production-ready.
10. Design for mobile, tablet, and desktop.

------------------------------------------------------------------------

# 2. Business Structure and Scope

## 2.1 Parent organization --- YAGA GROUP

The parent organization owns the three divisions. Super Admin must have
a consolidated group view and be able to drill down into authorized
divisions.

## 2.2 Division A --- YAGA MOBILES

Business model: - Mobile phones and accessories. - Wholesale and
retail. - Retailer applications and approval. - Retail and wholesale
price management. - Category-specific product catalogue. - Stock,
orders, dispatch, delivery, and returns.

Illustrative categories: - Chargers - Neckbands - Earbuds & TWS -
Headphones - Data Cables - Power Banks - Mobile Covers - Tempered
Glass - Bluetooth Speakers - Mobile Displays - Adapters - Mobile
Phones - Other Accessories

These are examples, not a fixed list. Admin must create and manage
categories dynamically.

## 2.3 Division B --- YAGA GOLD & FASHION

Business model: - Gold and fashion jewellery. - Product catalogue and
variants. - Design, size, color, finish, and verified weight attributes
where applicable. - Customer enquiries and manual order confirmation. -
Inventory and order management.

Product-truth rules: - Distinguish solid gold, gold-plated, gold-tone,
imitation, silver, alloy, and other materials accurately. - Never claim
purity, hallmark, certification, or precious-metal content unless
verified. - Do not infer weight, purity, or certification from images. -
Material and finish disclosures must be configurable and displayed where
relevant.

## 2.4 Division C --- YAGA DIGITAL NEXUS

Business model: - Digital marketing and technology services. - Service
catalogue and packages. - Leads and enquiries. - Quotations and
proposals. - Client onboarding. - Projects, tasks, milestones,
deliverables, and client communication.

Digital Nexus is a service business. It requires module-level
permissions, not physical product category roles.

Existing service catalogue to audit and preserve: 1. AI Promotional
Video Generation 2. Social Media Content Creation 3. Instagram
Management 4. Facebook Page Management 5. YouTube Channel Management 6.
Meta Ads Management 7. Google Ads Management 8. Portfolio Website
Development 9. Company Website Development 10. E-commerce Website
Development 11. Promotional Posters and Banner Design 12. Chatbot
Development 13. SEO Setup

Existing prices found in the supplied Digital Nexus HTML are legacy
references and require owner verification. Do not silently change
them: - AI Promotional Reel --- ₹499 per 30-second video - Social Media
Package --- ₹2,500 - Premium Social Media Package --- ₹4,999 - Portfolio
Website --- ₹2,999 - Standard Company Website --- ₹6,999 - Basic
E-commerce Website --- ₹2,999 - Full E-commerce Website --- ₹14,999 -
Chatbot Development --- ₹14,999 - Google Ads and SEO Setup --- ₹4,499

The catalogue and prices must be editable by authorized staff. Flag
conflicts for owner review.

------------------------------------------------------------------------

# 3. Reference Platform Capabilities and Prioritization

Implement relevant equivalents of capabilities commonly available in
Shopify Admin, Amazon Seller Central, and Flipkart Seller Hub. Do not
blindly copy every feature.

## 3.1 Shopify-style capabilities

-   Products, variants, collections, categories.
-   Inventory and orders.
-   Staff accounts and granular permissions.
-   Discounts and promotions.
-   Customer records.
-   Store content and navigation.
-   Analytics and reports.

## 3.2 Amazon Seller Central-style capabilities

-   Listing quality checks.
-   Bulk product upload and editing.
-   SKU and inventory controls.
-   Pricing and promotion management.
-   Order processing.
-   Returns and customer issue tracking.
-   Performance and operational reports.

## 3.3 Flipkart Seller Hub-style capabilities

-   Order and fulfilment workflow.
-   Inventory updates.
-   Returns and cancellations.
-   Payment and settlement tracking.
-   Product listing management.
-   Promotions and advertising records.
-   Business insights.

Marketplace-only functions such as external seller onboarding, seller
commissions, and seller settlements are out of scope unless approved.

## 3.4 Priority definitions

-   **P0 --- Launch critical:** required for a safe, usable first
    release.
-   **P1 --- Business expansion:** required after core platform
    stability.
-   **P2 --- Advanced automation:** future capability.

A feature is not complete merely because a menu item or static screen
exists. It is complete only when UI, backend logic, authorization,
persistence, validation, and tests work.

------------------------------------------------------------------------

# 4. Roles, Permissions and Data Isolation

## 4.1 Layered access model

Permissions must support these scopes: 1. Organization 2. Division 3.
Category (physical commerce divisions) 4. Module (Digital Nexus and
shared modules) 5. Action 6. Record/data scope

Actions may include: - View - Create - Edit - Delete/archive -
Publish/unpublish - Approve/reject - Export - Manage pricing - Manage
stock - Manage orders - Manage users - View reports - Configure settings

Use explicit permission records, not role-name checks alone.

## 4.2 Organization-level roles

### Super Admin

-   Full access to all divisions and modules.
-   Manage users, roles, divisions, categories, modules, and permission
    policies.
-   View consolidated reports.
-   Access audit logs and system settings.
-   Approve high-risk actions.
-   Configure integrations and security.

### Group Admin

-   Manage assigned divisions.
-   View consolidated reports within assigned scope.
-   Manage staff and settings only within authorized scope.

### Finance Controller

-   Access finance, payments, expenses, settlements, and financial
    reports for assigned divisions.
-   No automatic product or inventory edit permission.
-   Sensitive financial fields remain restricted.

## 4.3 Division-level roles

Provide templates: - Division Manager - Catalogue Manager - Product
Editor - Inventory Manager - Warehouse Staff - Order Manager - Dispatch
Staff - Customer Support - Retailer/Wholesale Manager - Marketing
Manager - Reports Viewer

Super Admin must be able to create custom roles.

## 4.4 Category-level admin access --- mandatory

YAGA MOBILES and YAGA GOLD & FASHION must support category-scoped users.

Example: - Chargers Category Manager --- Chargers only. - Neckbands
Category Manager --- Neckbands only. - Earbuds Category Manager ---
Earbuds & TWS only. - Data Cables Category Manager --- Data Cables
only. - Jewellery category managers --- only their assigned jewellery
categories.

Category names must be selected from the dynamic category database,
never hardcoded.

A category-scoped user: - Sees only assigned categories by default. -
Can create/edit products only within assigned categories when
permitted. - Can update inventory only within assigned categories when
permitted. - Cannot access other categories' restricted prices, stock,
customers, reports, or supplier details. - Cannot change category
structure or assign permissions unless separately authorized. - Cannot
bypass restrictions using direct API calls, URL manipulation, exports,
or guessed IDs.

### Mixed-category orders

An order may contain items from several categories. A category manager
may see only authorized line items and the minimum customer/delivery
details required for their task. Other category items, full order
totals, and restricted financial data must remain hidden unless the user
has full-order permission. Enforce this in backend queries and database
policies.

## 4.5 Digital Nexus --- module-level access

Do not create physical category-level roles for Digital Nexus.

Modules: - Services & Packages - Leads & Enquiries - Client CRM -
Quotations & Proposals - Projects - Tasks & Milestones - Creative Assets
& Deliverables - Campaign Management - Invoices & Payments - Reports -
Website Content - Settings

Example roles: - Lead Manager - Service Catalogue Manager - Project
Manager - Creative Team Member - Ads Manager - Digital Nexus Reports
Viewer

Each role receives only the required module and action permissions.

## 4.6 Permission administration screen

Super Admin must be able to: - Create and disable users. - Assign one or
more divisions. - Assign categories within physical divisions. - Assign
Digital Nexus modules. - Select allowed actions per scope. - Set
read-only or edit access. - Set temporary access expiry. - Revoke
access. - Preview effective permissions before saving.

Show a human-readable permission summary, for example:

`YAGA MOBILES > Chargers > Products: View/Create/Edit; Inventory: View/Update; Reports: View`

Warn when access includes sensitive prices, customer information,
exports, or finance.

------------------------------------------------------------------------

# 5. Admin Application Architecture and Navigation

## 5.1 Global admin shell

Include: - Responsive sidebar. - Top navigation. - Authorized division
selector. - Global search. - Notifications. - User profile and role. -
Breadcrumbs. - Quick actions. - Date range filters. - Loading, empty,
success, and error states.

The division selector must show only authorized divisions.

## 5.2 Recommended global navigation

1.  Dashboard
2.  Catalogue
3.  Categories
4.  Brands
5.  Inventory
6.  Purchase & Suppliers
7.  Orders
8.  Returns & Refunds
9.  Customers
10. Retailers / Wholesale
11. Marketing & Promotions
12. Website & Content
13. Finance
14. Reports & Analytics
15. Staff & Permissions
16. Notifications & Automation
17. Audit Logs
18. Settings

Navigation visibility is not a security boundary. Backend authorization
remains mandatory.

## 5.3 Division-specific workspaces

Physical commerce divisions share common catalogue, inventory, order,
and customer modules, configured per division.

Digital Nexus uses: - Dashboard - Leads - Clients - Services -
Packages - Quotations - Projects - Tasks - Deliverables - Campaigns -
Invoices - Payments - Reports - Website Content - Settings

------------------------------------------------------------------------

# 6. Dashboards and Business Intelligence

## 6.1 Group dashboard

Show authorized consolidated metrics: - Enquiries. - Orders created. -
Confirmed orders. - Pending orders. - Cancelled orders. - Sales value. -
Gross margin only when cost data exists and user is authorized. -
Outstanding payments. - Inventory value only when cost data exists and
user is authorized. - Low-stock products. - Top products/categories. -
Customer and retailer growth. - Division-wise performance.

Allow drill-down by division, category, product, order, and date.

## 6.2 Physical division dashboard

-   Enquiries by status.
-   Orders by status.
-   Sales by date.
-   Average order value.
-   Top products/categories.
-   Low/out-of-stock products.
-   Returns and cancellations.
-   Pending dispatch.
-   Retail vs wholesale sales.
-   Payment status.

## 6.3 Digital Nexus dashboard

-   New leads.
-   Follow-ups due.
-   Leads by source.
-   Quotations sent/accepted/rejected.
-   Active projects.
-   Overdue tasks.
-   Deliverables awaiting approval.
-   Invoice and payment status.
-   Service/package performance.

## 6.4 Reporting integrity

-   Use actual database records.
-   Distinguish enquiries, orders, confirmed orders, and completed
    sales.
-   Never treat a WhatsApp enquiry as a sale.
-   Do not calculate profit without reliable cost and expense data.
-   Show date, division, category, and status filters.
-   Exports require explicit permission.
-   Audit sensitive exports.

------------------------------------------------------------------------

# 7. Dynamic Category, Brand and Attribute Management

## 7.1 Category hierarchy

Use parent-child relationships. Support main categories, subcategories,
and child categories with a configurable sensible depth.

Category fields: - Division - Parent category - Name - Slug -
Description - Image/icon - SEO title and description - Display order -
Active/inactive status - Featured status

## 7.2 Category operations

Authorized staff can create, edit, reorder, move, activate, deactivate,
archive, and preview categories. Show product counts and assigned
managers.

Do not hard-delete categories referenced by products or historical
transactions. Prefer archive/deactivate.

## 7.3 Brand management

Support brand name, logo, description, website, status, SEO metadata,
associated categories, and display order. A brand may be associated with
multiple categories where appropriate.

## 7.4 Dynamic attribute builder

Support field types: - Short text - Long text - Integer/number -
Decimal - Dropdown - Multi-select - Checkbox - Boolean - Date -
Image/file attachment where appropriate

Each attribute supports: - Label and internal key - Field type -
Required flag - Searchable/filterable flags - Public display flag -
Variant-defining flag - Validation rules - Options - Unit - Display
order - Active status

### Example: Chargers

Wattage, connector type, fast charging, cable included, color, warranty,
brand, compatibility.

### Example: Neckbands

Bluetooth version, battery capacity, playback time, charging time, noise
cancellation, waterproof rating, microphone, warranty.

### Example: Earbuds & TWS

Bluetooth version, earbud battery life, case capacity, ANC/ENC, gaming
mode, touch controls, waterproof rating, warranty.

### Example: Jewellery

Material, finish, color, size, verified weight where relevant, closure
type, occasion, care instructions, verified hallmark/certification
details.

When a category is selected in a product form, load its configured
attributes dynamically.

------------------------------------------------------------------------

# 8. Product Catalogue Management

## 8.1 Product fields

Support: - Product ID and division. - Category and brand. - Product name
and slug. - SKU and barcode. - Short and full description. - Images and
videos. - Dynamic attribute values. - Variants. - Retail selling
price. - Compare-at price where appropriate. - Wholesale price
(restricted). - Cost price (highly restricted). - Tax configuration. -
Stock tracking. - Status. - SEO metadata and keywords. - Related
products. - Created/updated metadata.

## 8.2 Product lifecycle

Draft, Pending Approval, Published, Unpublished, Scheduled, Archived.

Publishing approval must be configurable by division/category.

## 8.3 Listing quality checks

Check required name, category, brand where required, SKU, price, image,
description, required attributes, stock policy, and SEO fields where
required.

Show missing-field guidance. Block publishing when mandatory rules fail.

## 8.4 Variants

Support color, wattage, size, model, connector, design, and pack
quantity. Each variant may have unique SKU, price, wholesale price, cost
price, stock, barcode, image, and status.

Prevent duplicate variant combinations.

## 8.5 Bulk tools

Provide CSV/Excel import/export, bulk price/stock/category changes, bulk
publish/archive, duplication, validation preview, row-level error
report, and rollback strategy where feasible.

Never silently discard invalid rows.

## 8.6 Product media

Support multiple images, main image, ordering, alt text, video, file
validation, optimization, and responsive delivery. Use Supabase Storage
or equivalent secure object storage.

------------------------------------------------------------------------

# 9. Retail and Wholesale Pricing

## 9.1 Price types

-   Retail selling price.
-   Wholesale price.
-   Cost price.
-   Promotional price.
-   Retailer-specific price list.
-   Variant-level price.

## 9.2 Sensitive price rules

-   Cost price visible only to explicitly authorized roles.
-   Wholesale price never exposed to public visitors.
-   Public API must omit restricted price fields entirely.
-   Do not rely on frontend hiding.
-   Apply server-side and database restrictions.
-   Apply the same rules to exports and reports.

## 9.3 Retailer onboarding

Workflow: 1. Retailer submits application. 2. Admin reviews it. 3. Admin
approves, rejects, or requests information. 4. Approved retailer
receives authenticated wholesale access. 5. Admin assigns price list,
MOQ, credit terms, and eligible categories. 6. Retailer submits
enquiry/order. 7. Staff confirms stock, price, and fulfilment. 8.
Payment and dispatch are tracked.

Retailer profile fields may include business name, contact details,
address, verified GSTIN where applicable, division, categories, approval
status, price list, MOQ, credit terms, notes, and documents.

Do not assume every retailer receives identical pricing or credit terms.

------------------------------------------------------------------------

# 10. Inventory, Warehouses, Purchasing and Suppliers

## 10.1 Inventory controls

Support stock on hand, reserved stock, available stock, damaged stock,
returned stock, reorder threshold, stock adjustment, movement history,
SKU/variant stock, and category reports.

## 10.2 Stock movement audit

Every adjustment records product/variant, quantity change, reason,
previous/new quantity, user, timestamp, and related
order/purchase/reference.

Reasons include purchase receipt, sale/dispatch, return, damage, loss,
correction, and warehouse transfer.

## 10.3 Warehouses

Design for multiple locations even if launch starts with one. Support
warehouse creation, address, stock by location, transfers, transfer
status, goods receipt, and reconciliation.

## 10.4 Suppliers and purchase orders

Support suppliers, contact details, verified tax details where
applicable, associated products/brands, purchase orders, line items,
expected date, partial receipt, goods receipt, purchase cost, invoice
reference, and payment status.

Restrict purchase cost and supplier financial information.

------------------------------------------------------------------------

# 11. Enquiries, Orders and Fulfilment

## 11.1 Initial launch workflow

The initial workflow is WhatsApp enquiry plus manual order confirmation.

Customer journey: 1. Browse division website. 2. Open product/service.
3. Submit enquiry or start WhatsApp conversation. 4. Save enquiry in the
platform. 5. Staff confirms availability, final price, delivery, and
payment terms. 6. Authorized staff converts enquiry into an
order/project. 7. Track status, dispatch/delivery, and payment.

An enquiry is not a confirmed order or a sale.

## 11.2 Enquiry fields

Enquiry ID, division, product/service, customer name, phone/WhatsApp,
email, location, source/campaign, message, assigned staff, status,
follow-up date, notes, timestamps.

Statuses: New, Assigned, Contacted, Follow-up Required, Quotation Sent,
Converted, Not Interested, Closed.

## 11.3 Order fields and statuses

Order fields: ID, division, customer, items, variants, quantity, unit
price, discount, tax, delivery charge, total, payment method/status,
fulfilment status, notes, source enquiry, creator, timestamps.

Statuses: Draft, Awaiting Confirmation, Confirmed, Processing, Packed,
Ready for Dispatch, Dispatched, Delivered, Cancelled, Returned,
Refunded.

Validate status transitions. Require reasons for cancellation and
refund.

## 11.4 Future checkout readiness

Design for future cart, checkout, address book, shipping calculation,
online payment, verified webhooks, invoices, tracking, and refunds.

Do not claim payment is live until credentials, gateway configuration,
webhook verification, and end-to-end tests are complete.

## 11.5 Mixed-category order security

Full-order roles can view complete orders. Category-scoped staff see
only authorized line items and minimum required customer/delivery data.
Other category items, full totals, and restricted finance fields remain
hidden unless separately authorized.

------------------------------------------------------------------------

# 12. Returns, Exchanges, Refunds and Customer Support

Support return requests, reasons, evidence, approval/rejection,
pickup/receipt, inspection, exchange, refund status, stock disposition,
and customer communication.

Policies may differ by division and product type. Make them configurable
and publish only owner-approved policies. Do not promise
refunds/replacements outside configured policy.

Customer support should provide customer timeline, enquiries, orders,
returns, notes, follow-ups, assigned staff, and complaint status.
Restrict personal data by role.

------------------------------------------------------------------------

# 13. Marketing, Promotions and CMS

## 13.1 Promotions

Support coupon codes, fixed/percentage discounts, product/category
offers, bundles, buy-X-get-Y if approved, date ranges, usage limits,
minimum order value, division restrictions, and customer/retailer
restrictions.

Validate discount stacking and precedence. Record creator and approver.

## 13.2 Campaign management

Track Meta/Facebook, Instagram, Google Ads, WhatsApp, and other
campaigns. Capture name, division, objective, audience, budget, dates,
URL/reference, spend, attributed enquiries, verified conversions, and
notes.

Do not claim live ad-platform synchronization without a configured and
tested API integration.

## 13.3 Website CMS

Manage homepage banners, featured categories/products, offers,
navigation, footer, FAQs, policies, SEO metadata, and division landing
pages. Support draft, preview, approval, publish, and unpublish.

------------------------------------------------------------------------

# 14. YAGA DIGITAL NEXUS Operations

## 14.1 Services and packages

Manage service name, description, deliverables, package options, price,
duration, revision policy, client requirements, featured state, order,
and active status.

## 14.2 Lead pipeline

Stages: New Lead, Contacted, Discovery, Requirement Collected, Quotation
Prepared, Quotation Sent, Negotiation, Won, Lost, On Hold.

Track source, owner, next follow-up, estimated value, and lost reason.

## 14.3 Quotations

Support client details, services, scope, deliverables, price, taxes
where applicable, milestones, validity, terms, PDF, approval/rejection,
and version history.

## 14.4 Projects

Support client, service/package, team, dates, milestones, tasks,
priority, status, attachments, deliverables, client approval, internal
notes, and optional future time tracking.

## 14.5 Deliverables

Securely upload and version posters, videos, reels, website files,
reports, and campaign creatives. Track Draft, Internal Review, Client
Review, Approved, and Delivered.

## 14.6 Digital Nexus finance

Track quotation value, invoice amount, advance, balance, payment
date/method, and project-linked expenses where enabled. Keep service
revenue distinct from physical product sales.

------------------------------------------------------------------------

# 15. Finance, Payments, GST and Reconciliation

Provide permission-controlled payment records, payment status,
cash/UPI/bank/card/manual methods, outstanding balances, refunds,
expenses, supplier payments, receipts, retailer credit balances if
enabled, and reconciliation reports.

Future payment gateway integration: - Never store raw card details. -
Verify payment status server-side. - Verify webhook signatures. - Make
webhook handling idempotent. - Record gateway transaction IDs. - Handle
pending, failed, captured, and refunded states. - Keep secrets
server-side. - Never expose secret keys in browser code.

Tax fields must be configurable. Obtain professional review for tax
rules and invoice compliance. Do not hardcode one tax rate for every
product/service.

------------------------------------------------------------------------

# 16. Reports and Analytics

Reports must support organization, division, category, brand, product,
SKU/variant, date, order status, payment status, customer type,
retailer, campaign, and staff filters.

Reports: - Sales summary. - Order status. - Enquiry conversion. -
Product/category performance. - Stock ageing and low stock. - Inventory
movement. - Purchase summary. - Returns/refunds. - Retailer
performance. - Outstanding payments. - Campaign enquiry performance. -
Digital Nexus lead pipeline. - Project delivery.

Define each metric. Distinguish gross sales, net sales, collected
payments, and outstanding balances. Do not show profit without reliable
cost/expense data. Enforce permissions in report queries and exports.

------------------------------------------------------------------------

# 17. Notifications and Automation

In-app notifications for new enquiries/orders, follow-ups, low stock,
purchase receipts, returns, pending payments, retailer applications,
quotation responses, project milestones, and overdue tasks.

Future channels may include WhatsApp Business API, email, and SMS after
provider selection and approval.

Automation must be configurable, logged, and safe. Do not send customer
messages without approved templates, appropriate consent/legal basis,
and rate limits.

------------------------------------------------------------------------

# 18. Customer-Facing Website

## 18.1 Division journeys

Provide clear separate journeys for YAGA MOBILES, YAGA GOLD & FASHION,
and YAGA DIGITAL NEXUS. Each has its own landing page, navigation,
catalogue/service catalogue, search/filtering where applicable, enquiry
flow, WhatsApp contact configuration, SEO, policies, and contact
details.

## 18.2 Public product page

Show approved public fields only: name, images, description, brand,
public price if approved, public attributes, availability wording,
enquiry/WhatsApp action, and related products.

Never expose cost price, internal margin, restricted wholesale price,
supplier cost, private notes, or internal stock movement data.

## 18.3 Wholesale journey

Wholesale prices and terms remain private until retailer approval and
authentication. Public users may apply or submit a wholesale enquiry.

## 18.4 Preserve existing Digital Nexus site

Audit and integrate the supplied Digital Nexus HTML: - Preserve approved
brand identity, service content, pricing pending verification, visual
direction, cinematic hero where feasible, enquiry modal, and WhatsApp
flow. - Optimize large media assets and responsive performance. -
Identify missing referenced assets; do not silently replace with
unrelated images. - Remove demo/development-only code and unsafe
client-side assumptions. - Save enquiries to the shared backend while
retaining WhatsApp handoff.

The supplied HTML used WhatsApp number `917406624874`; another prototype
default used `919787608569`. These conflict. Owner must verify the
correct division numbers. Do not choose one independently.

------------------------------------------------------------------------

# 19. Technical Architecture

## 19.1 Preferred stack

-   Next.js App Router
-   TypeScript strict mode
-   React
-   Tailwind CSS
-   Supabase PostgreSQL
-   Supabase Auth
-   Supabase Storage
-   Supabase Row Level Security
-   Server-side route handlers/actions for privileged operations
-   Vercel or approved hosting
-   Zod or equivalent validation
-   React Hook Form or equivalent where useful
-   Automated tests for critical workflows and authorization

Use compatible stable versions. Inspect the existing project and verify
documentation before changing dependencies.

## 19.2 Domain boundaries

Separate modules for: - Public website - Admin -
Authentication/authorization - Catalogue - Inventory -
Enquiries/orders - Customers/retailers - Digital Nexus - Finance -
Reporting - Integrations

Prefer modular domain boundaries within one application initially. Do
not introduce microservices without a demonstrated need.

## 19.3 Suggested database entities

### Organization and access

organizations, business_divisions, profiles, roles, permissions,
role_permissions, user_role_assignments, user_division_access,
user_category_access, user_module_access.

### Catalogue

categories, brands, products, product_variants, product_images,
product_videos, product_attribute_definitions,
product_attribute_options, product_attribute_values, collections,
product_collection_items.

### Inventory and purchasing

warehouses, inventory_levels, inventory_movements, suppliers,
purchase_orders, purchase_order_items, goods_receipts,
goods_receipt_items, stock_transfers.

### Customers and commerce

customers, retailer_applications, retailer_profiles,
retailer_price_lists, retailer_price_list_items, enquiries,
enquiry_notes, orders, order_items, order_status_history, payments,
returns, return_items, refunds, shipments.

### Marketing and CMS

promotions, coupons, campaigns, campaign_metrics, website_pages,
website_banners, navigation_items, faqs, policy_pages.

### Digital Nexus

services, service_packages, leads, lead_activities, quotations,
quotation_items, clients, projects, project_milestones, tasks,
deliverables, deliverable_versions.

### Finance and operations

expenses, invoices, invoice_items, supplier_payments, notifications,
automation_rules, audit_logs, system_settings, integration_settings.

Use foreign keys, indexes, constraints, timestamps, and
archive/soft-delete patterns. Define SKU uniqueness scope explicitly.

## 19.4 Data isolation

Every division-owned record must be linked to a division. Every access
request must verify authenticated/active user, division membership,
category/module scope, action permission, and record relationship.

## 19.5 Supabase security

-   Enable RLS on all client-exposed tables.
-   Define explicit select/insert/update/delete policies.
-   Keep service-role credentials server-only.
-   Never expose service-role keys in frontend bundles, logs, or public
    config.
-   Validate all input server-side.
-   Never trust client-supplied division/category/role IDs or prices.
-   Resolve effective permissions on the server.
-   Protect storage uploads with policies and file validation.
-   Test cross-division and cross-category denial.
-   Use secure sessions and appropriate rate limiting.
-   Audit high-risk administrative actions.

## 19.6 Public API

Public catalogue APIs return only published products and public fields.
Exclude cost/wholesale prices, supplier information, private stock, and
internal notes. Validate filters, paginate, rate-limit, and avoid
exposing unnecessary internal identifiers.

## 19.7 Search and performance

Support indexed search, category/brand/attribute filters, sorting,
pagination, debounced input, optimized images, and server-side
rendering/caching where appropriate. Do not load the entire catalogue
into the browser.

------------------------------------------------------------------------

# 20. UX, Accessibility and Quality

-   Professional, consistent, responsive UI.
-   Accessible labels and keyboard navigation.
-   Clear validation and error messages.
-   Confirmation for destructive/high-impact actions.
-   Loading, empty, success, and failure states.
-   Search, filters, sorting, pagination, and column controls for data
    tables.
-   Preserve useful filters across navigation where practical.
-   Unicode-safe Tamil and English display.
-   Do not overload dashboards with decorative charts.
-   Use consistent status labels and action patterns.

------------------------------------------------------------------------

# 21. Audit Logs and Approval Workflows

Audit: - Security/login events where supported. - User/role/permission
changes. - Product creation/edit/publish/archive. - Price changes. -
Restricted price access where required. - Inventory adjustments. - Order
status changes. - Refund approvals. - Sensitive exports. - Integration
settings. - CMS publishing. - Quotations and project changes.

Record actor, action, entity, scope, timestamp, before/after values
where appropriate, reason, and safe request metadata.

Normal admins must not be able to erase audit evidence of their own
actions.

Configurable approvals may be required for high-value discounts,
sensitive price changes, refunds above thresholds, product publishing,
permission changes, and large stock adjustments.

------------------------------------------------------------------------

# 22. Integrations

Potential integrations: - WhatsApp Business provider. - Payment
gateway. - Courier/shipping provider. - Email and SMS. - Meta Ads. -
Google Ads. - Analytics. - GST/accounting software.

Confirm provider and account ownership first. Store credentials
securely, integrate server-side, log failures, retry safely, use
idempotency for webhooks, and provide manual fallback. Never claim an
integration is active until configured and tested.

------------------------------------------------------------------------

# 23. Explicitly Deferred Features

Do not implement by assumption: - Third-party seller marketplace. -
Seller commission engine. - External seller settlement. - Platform-owned
fulfilment network. - Multi-country tax engine. - Multi-currency
commerce. - Native mobile apps. - AI dynamic pricing. - Fully automated
WhatsApp sales agent. - Automated ad optimization. - Automated
accounting reconciliation.

These require separate approval and scope.

------------------------------------------------------------------------

# 24. Implementation Roadmap

## Phase 0 --- Audit and discovery

Inspect repository, README, package files, environment examples, SQL,
source assets, Digital Nexus HTML/CSS/JS/media, current database, and
deployment. Identify missing assets and conflicting business settings.
Back up existing work before changes.

**Exit:** audit report, assumptions list, confirmed decisions, phased
plan.

## Phase 1 --- Foundation and security (P0)

Application structure, design system, Supabase, authentication,
organization/division model, roles, permissions, category/module scope,
RLS, audit foundation, protected admin shell.

**Exit:** users access only authorized divisions/categories/modules;
security tests pass.

## Phase 2 --- Dynamic catalogue (P0)

Categories, brands, attribute builder, products, variants, media,
listing quality, public API, search, filters, pagination.

**Exit:** authorized staff create/publish products without code changes;
public users cannot retrieve restricted prices.

## Phase 3 --- Enquiries and manual orders (P0)

Enquiry forms, WhatsApp handoff, inbox, assignment, follow-up, manual
order creation, status history, customers, dispatch/payment tracking.

**Exit:** enquiry-to-order workflow works end-to-end.

## Phase 4 --- Inventory and wholesale (P1)

Stock movements, warehouses, suppliers, purchase orders, goods receipt,
retailer approval, wholesale price lists, MOQ and terms.

**Exit:** stock is auditable and wholesale data is protected.

## Phase 5 --- Returns, marketing and finance (P1)

Returns, exchanges, refunds, promotions, campaigns, expenses, payment
tracking, invoice foundation, division reports.

**Exit:** core operational lifecycle is manageable in admin.

## Phase 6 --- Digital Nexus (P1)

Services, packages, leads, pipeline, quotations, clients, projects,
milestones, tasks, deliverables, reports, website integration.

**Exit:** Digital Nexus manages leads through delivery without
physical-product workflows.

## Phase 7 --- Integrations and automation (P2)

Payment gateway, courier, WhatsApp Business API, email/SMS, ad-platform
integrations, advanced analytics and automation.

**Exit:** each integration passes sandbox and production verification.

------------------------------------------------------------------------

# 25. Testing and Acceptance Criteria

## 25.1 Authentication and authorization

1.  Unauthenticated users cannot access protected routes/APIs.
2.  Disabled users cannot use active sessions.
3.  Mobiles-only users cannot access Gold & Fashion data.
4.  Chargers users cannot read or edit Neckbands products.
5.  URL/API parameter manipulation cannot bypass category scope.
6.  Digital Nexus Lead Manager cannot edit physical inventory.
7.  Reports Viewer cannot mutate data.
8.  Users cannot grant themselves permissions.
9.  Revoked permissions take effect promptly.
10. RLS and server authorization protect direct API/database access.

## 25.2 Catalogue

1.  Admin creates categories without code changes.
2.  Admin creates/reorders subcategories.
3.  Admin defines category attributes.
4.  Product forms load correct attributes.
5.  Variant SKUs are unique within defined scope.
6.  Invalid imports show row-level errors.
7.  Archived categories retain historical references.
8.  Public users see published products and public fields only.
9.  Public API never exposes cost or wholesale prices.

## 25.3 Enquiries and orders

1.  Enquiry is saved under correct division.
2.  WhatsApp uses configured division number.
3.  Enquiry is not counted as a sale.
4.  Authorized staff convert enquiry to order.
5.  Status changes create history.
6.  Category staff cannot see unauthorized line items.
7.  Cancellation/refund requires permission and reason.

## 25.4 Inventory

1.  Purchase receipt increases stock.
2.  Dispatch reduces available stock according to policy.
3.  Return inspection updates stock disposition.
4.  Manual adjustments require reason.
5.  Movement records actor and timestamp.
6.  Staff cannot modify another category's inventory.

## 25.5 Digital Nexus

1.  Leads can be created, assigned, and advanced.
2.  Quotations can be created and versioned.
3.  Projects can be created from approved opportunities.
4.  Tasks and milestones can be assigned/tracked.
5.  Deliverables support review and approval.
6.  Module permissions are enforced.

## 25.6 Reporting

1.  Dashboard metrics match database records.
2.  Date/division filters work.
3.  Enquiries, confirmed orders, and completed sales are distinct.
4.  Profit is hidden when cost data is missing or access denied.
5.  Exports contain only authorized data.

## 25.7 Release readiness

1.  Production build succeeds.
2.  Environment variables are documented.
3.  Migrations are version-controlled.
4.  Backup/restore approach is documented.
5.  Monitoring and error logging are configured.
6.  Critical workflows have automated tests.
7.  No secrets are committed.
8.  Responsive layouts are tested.

------------------------------------------------------------------------

# 26. Claude Code Execution Instructions

Treat this document as the authoritative product specification.

## 26.1 Before coding

1.  Inspect the complete repository.
2.  Read README, package files, environment examples, migrations, and
    source.
3.  Identify existing framework and working features.
4.  Inspect all supplied YAGA assets.
5.  Produce an existing-vs-missing feature audit.
6.  Identify assumptions and ask only for decisions that cannot safely
    be inferred.
7.  Create a phased implementation plan.
8.  Back up or branch before replacing existing work.

## 26.2 Development rules

-   Do not build the platform as one giant component.
-   Use modular folders and domain boundaries.
-   Use TypeScript strict mode.
-   Avoid `any` unless justified.
-   Validate inputs on the server.
-   Use versioned database migrations.
-   Implement RLS alongside schema changes.
-   Test authorization before relying on role-based UI.
-   Keep secrets server-side.
-   Use reusable forms, tables, dialogs, filters, and status components.
-   Include loading, empty, error, and success states.
-   Never hardcode categories, permission matrices, phone numbers,
    prices, or business policies.
-   Use database/configuration for business-controlled values.
-   Do not create fake production sales or metrics.
-   Mark seed data as development-only.
-   Do not alter approved content/prices/contact numbers without owner
    approval.
-   Never claim deployment, integration, or tests succeeded unless
    actually completed.

## 26.3 Phase delivery discipline

For each phase: 1. State scope. 2. Implement migration. 3. Implement
backend authorization. 4. Implement UI. 5. Add tests. 6. Run lint, type
checks, and build. 7. Fix errors. 8. Summarize changed files. 9. List
completed and incomplete items. 10. Identify owner decisions required.

Do not proceed past unresolved critical security or data-integrity
defects.

## 26.4 Required handover

Provide architecture, folder structure, schema/migration instructions,
permission matrix, environment variables, local setup, Supabase/RLS
setup, deployment steps, admin bootstrap, test results, limitations,
backup/restore instructions, and future integration checklist.

------------------------------------------------------------------------

# 27. Owner Decisions Required Before Production

Do not invent the following: 1. Official WhatsApp number for each
division. 2. Official email addresses. 3. Business addresses and map
locations. 4. GST/tax configuration. 5. Return, exchange, cancellation,
and refund policies. 6. Shipping/delivery rules. 7. Retailer approval
criteria. 8. Wholesale MOQ and price-list rules. 9. Whether online
payment is needed at launch. 10. Payment gateway provider. 11. Courier
provider. 12. Warehouse structure. 13. Final Digital Nexus service
prices. 14. Approved product catalogue and public prices. 15. Staff
names and initial role assignments. 16. Domains and hosting account. 17.
Privacy policy, terms, and customer consent wording.

------------------------------------------------------------------------

# 28. Final Product Definition

The final product is the **YAGA GROUP Enterprise Commerce Management
Platform**.

It must provide: - One central organization-level control plane. - Three
division-specific workspaces. - Category-level administration for YAGA
MOBILES and YAGA GOLD & FASHION. - Module-level administration for YAGA
DIGITAL NEXUS. - Dynamic catalogue and attribute management. - Secure
retail and wholesale pricing. - Inventory, purchasing, orders,
fulfilment, returns, and customer management. - Marketing and promotion
management. - Digital Nexus lead-to-project management. - Finance and
reporting foundations. - Division-specific customer website journeys. -
A secure, testable architecture ready for future checkout and
integrations.

**Final acceptance rule:** backend and database authorization must
enforce every permission and data boundary. A polished dashboard without
correct authorization, reliable data, and working end-to-end workflows
is not an acceptable implementation.

Build in controlled phases. Prioritize correctness, security,
maintainability, and real business workflows over a large collection of
non-functional screens.
