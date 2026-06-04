# Deploying RiskOps OS — Vercel + Turso

Private demo deployment using Vercel (hosting) and Turso (edge SQLite).
Total time: ~15 minutes.

---

## Prerequisites

Install the Turso CLI (one-time):
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

Install the Vercel CLI (one-time):
```bash
npm install -g vercel
```

---

## Step 1 — Create a Turso database

```bash
# Sign up and authenticate
turso auth signup          # opens browser, create a free account
turso auth login

# Create the demo database
turso db create riskops-demo

# Get the database URL — copy the value shown
turso db show riskops-demo --url

# Create an auth token — copy the value shown
turso db tokens create riskops-demo
```

Save both values; you will need them in steps 2 and 4.

---

## Step 2 — Push the schema to Turso

Create a local `.env` file from the example:
```bash
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL="libsql://riskops-demo-<your-org>.turso.io"
TURSO_AUTH_TOKEN="<token from step 1>"
SESSION_SECRET="<run the command below to generate one>"
DEMO_MODE="true"
```

Generate a session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Push the schema:
```bash
npx prisma db push
```

You should see: `Your database is now in sync with your Prisma schema.`

---

## Step 3 — Seed demo data

```bash
npm run db:seed
```

Expected output:
```
Seeding database…
Seeded: 6 users, 20 customers, 25 alerts, 10 cases, 5 SARs, 40 transactions, 20 audit entries
```

---

## Step 4 — Deploy to Vercel

```bash
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → your personal account
- **Link to existing project?** → No
- **Project name?** → `riskops-demo` (or anything you like)
- **Directory?** → `.` (current directory)
- **Override settings?** → No

After the initial deploy, add environment variables:
```bash
vercel env add DATABASE_URL
# paste: libsql://riskops-demo-<your-org>.turso.io
# select: Production, Preview, Development

vercel env add TURSO_AUTH_TOKEN
# paste: your token

vercel env add SESSION_SECRET
# paste: your generated secret

vercel env add DEMO_MODE
# paste: true
```

Then redeploy to apply the env vars:
```bash
vercel --prod
```

---

## Step 5 — Verify

Open the URL printed by `vercel --prod` (e.g. `https://riskops-demo.vercel.app`).

An amber banner — **"Demo Environment — Mock Data Only — Not for Production Use"** — should
appear on every dashboard page, confirming demo mode is active.

Demo login credentials:
| Email | Role |
|---|---|
| `d.williams@riskops.io` | Analyst |
| `p.patel@riskops.io` | Senior Investigator |
| `m.johnson@riskops.io` | Compliance Manager |
| `s.chen@riskops.io` | BSA Officer |
| `a.thompson@riskops.io` | Auditor |
| `admin@riskops.io` | Admin |

All accounts use password: **`riskops2026`**

---

## Demo Mode

`DEMO_MODE=true` makes the app safe for private demos without disabling normal workflows.

**Enabled in demo mode** (demo viewers can exercise the full workflow):
- KYC verification (mock), sanctions screening, alert assignment and status changes
- Escalating alerts to cases, adding case notes, requesting EDD
- Recommending SAR review, BSA Officer approve/decline, marking SAR as filed
- Importing CSV demo files, exporting audit packages, generating audit log entries
- AI Case Summary (if `ANTHROPIC_API_KEY` is set — shows a mock-data warning)

**Blocked in demo mode** (API returns `403 Demo mode: destructive actions are disabled.`):
- Deleting users, customers, alerts, cases, SAR reviews, or audit log entries
- Wiping or resetting the database from the UI
- Changing production/security-sensitive settings or vendor API credentials

Demo mode is **not** required for deployment — omit `DEMO_MODE` or set it to `"false"` for a
standard deployment without restrictions.

---

## Keeping the demo private

By default Vercel deployments are publicly accessible at the generated URL.
To restrict access:

**Option A — Share the URL only with intended viewers** (free tier):
The URL is unguessable but not truly private. Suitable for short demos where
you share the link directly with participants.

**Option B — Password protect with Vercel (Pro plan required)**:
```bash
vercel project update --password-protect
```

**Option C — Add IP allowlist via Vercel Firewall** (Pro plan required):
In Vercel dashboard → Project → Settings → Firewall.

---

## Reseeding the demo data

If you want to reset demo data to a clean state:
```bash
# with your Turso env vars in .env
npm run db:seed
```

This wipes all data and re-inserts the original demo dataset.

---

## Local development (unchanged)

```bash
cp .env.example .env    # keep DATABASE_URL=file:./dev.db for local
npm install
npm run db:seed         # seeds local dev.db
npm run dev             # starts on http://localhost:3000
```
