# RiskOps OS — AML/BSA Compliance Operations Platform

RiskOps OS is a demo-grade compliance operations platform for AML/BSA teams. It provides a full workflow from alert triage through case management, SAR recommendation, and examiner export — backed by a real database, REST API, and role-based access control.

> **Demo only.** This build uses synthetic data, a mock vendor integration layer, and a simplified auth model. It is not production-ready. See [Production Readiness](#production-readiness) before any real deployment.

---

## Features

| Module | Description |
|---|---|
| **Executive Dashboard** | Live KPI cards (open alerts, active cases, SAR pipeline, SLA breach rate) and trend charts |
| **Alert Queue** | Filterable alert table with bulk triage actions, SLA tracking, and escalation to case |
| **Customer 360** | Full customer profile with linked alerts, cases, transactions, SAR history, and screening data |
| **Case Workspace** | End-to-end case lifecycle: notes, EDD requests, SAR recommendation, audit trail, AI summary |
| **SAR Review Tracker** | BSA Officer approval workflow with deadline tracking and filing status |
| **KPI Reports** | Charts for alert volume by source/priority, case disposition, and SAR pipeline |
| **Import / Export** | CSV upload for alerts and transactions; examiner package download (CSV + audit log) |
| **Admin Settings** | User management, RBAC configuration, vendor connectivity test |
| **AI Case Summary** | Streaming Claude-powered case summary assistant (requires `ANTHROPIC_API_KEY`) |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, proxy.ts middleware)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite via Prisma 7 + `@prisma/adapter-libsql`
- **Auth:** JWT sessions via `jose` (HS256, httpOnly cookie)
- **Charts:** Recharts
- **AI:** Anthropic SDK (claude-haiku-4-5)
- **Icons:** Lucide React

---

## Demo Users

All demo accounts use the password: **`riskops2026`**

| Email | Role | Key Permissions |
|---|---|---|
| `analyst@riskops.demo` | Analyst | Triage alerts, add notes, link alerts |
| `investigator@riskops.demo` | Senior Investigator | Full case management, EDD, recommend SAR |
| `manager@riskops.demo` | Compliance Manager | All investigator actions + audit log access |
| `bsa@riskops.demo` | BSA Officer | Approve/decline/file SARs |
| `auditor@riskops.demo` | Auditor | Read-only + export |
| `admin@riskops.demo` | Admin | Full access including user management and CSV import |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone <repo-url>
cd spend1
npm install
```

### Configure environment

```bash
cp .env.example .env
# Edit .env — set SESSION_SECRET to a random 32+ character string
# Optionally add ANTHROPIC_API_KEY for the AI summary feature
```

### Initialize database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Create SQLite schema
npm run db:seed       # Seed demo data (25 customers, 75 alerts, 20 cases, 10 SARs, 100 transactions)
```

### Run

```bash
npm run dev           # Development server at http://localhost:3000
npm run build         # Production build
npm start             # Start production server
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path (`file:./dev.db`) or Turso URL |
| `SESSION_SECRET` | Yes (prod) | JWT signing secret — min 32 chars. **Throws in production if missing.** |
| `ANTHROPIC_API_KEY` | No | Enables AI case summary. Feature returns 503 if not set. |
| `DATABASE_AUTH_TOKEN` | No | Turso auth token (remote deployments only) |

---

## Project Structure

```
app/
  (dashboard)/        # Protected dashboard pages
    dashboard/        # Executive dashboard
    alerts/           # Alert queue + detail
    cases/            # Case list + workspace
    customers/        # Customer 360
    sar-reviews/      # SAR tracker
    kpi-reports/      # Charts and metrics
    import/           # CSV import
    export/           # Export / examiner package
    admin/            # Admin settings
  api/                # REST API routes
    auth/             # Login, logout, me
    alerts/           # CRUD
    cases/            # CRUD + notes
    customers/        # CRUD
    sar-reviews/      # SAR workflow
    transactions/     # Read
    export/           # CSV export (alerts, cases, SARs, audit log)
    import/           # CSV import (alerts, transactions)
    ai/               # Streaming AI case summary
    vendor/           # Mock vendor API stubs
  login/              # Login page
lib/
  prisma.ts           # Prisma client singleton
  session.ts          # JWT session helpers
  permissions.ts      # RBAC permission matrix
  auth-guard.ts       # API route guards
  store.tsx           # React Context + useReducer global store
  mock-data.ts        # Static chart data and type definitions
prisma/
  schema.prisma       # Database schema
  seed.ts             # Demo data seed
components/           # Shared UI components
hooks/                # useCurrentUser, etc.
proxy.ts              # Next.js 16 auth middleware
```

---

## API Overview

All API routes require a valid session cookie (set at login). Specific routes require additional permissions per the RBAC matrix.

| Method | Route | Permission |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Session |
| POST | `/api/auth/logout` | Session |
| GET/PATCH | `/api/alerts/[id]` | Session |
| GET/PATCH | `/api/cases/[id]` | Session |
| POST | `/api/cases/[id]/notes` | `add_note` |
| PATCH | `/api/sar-reviews/[id]` | `approve_sar` |
| GET | `/api/export/alerts` | `export_data` |
| GET | `/api/export/cases` | `export_data` |
| GET | `/api/export/sar-reviews` | `export_data` |
| GET | `/api/export/audit-log` | `view_audit` |
| POST | `/api/import/alerts` | `import_data` |
| POST | `/api/import/transactions` | `import_data` |
| POST | `/api/ai/case-summary` | Session |

---

## RBAC Matrix

| Permission | Analyst | Sr. Investigator | Compliance Mgr | BSA Officer | Auditor | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| close/assign/escalate alert | ✓ | ✓ | ✓ | ✓ | | ✓ |
| add_note, link_alert | ✓ | ✓ | ✓ | ✓ | | ✓ |
| request_edd, escalate_case | | ✓ | ✓ | ✓ | | ✓ |
| recommend_sar, close_case | | ✓ | ✓ | ✓ | | ✓ |
| approve_sar, file_sar | | | | ✓ | | ✓ |
| view_audit, export_data | | ✓ | ✓ | ✓ | ✓ | ✓ |
| import_data, manage_users | | | | | | ✓ |

---

## Testing the Demo

1. Navigate to `http://localhost:3000` — you will be redirected to `/login`
2. Log in as `analyst@riskops.demo` / `riskops2026`
3. Try the Alert Queue: filter by priority, close an alert, escalate to case
4. Switch to `investigator@riskops.demo` to access case actions
5. Try `bsa@riskops.demo` to approve a SAR in the SAR Review Tracker
6. Log in as `admin@riskops.demo` to test CSV import (use the template from `/import`)
7. Check the audit log in Admin → Audit Log or export it from `/export`

---

## Known Limitations

- **No real-time push** — the dashboard does not auto-refresh; reload to see DB changes from other sessions
- **KPI charts use static mock data** — the chart data in `/kpi-reports` and `/dashboard` is pre-generated; it does not query live aggregates from the database
- **Single-node SQLite** — not suitable for concurrent writes in a multi-instance deployment
- **AI summary sends case data to Anthropic** — review `app/api/ai/case-summary/route.ts` warning comments before enabling in a regulated environment
- **Vendor integration is mocked** — all vendor API calls return simulated responses; no real OFAC, PEP, or KYC data is used
- **No real SAR filing** — the "File SAR" action marks the record as filed in the local database only

---

## Production Readiness

This codebase is **not production-ready**. Before any real deployment:

- Replace `SESSION_SECRET` dev fallback with a securely generated secret
- Replace SQLite with a production-grade database (PostgreSQL, Turso)
- Add HTTPS/TLS termination
- Implement real password hashing (bcrypt/argon2 instead of SHA-256)
- Add rate limiting on `/api/auth/login`
- Add MFA for BSA Officer and Admin roles
- Replace mock vendor stubs with contracted vendor APIs
- Replace mock SAR filing with FinCEN BSA E-Filing API integration
- Add input sanitization beyond what Prisma provides
- Enable Content-Security-Policy headers
- Conduct a full security review before processing any real PII

---

## License

Internal demo build — not licensed for distribution.
