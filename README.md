# Brounic dashboard

Project management dashboard for Brounic Fire Fighting Company — hosted at
`brounic.com/dashboard`. Covers three modules:

- **New projects** — supply & installation, including shop drawing preparation/submission with revision tracking
- **Maintenance** — reactive/scheduled/warranty jobs
- **AMC** — annual maintenance contracts, each with 4 auto-scheduled quarterly visits and a system-grouped checklist (extinguishers, fire alarm, sprinklers, fire pumps, hydrants, emergency lighting)

Access is gated: employees register, and stay `PENDING` until an admin approves
them from **Employee approvals** in the sidebar. Approved employees see all
three modules.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind + Prisma (PostgreSQL) + NextAuth (credentials).

## Branding

- Colors are set in `tailwind.config.ts` under the `brounic` palette: orange `#F7941D` (CTAs, active/hover states, accents), accent `#FFB347`, black `#111111` and dark grey `#2E2E2E` (sidebar, headings), light grey `#F5F5F5` (page background), white.
- Drop the real Brounic Group logo file at `public/logo.png` (transparent background recommended) — `src/components/Logo.tsx` picks it up automatically on the login/register pages and the dashboard sidebar. Until then it falls back to a text mark ("Brounic Group / Fire and Safety").

## Getting set up (via GitHub web UI + Vercel)

1. Create a new GitHub repo and upload this folder's contents (drag-and-drop
   upload works for the full tree, or use `git push` if you have it).
2. Provision a Postgres database — Vercel Postgres, Supabase, or Neon all work.
   Copy the connection string.
3. In Vercel, import the repo. Add these environment variables (see
   `.env.example`):
   - `DATABASE_URL`
   - `NEXTAUTH_URL` — set to `https://brounic.com/dashboard`
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — for the first admin account
4. Deploy. Vercel runs `prisma generate` automatically via `postinstall`.
5. Run the migration and seed the first admin once, from your machine or a
   one-off Vercel CLI run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
   This creates the first `ADMIN` account (since no one can approve anyone
   until one admin exists). Change its password after first login.
6. Everyone else registers at `/register` and waits for that admin to approve
   them from `/admin/employees`.

## Routes

| Route | Purpose |
|---|---|
| `/login`, `/register`, `/pending` | Auth flow |
| `/dashboard` | Overview — AMC visits due, open maintenance, active projects |
| `/dashboard/projects`, `/dashboard/projects/[id]` | New project + shop drawings |
| `/dashboard/maintenance` | Maintenance jobs |
| `/dashboard/amc`, `/dashboard/amc/[id]` | AMC contracts + quarterly visits |
| `/admin/employees` | Approve/reject/suspend accounts (admin only) |

## Not yet built (next steps)

- Forms to create new projects, shop drawing submissions, maintenance jobs, and AMC contracts (currently read-only list/detail views seeded via Prisma Studio or scripts)
- Checklist item entry UI per AMC visit + non-conformance corrective-action flow
- Auto-generated visit report/certificate PDF with client sign-off
- File upload for drawings and checklist photo evidence
