# Yagas Mart — Zero-Cost Prototype Implementation Guide

> Purpose: build a working Yagas Mart prototype with no planned hosting bill while traffic is very low. This is for development, demos, and a tightly controlled pilot—not a high-availability production store.

## 1. Scope and non-negotiable limits

This guide keeps the agreed Yagas Mart model:

- Single-vendor store: Yagas Mart owns and sells its own products.
- No seller portal, seller payout, multi-vendor stock, or marketplace commissions.
- Responsive customer website and simple admin functionality.
- Java 25 / Spring Boot backend and PostgreSQL database remain the backend baseline.

A ₹0 setup is possible only while free-tier limits are not exceeded. It does **not** include a custom domain, SMS/WhatsApp, shipping, marketing, GST/legal costs, or live-payment fees.

## 2. Zero-cost architecture

```text
Customer browser
  ├─ Cloudflare Pages: static Next.js customer site and admin UI
  └─ Google Cloud Run: Spring Boot REST API, min instances = 0
       ├─ Neon Free: PostgreSQL database
       ├─ Cloudflare R2 Free: images and documents
       ├─ Razorpay Test Mode: payment testing
       └─ Resend Free: test/order email
```

### Why this design

- Cloudflare Pages hosts static files at no charge under its free tier.
- Cloud Run can scale the API to zero when idle; this keeps low-traffic backend usage near zero, but can produce a cold-start delay.
- Neon provides a small free PostgreSQL database.
- Cloudflare R2 provides free object storage allocation for product images.
- No Redis, search engine, queue, load balancer, or separate staging server is deployed.

## 3. Accounts to create

Create accounts using a project-only email address and enable MFA.

| Service | Use | Initial configuration |
| --- | --- | --- |
| GitHub | Source code | Repository: `stephenprakhasham/stephen` |
| Cloudflare | Static hosting, DNS, object storage | Free plan |
| Google Cloud | Spring Boot container | Billing account required; configure budget alert |
| Neon | PostgreSQL | Free plan |
| Razorpay | Test payment integration | Test mode only |
| Resend | Transactional email | Free plan |
| Sentry or similar | Error reporting | Free plan optional |

Do not enter payment keys, database passwords, or provider tokens into GitHub source code.

## 4. Repository structure

Create this structure as implementation begins:

```text
yagas-mart/
├─ web/                     # Next.js static customer and admin UI
├─ api/                     # Java 25 Spring Boot API
├─ docs/                    # Product and technical documentation
├─ infra/
│  ├─ docker/               # Local Docker configuration
│  └─ cloud-run/            # Deployment notes/scripts
├─ .github/workflows/       # Optional checks
└─ README.md
```

## 5. Local development setup

### Required software

- Git
- Java 25 LTS
- Node.js LTS
- Docker Desktop
- PostgreSQL client, optional
- Google Cloud CLI, only when deploying the backend

### Local services

Run these locally through Docker Compose:

```text
PostgreSQL
Mail testing service, optional
```

Do not run Redis or Meilisearch in the first prototype. Use PostgreSQL for carts and search.

### Local commands

Backend:

```bash
cd yagas-mart/api
./mvnw spring-boot:run
```

Frontend:

```bash
cd yagas-mart/web
npm install
npm run dev
```

## 6. Backend implementation

### Spring Boot dependencies

Create the API with:

- Spring Web
- Spring Validation
- Spring Data JPA
- PostgreSQL driver
- Flyway database migrations
- Spring Security
- Spring Boot Actuator
- Lombok, optional
- Testcontainers for integration tests, optional

### First backend modules

| Module | First responsibility |
| --- | --- |
| Catalog | Categories, products, prices, variants, images |
| Inventory | SKU stock and stock adjustment |
| Cart | Guest cart and customer cart |
| Orders | Order creation, item snapshots, status history |
| Payments | Razorpay order creation and verified webhook handling |
| Admin | Protected product, stock, and order administration |
| Notifications | Email only in the first prototype |

### First database tables

```text
categories
products
product_variants
product_images
inventory
customers
addresses
carts
cart_items
orders
order_items
payment_events
order_status_history
admin_users
```

Important rules:

- Store the product name, price, tax, and discount snapshot in `order_items`; never depend on the current product price after an order is placed.
- Reduce/reserve stock inside one database transaction.
- Store raw payment webhook events in `payment_events` for auditing.
- Use Flyway migrations. Never manually alter the production schema.

### Prototype API endpoints

```text
GET    /api/v1/products
GET    /api/v1/products/{slug}
GET    /api/v1/categories
GET    /api/v1/search?q=

GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/{id}
DELETE /api/v1/cart/items/{id}

POST   /api/v1/checkout
POST   /api/v1/payments/razorpay/order
POST   /api/v1/payments/razorpay/webhook

GET    /api/v1/orders/{id}
POST   /api/v1/admin/products
PATCH  /api/v1/admin/inventory/{sku}
PATCH  /api/v1/admin/orders/{id}/status
```

### Environment variables

Create `api/.env.example` with variable names only:

```text
SPRING_PROFILES_ACTIVE=local
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=
CORS_ALLOWED_ORIGINS=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

## 7. Frontend implementation

### Build the web application as a static site

Use Next.js with TypeScript. For a zero-cost Cloudflare Pages deployment, use static export:

```ts
// next.config.ts
const nextConfig = {
  output: "export",
  images: { unoptimized: true }
};
export default nextConfig;
```

The build output directory is `web/out`.

Use the public API URL as a build/runtime environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-cloud-run-api-url
```

### Static-site trade-offs

- Product data can be fetched from the Spring Boot API in the browser.
- For a small catalog, static product pages can be generated at build time.
- New products require a new Cloudflare Pages deployment if product pages are pre-generated.
- Do not use Next.js server actions or server-only authentication in this zero-cost static deployment.

### Customer pages

```text
/
 /categories/[slug]
 /products/[slug]
 /search
 /cart
 /checkout
 /orders/[id]
 /policies/shipping
 /policies/returns
```

### Admin pages

Use a separate route area:

```text
/admin/login
/admin/products
/admin/inventory
/admin/orders
```

The Spring Boot API must enforce administrator roles. Hiding a frontend route is not security.

## 8. Neon Free PostgreSQL setup

1. Create a Neon project.
2. Create one development database.
3. Copy the pooled PostgreSQL connection string.
4. Store the connection string only in local environment variables and Cloud Run secrets.
5. Run Flyway migrations from the Spring Boot API.
6. Seed only sample products in development.

The free plan is small. Keep product images out of PostgreSQL and avoid storing large logs or raw analytics events in the database.

Before live testing, export a database backup manually from a trusted computer:

```bash
pg_dump "$DATABASE_URL" > yagasmart-backup.sql
```

Encrypt and store the backup outside the application database. A free-tier deployment must not be the only copy of business data.

## 9. Cloudflare R2 image storage

1. In Cloudflare, create an R2 bucket named `yagas-mart-assets`.
2. Create an API token restricted only to this bucket.
3. Configure CORS to allow uploads only from the protected admin application/API flow.
4. Upload product images from the Spring Boot API, not directly with permanent secret keys in the browser.
5. Store only image metadata and object keys in PostgreSQL.
6. Use a public development URL only for test images. Move to signed/private access rules for sensitive files later.

R2 is for product images, product documents, and invoices. It is not a replacement for database records.

## 10. Cloud Run backend deployment

### Prepare the API

The Spring Boot application must:

- Listen on port `8080`.
- Read configuration from environment variables.
- Store no persistent files inside the container.
- Expose `/actuator/health`.
- Use a production Spring profile.
- Limit database connection pools because the free database has finite connections.

Add a Dockerfile to `api/` that builds the Maven application and runs the generated JAR.

### Deploy

1. Create a Google Cloud project.
2. Enable Cloud Run, Cloud Build, Artifact Registry, and Secret Manager.
3. Create a budget alert for ₹500 and ₹1,000 equivalent spend.
4. Deploy the API to Mumbai or the nearest suitable region.
5. Set minimum instances to `0` and maximum instances to `2`.
6. Put database/password/payment secrets in Secret Manager.
7. Set `CORS_ALLOWED_ORIGINS` to the exact Cloudflare Pages URL.
8. Test `/actuator/health`.

A first request after inactivity can take longer because a Java container must start. This is acceptable for a demo, but not for a busy checkout experience.

## 11. Cloudflare Pages frontend deployment

1. Connect Cloudflare Pages to the GitHub repository.
2. Select the `yagas-mart/web` directory as the root directory.
3. Set build command to `npm run build`.
4. Set output directory to `out`.
5. Add `NEXT_PUBLIC_API_BASE_URL` as an environment variable.
6. Deploy the main branch.
7. Test the generated `pages.dev` address on mobile and desktop.
8. Enable preview deployments for pull requests.

A custom domain can be added later, but registering the domain costs money even when Cloudflare Pages hosting is free.

## 12. Razorpay test integration

1. Create Razorpay test keys.
2. Store the key secret only in the Spring Boot API environment.
3. Backend creates the payment order.
4. Frontend opens Razorpay Checkout using the public test key.
5. Backend receives and verifies the webhook signature.
6. Only the verified webhook changes an order from `PAYMENT_PENDING` to `PAID`.
7. Test success, failure, duplicate webhook, and delayed webhook scenarios.

Never trust only the browser success callback.

Keep Razorpay in test mode until the store has policies, fulfilment operations, and customer support ready.

## 13. Resend email setup

Use email only for:

- Test order confirmation
- Password reset or account verification
- Order status changes

Do not send marketing campaigns from the prototype. The free email allowance is for transactional testing, not broad promotional campaigns.

## 14. Prototype security checklist

- No secret is committed to GitHub.
- No database accepts unrestricted public connections.
- CORS permits only the Pages frontend URL.
- Admin endpoints require backend role checks.
- Payment webhooks verify their signature.
- Database migrations are versioned.
- Product price is recalculated on the backend at checkout.
- Rate-limit login and checkout endpoints.
- Perform a manual backup before every demo/live test.
- Use test customer data until the production upgrade plan is ready.

## 15. End-to-end test plan

### Catalog

- Product list loads.
- Product page shows correct price and stock.
- Out-of-stock variants cannot be added to cart.

### Cart and checkout

- Quantity cannot exceed available stock.
- Price is recalculated on the backend.
- Duplicate checkout click does not create multiple orders.

### Payment

- Test payment success creates one paid order.
- Failed payment leaves an unpaid order.
- Duplicate Razorpay webhook does not duplicate payment/order records.
- Invalid webhook signature is rejected.

### Admin

- Non-admin user cannot open admin APIs.
- Admin can add a product and update stock.
- Order status changes are recorded in history.

## 16. When to leave the free tier

Move to the low-cost VPS or managed production plan when any one of these happens:

- Real customers face cold-start delays.
- You have more than a small private pilot.
- Database capacity, transfer, or free-tier compute limits are reached.
- You need guaranteed backups and uptime.
- You begin accepting significant live payments.
- You need SMS/WhatsApp notifications.
- More than one developer needs safe shared environments.

## 17. First implementation order

1. Create `web/` and `api/` folders.
2. Build product catalog API and database migrations.
3. Build product list and product detail pages.
4. Build cart and basic guest checkout.
5. Add Razorpay test order and webhook verification.
6. Build basic admin product/stock/order pages.
7. Deploy API to Cloud Run.
8. Deploy static frontend to Cloudflare Pages.
9. Run complete test payment flow.
10. Add backups, monitoring, and pilot checklist.

## 18. Official free-tier references

- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Workers limits and pricing: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare R2 free allocation: https://developers.cloudflare.com/workers/platform/pricing/
- Google Cloud Run pricing: https://cloud.google.com/run/pricing
- Neon free PostgreSQL allowance: https://neon.com/faqs/postgres-services-free-to-production
- Razorpay test/live integration guidance: https://razorpay.com/docs/payments/quickstart/
- Resend free email allowance: https://resend.com/docs/knowledge-base/what-is-resend-pricing

## Final decision

Build this zero-cost prototype to validate the product experience and end-to-end order flow. Do not present it as a fully reliable production platform. Once real orders prove demand, move the database and API to the low-cost pilot infrastructure plan.
