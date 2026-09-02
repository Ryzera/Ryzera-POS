<div align="center">

# Ryzera POS

**A multi-tenant, offline-capable point-of-sale platform for retail chains.**

Built as a Turborepo monorepo — NestJS API, Next.js storefront, and a shared Prisma/Zod core.

[![NestJS](https://img.shields.io/badge/API-NestJS%2011-e0234e?logo=nestjs&logoColor=white)](apps/pos-api-service)
[![Next.js](https://img.shields.io/badge/Web-Next.js%2016-000000?logo=next.js&logoColor=white)](apps/pos-web-app)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748?logo=prisma&logoColor=white)](packages/pos-database)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-f69220?logo=pnpm&logoColor=white)](pnpm-workspace.yaml)
[![Turborepo](https://img.shields.io/badge/build-Turborepo-EF4444?logo=turborepo&logoColor=white)](turbo.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](tsconfig.json)

</div>

---

## What is Ryzera POS?

Ryzera POS is a point-of-sale and retail operations system built for businesses running **multiple branches under one company**. It covers the full loop from purchasing and stock to the checkout counter and back-office reporting, with an offline-first sync layer so branches keep operating when connectivity drops.

- **Multi-tenant by design** — every request carries `Company` and `Branch` context; data, roles, and inventory are scoped accordingly.
- **RBAC out of the box** — `ADMIN`, `MANAGER`, `CASHIER`, and `INVENTORY_MANAGER` roles, backed by a granular authority/permission model, account lockout after repeated failed logins, and full audit logging.
- **Offline-first** — a dedicated sync engine (queue, conflict resolution, device tracking, health metrics, backups) keeps branch terminals usable without a live connection and reconciles state once they reconnect.
- **Built for real retail operations** — purchase orders, suppliers, batch/expiry tracking, inter-branch transfers, discount rules with approval workflows, returns, and a full billing/checkout flow.
- **Reporting that goes beyond totals** — sales, profit & loss, category/product performance, KPI targets, and scheduled report delivery.

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Monorepo layout](#monorepo-layout)
- [Feature modules](#feature-modules)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Common workflows](#common-workflows)
- [Data model](#data-model)
- [Roadmap](#roadmap)

## Architecture

```
                         ┌──────────────────────────┐
                         │      pos-web-app          │
                         │  Next.js 16 · React 19    │
                         │  Dashboard · POS · Sync UI │
                         └─────────────┬─────────────┘
                                       │ REST (axios) + WebSocket
                                       ▼
                         ┌──────────────────────────┐
                         │     pos-api-service        │
                         │  NestJS 11 · REST + WS      │
                         │  Auth · Inventory · Billing │
                         │  Sync Engine · Reports      │
                         └─────────────┬─────────────┘
                                       │ Prisma Client
                                       ▼
                         ┌──────────────────────────┐
                         │      pos-database           │
                         │  Prisma schema · migrations │
                         │  PostgreSQL                 │
                         └──────────────────────────┘

              pos-schema (Zod) — shared validation & DTOs,
              consumed by both the API and the web app
```

## Tech stack

| Layer | Stack |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui + Radix primitives |
| **State & data** | TanStack Query, Zustand, React Hook Form + Zod, Axios, Dexie (IndexedDB for offline cache) |
| **Backend** | NestJS 11, Passport JWT, class-validator, Zod, Socket.IO (WebSocket gateways), node-cron |
| **Database/ORM** | PostgreSQL, Prisma 7 (`@prisma/adapter-pg`) |
| **Docs/exports** | Swagger/OpenAPI, PDFKit (server), jsPDF + react-to-print (client) |
| **Tooling** | Turborepo, pnpm workspaces, ESLint 9 (flat config), shared `tsconfig` package |

## Monorepo layout

```
Ryzera-POS/
├── apps/
│   ├── pos-api-service/     # NestJS backend — REST API, WebSocket gateways, cron jobs
│   └── pos-web-app/         # Next.js frontend — dashboard, POS terminal, sync admin console
├── packages/
│   ├── pos-database/        # Prisma schema, migrations, seed scripts, PrismaService/DatabaseModule
│   ├── pos-schema/          # Shared Zod schemas & DTOs (auth, product, billing, sync, ...)
│   ├── eslint-config/        # Shared flat ESLint config (base / next-js / react-internal)
│   └── typescript-config/    # Shared base tsconfig
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Feature modules

**`pos-api-service`** is organized into three groups of NestJS modules:

<details>
<summary><strong>Core</strong> — identity, tenancy, and catalog</summary>

`auth` · `users` · `roles` · `company` · `branch` · `auditlog` · `product` · `category` · `supplier` · `batch` · `inventory` · `inventory-status` · `purchase-order` · `transfer` · `billing` · `cashier` · `returns` · `discount-rule` · `settings` · `notification(s)` · `mail` · `backup`

</details>

<details>
<summary><strong>Reporting &amp; analytics</strong></summary>

`dashboard` · `sales-report` · `profit-loss` · `category-performance` · `product-performance` · `daily-summary` · `kpi-targets` · `scheduled-reports` · `reports-audit-log` · `lookup`

</details>

<details>
<summary><strong>Sync &amp; offline suite</strong></summary>

Core sync engine, queue processing, conflict resolution, device tracking, health metrics, and email notifications for sync events — mirrored on the frontend by a full sync admin console (`/sync/*`: dashboard, queue, conflicts, devices, health, topology, backup, storage, broadcast, rules, audit, errors, analytics, settings).

</details>

**`pos-web-app`** route groups:

- `(auth)` — login
- `(dashboard)` — dashboard, billing, company, inventory, profile, reports, roles, settings, users
- `sync/*` — the offline-sync admin console described above

## Getting started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** 11.x (`corepack enable` will pick up the pinned version automatically)
- A **PostgreSQL** database

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in your database connection (see [Environment variables](#environment-variables)):

```bash
cp packages/pos-database/.env.example .env
```

### 3. Set up the database

```bash
pnpm --filter @ryzera/pos-database db:generate   # generate the Prisma client
pnpm --filter @ryzera/pos-database db:migrate     # run migrations
pnpm --filter @ryzera/pos-database db:seed        # seed initial data (roles, sample products, etc.)
```

### 4. Run the apps

```bash
pnpm dev
```

This runs `turbo dev`, starting both apps in parallel:

| App | URL |
|---|---|
| API (`pos-api-service`) | `http://localhost:3000/api` |
| API docs (Swagger) | `http://localhost:3000/api/docs` |
| Web app (`pos-web-app`) | `http://localhost:3001` |

To run a single app, target it directly:

```bash
pnpm --filter @ryzera/pos-api-service start:dev
pnpm --filter @ryzera/pos-web-app dev
```

## Environment variables

Set these at the repo root (`.env`) — consumed by `pos-database` (Prisma) and `pos-api-service` (NestJS) at runtime.

| Variable | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | Prisma | PostgreSQL connection string. **Required.** |
| `JWT_SECRET` | `auth` module | Signs/verifies access tokens. **Set this in every environment** — the code falls back to an insecure default if it's missing. |
| `PORT` | `pos-api-service` | API port, defaults to `3000` if unset. |

If you enable the `mail`/`notification` modules, also provide SMTP credentials for `nodemailer` (host, port, user, password) — check `apps/pos-api-service/src/mail` for the exact variable names your configured provider expects.

## Common workflows

```bash
# Build everything (respects Turborepo task graph / caching)
pnpm build

# Lint / type-check
pnpm --filter @ryzera/pos-web-app lint
pnpm --filter @ryzera/pos-api-service lint
pnpm --filter @ryzera/pos-web-app check-types

# Backend tests
pnpm --filter @ryzera/pos-api-service test
pnpm --filter @ryzera/pos-api-service test:e2e

# Inspect the database
pnpm --filter @ryzera/pos-database db:studio

# Reset the database (destructive — local/dev only)
pnpm --filter @ryzera/pos-database db:reset
```

## Data model

The Prisma schema (`packages/pos-database/prisma/schema.prisma`) defines ~50 models across these domains:

- **Tenancy & identity** — `Company`, `Branch`, `User`, `UserInfo`, `Role`, `Authority`, `UserRole`, `RoleAuthority`, `UserLog`
- **Catalog & inventory** — `Product`, `Category`, `Supplier`, `Batch`, `BranchProduct`, `InventoryLog`, `StockAlert`
- **Procurement & logistics** — `PurchaseOrder`, `PurchaseOrderItem`, `PurchaseInvoice`, `Transfer`, `TransferItem`
- **POS, billing & sales** — `Bill`, `BillItem`, `Sale`, `SaleItem`, `Payment`, `Return`, `ReturnItem`, `DiscountRule`, `DiscountApproval`, `DiscountApplication`
- **Sync & offline** — `SyncLog`, `SyncDevice`, `SyncSetting`, `SyncConflict`, `SyncBackup`, `SyncBackupSchedule`, `SyncHealthMetric`, `SyncAuditLog`
- **Reporting & KPIs** — `DailySummary`, `SavedReportConfig`, `ReportSchedule`, `ReportDelivery`, `KpiTarget`, `KpiMarginTarget`, `KpiInventoryThreshold`, `KpiNotificationRule`, `KpiReportDefault`, `ScheduledReport`
- **Ops** — `AuditLog`, `Notification`, `EmailOutbox`

Shared request/response shapes for all of the above live in `packages/pos-schema` as Zod schemas, consumed by both the API (validation) and the web app (form types).

## Roadmap

- [ ] Custom licensing decision (currently unlicensed/private)
- [ ] CI pipeline (lint/build/test on PR)
- [ ] CONTRIBUTING guide
- [ ] Dockerized local dev environment

---

<div align="center">

Private project — Ryzera. Not currently licensed for external use.

</div>
