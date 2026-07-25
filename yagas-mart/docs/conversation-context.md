# Yagas Mart — Conversation Context

This file is the durable project reference for Yagas Mart discussions. It records confirmed product, architecture, and feature decisions so future work can continue with shared context.

## Product model

- Product name: **Yagas Mart**
- Repository directory: `yagas-mart/`
- Business model: single-vendor e-commerce store
- Yagas Mart owns and lists its own products
- No seller accounts, seller onboarding, seller commissions, seller payouts, or multi-vendor order splitting in the initial product

## User-facing scope

- Mobile-first responsive website and Progressive Web App
- Desktop website from the same codebase
- Categories, products, search, filters, product variants, cart, wishlist, addresses, checkout, and order tracking
- Payment options through Razorpay
- Order cancellation, returns, refund requests, and customer notifications

## Administration scope

- Products, categories, images, prices, variants, SKU stock, coupons, and banners
- Orders, fulfilment, shipping, invoices, cancellations, returns, refunds, customers, and reports

## Technical decisions

- Frontend: Next.js, React, TypeScript
- Backend: Java 25 LTS, Spring Boot, Maven
- Database: PostgreSQL
- Cache and session/cart support: Redis
- Product search: Meilisearch initially
- API: REST with versioned `/api/v1` endpoints and OpenAPI documentation
- Files: S3-compatible storage with CDN
- Deployment: Docker and managed cloud services
- Architecture: modular monolith first; introduce microservices only when a module needs independent scaling, ownership, or reliability isolation

## Important engineering rules

- PostgreSQL is the source of truth for orders, payments, stock, and refunds.
- Verify payment status using signed payment-provider webhooks.
- Use idempotency keys for checkout/payment operations.
- Keep an auditable order and payment-status history.
- Do not begin with Kubernetes or a large microservice fleet.
- Start native mobile development only after the web/PWA MVP is validated.

## Delivery order

1. Product and operations planning
2. Catalog, product pages, cart, login, checkout
3. Payments, stock reservation, orders, and admin fulfilment
4. Shipping, invoices, notifications, returns, refunds
5. Limited real-order pilot
6. Public launch and improvement based on real customer data
7. Native mobile app and advanced personalization later

## Working agreement

- Use this document as the project memory for future Yagas Mart feature conversations.
- Add confirmed feature decisions, architecture changes, and important implementation notes after they are agreed.
- Keep entries concise and relevant to Yagas Mart.
- Do not save unrelated personal conversations or sensitive information unless explicitly requested.
