# Release Notes — RiskOps OS v0.1.0

**Release date:** 2026-06-04
**Type:** Demo / Release Candidate

---

## What's in this release

RiskOps OS v0.1.0 is the first complete demo build of the AML/BSA compliance operations platform. It covers the full operational workflow from alert intake through SAR filing, backed by a SQLite database, a typed REST API, and role-gated UI.

---

## Modules shipped

### Alert Queue
- Filterable, sortable alert list with SLA countdown and overdue indicators
- Per-alert detail view: risk score, source, linked case, customer snapshot
- Actions: Assign, Change Status, Escalate to Case, Mark False Positive, Close Alert
- All actions write to the audit log

### Case Workspace
- Case list with priority/status filters and open-alert counts
- Full case detail: description, linked alerts, notes timeline, SAR status, audit trail
- Actions: Add Note, Request EDD, Escalate, Recommend SAR, Mark False Positive, Close Case
- Role-gated action buttons — Analyst cannot recommend SAR or close cases
- AI-powered case summary (streaming, requires `ANTHROPIC_API_KEY`)

### Customer 360
- Customer profile with risk rating, KYC/screening status, and transaction history
- Linked alert and case counts, SAR history, mock vendor screening results

### SAR Review Tracker
- Full SAR lifecycle: Pending Review → Recommended → Approved/Declined → Filed
- BSA Officer approval workflow with narrative and deadline tracking
- Workflow step indicators on each SAR record

### KPI Reports
- Charts: alerts by source, alerts by priority, cases by status, SAR pipeline
- Executive KPI cards on dashboard: open alerts, active cases, overdue SLAs, pending SARs

### Import / Export
- CSV import for alerts and transactions (Admin only, 10 MB limit, validates customer IDs)
- CSV export for alerts, cases, SAR reviews, and audit log
- Single-case examiner package download
- All import/export operations are logged to the audit trail

### Admin Settings
- User management table (read from DB)
- Mock vendor connectivity test with live latency display
- Audit log viewer with export
- System configuration panels (notification rules, data retention — UI only)

---

## Authentication and RBAC

- JWT sessions via `jose` (HS256), stored in `httpOnly` + `secure` cookies
- Session secret required in production — server throws on startup if missing
- 7 roles: Analyst, Senior Investigator, Compliance Manager, BSA Officer, Auditor, Bank Partner Read-Only, Admin
- 19 granular permissions enforced at both API and UI layer
- All API routes protected by session middleware (`proxy.ts`)
- Auth guard helpers (`requireSession`, `requirePermission`) applied to every route

---

## Audit logging

Every state-changing action writes an `AuditLogEntry` with: actor, role, action type, entity type/ID, before/after status, reason, and IP address. The following operations are logged:

- Alert triage (close, assign, escalate, false positive, status change)
- Case actions (note, EDD, escalate, SAR recommendation, close, false positive)
- SAR decisions (approve, decline, file)
- Data imports (CSV import with row counts and error counts)
- Data exports (record counts and applied filters)
- Audit log export

---

## Security hardening (RC)

- `SESSION_SECRET` throws in production if unset (no silent fallback)
- Session cookies set `secure: true` in production
- Anthropic client instantiated inside handler, not at module level
- `ANTHROPIC_API_KEY` check returns 503 with user-friendly message if missing
- `lib/auth-guard.ts` provides defense-in-depth at every API route
- CSV import: file size limit (10 MB), type validation, row-level error reporting
- SAR GET endpoint requires session (previously unauthenticated)

---

## Demo limitations

- **Synthetic data only.** 25 customers, 75 alerts, 20 cases, 10 SARs, 100 transactions — all generated, no real PII.
- **KPI charts are static.** Chart data is pre-generated mock values, not live DB aggregates.
- **Vendor APIs are mocked.** OFAC, PEP, KYC, and EU/UN sanctions checks return simulated responses.
- **SAR filing is local only.** The "File" action updates the local DB record; no FinCEN integration.
- **No email or notification delivery.** Notification settings are UI-only.
- **Single-user session model.** No concurrent-session management or device tracking.
- **SHA-256 password hashing.** Acceptable for a demo; use bcrypt/argon2 in production.

---

## Not production-ready

Do not deploy this build with real customer data. See the [Production Readiness](README.md#production-readiness) section of the README for a full checklist.

---

## Dependency versions

| Package | Version |
|---|---|
| next | 16.2.7 |
| react | 19.x |
| prisma | 7.8.0 |
| @prisma/adapter-libsql | 7.8.0 |
| jose | 5.x |
| @anthropic-ai/sdk | latest |
| recharts | 2.x |
| tailwindcss | 4.x |
| typescript | 5.x |
