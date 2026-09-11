# Synfolix Website — Phase 1: Foundation (Schema + API + Homepage)

## Context

Synfolix needs a modern, scalable corporate website that positions the company as a
multi-industry software product company (not just healthcare), with two clear pillars:
**Our Products** (owned software: HIMS today, Legal and CRM later) and **Custom Software**
(third-party client work). Full requirements live in the source PDF the user supplied
("website requirement.pdf").

The full spec (~15+ page types: products, industries, case studies, blog, careers, etc.) is
too large for one implementation pass. This document covers only **Phase 1: the foundation**
— the data model, backend API, admin CMS skeleton, and public homepage — proving the
"adding a product/industry never requires a redeploy" architecture end to end. Later phases
(case studies, blog, careers, per-product/industry landing pages, analytics, animation
polish) build on this same pattern without touching it.

## Decisions (confirmed with user)

- **Stack**: React (JS, not TS) frontend, Node/Express (JS) backend, PostgreSQL database,
  Prisma as the ORM.
- **CMS**: custom-built admin panel (not a headless CMS like Strapi/Payload) — a React admin
  app on the same backend.
- **Repo layout**: single monorepo, three top-level apps: `backend/`, `admin/`, `frontend/`.
- **Launch products**: HIMS only for phase 1 (Legal and CRM products added as rows later,
  once those apps are further along — no code change needed to add them).
- **Data modeling**: dedicated relational tables per content type (not a generic EAV/content
  blocks table), with `JSONB` columns for naturally list-shaped fields (feature lists,
  screenshot arrays). This satisfies "no redesign to add a product" because adding a product
  is an admin inserting a row, not a schema or code change.
- **Reference material**: EPAM's website is inspiration for structure/positioning only — not
  to be copied. HIMS product copy is grounded in `C:\Users\anant\hms_project` (role-based
  portals for doctor/nurse/staff/admin; OPD/IPD, ward/bed, HR/attendance, pharmacy, audit
  logs, AI-assisted prescription/clinical decision support). No `.env` file in that project
  was read, per the user's strict rule — this rule applies to all future work in this
  repo too.

## Architecture

```
synf_web/
  backend/     Express API + Prisma schema/migrations, talks to Postgres
  admin/       React + Tailwind admin CMS (auth-gated)
  frontend/    React + Tailwind public marketing site
  docs/        specs and plans (this file lives here)
```

Both `admin` and `frontend` are separate Vite-built React SPAs, both talk to the same
`backend` Express API over HTTP/JSON. `admin` uses authenticated endpoints; `frontend` uses
public read endpoints plus the public lead-submission endpoint.

## Data model (Prisma, phase 1 tables)

**`products`**
- `id`, `slug` (unique, URL-safe), `name`, `industry` (string, phase 1 — not yet a foreign
  key to a separate taxonomy beyond the `industries` table's slug), `tagline`, `description`
  (long text)
- `key_features` — `JSONB`, array of strings
- `screenshots` — `JSONB`, array of `{ url, alt }`
- `status` — enum `draft` | `published` (only `published` rows appear on the public site)
- `created_at`, `updated_at`

**`industries`**
- `id`, `slug` (unique), `name`, `description`, `icon` (string, e.g. icon name or URL),
  `display_order` (int, controls homepage ordering)
- `created_at`, `updated_at`

**`leads`** (contact form submissions)
- `id`, `name`, `company`, `email`, `phone`, `industry`, `project_description`
  ("what do you want to build?"), `budget` (nullable), `timeline`, `message`
- `created_at`

**`admin_users`**
- `id`, `email` (unique), `password_hash`, `role` (single role for phase 1 — just
  "admin"; no need for HMS's multi-role complexity since this is one small internal team)
- `created_at`, `last_login_at`

Migrations are managed via Prisma Migrate from day one so schema evolution (phase 2+ adding
`case_studies`, `blog_posts`, etc.) is tracked and reversible.

## Backend API (`/backend`)

**Public endpoints**
- `GET /api/products` — published products only, list view (name, slug, industry, tagline,
  first screenshot)
- `GET /api/products/:slug` — full product detail (404 if not found or not published)
- `GET /api/industries` — ordered by `display_order`
- `POST /api/leads` — contact form submission. Validated (required fields, email format),
  rate-limited per IP to prevent spam, no auth required.

**Admin endpoints** (JWT-authenticated, `Authorization: Bearer <token>`)
- `POST /api/admin/login` — email + password, returns JWT
- `GET/POST/PUT/DELETE /api/admin/products` / `/api/admin/products/:id` — full CRUD,
  including draft/published toggle
- `GET/POST/PUT/DELETE /api/admin/industries` / `/api/admin/industries/:id` — full CRUD
- `GET /api/admin/leads` — list submitted leads (read-only in phase 1; no status/pipeline
  tracking yet)

**Cross-cutting**
- Every write endpoint validates input (zod) before touching the DB.
- Passwords hashed with bcrypt; JWT secret and DB connection string read from environment
  variables, never committed or exposed to the frontend.
- CORS restricted to the known frontend/admin origins.
- `helmet` for standard security headers.

## Admin app (`/admin`)

React + Tailwind SPA, login-gated (redirects to `/login` if no valid token).

Screens:
- **Login**
- **Products** — list (with draft/published badge), create/edit form (name, slug
  auto-generated from name but editable, industry, tagline, description, features list
  editor, screenshot upload/URL list, publish toggle), delete with confirmation
- **Industries** — list, create/edit form (name, slug, description, icon, display order),
  delete with confirmation
- **Leads** — read-only table of contact form submissions, newest first

This is deliberately minimal in phase 1 — just enough to prove content is fully
CMS-managed. Blog/case-study/career admin screens arrive with those content types in later
phases.

## Frontend app (`/frontend`)

React + Tailwind + React Router SPA. Phase 1 ships one real page — the homepage — built from
the sections in the requirements PDF that don't depend on later-phase content types:

- **Nav**: Home, Products, Solutions, Industries, Our Work, About, Contact (links to
  in-progress/phase-2 pages can be present but point to a simple "coming soon" state where
  the destination page doesn't exist yet — avoid dead links) + primary CTA "Build With
  Synfolix"
- **Hero**: headline "We build digital products that solve real business problems.",
  supporting text, primary CTA "Explore Our Products", secondary CTA "Build With Synfolix"
- **What Is Synfolix**: explains the two pillars (Our Products vs Custom Software)
- **Our Products**: pulls from `GET /api/products` — renders the HIMS card (and any future
  published product automatically, no code change needed)
- **Build With Synfolix**: services list, Idea→Strategy→Design→Development→Testing→
  Launch→Scale journey, CTA "Tell Us What You're Building"
- **Industries**: pulls from `GET /api/industries`
- **Why Synfolix**: the five themes from the PDF (Product Thinking, Built Around Your
  Business, Modern Technology, End-to-End Development, Built to Scale)
- **Process**: the six-step Discover→Define→Design→Build→Launch→Scale, with a visual
  treatment (not six plain boxes) — exact visual approach decided during implementation,
  informed by frontend-design skill guidance
- **Contact**: form (name, company, email, phone, industry, project description, budget
  optional, timeline, message) posting to `POST /api/leads`, plus static email/phone/social
  info
- **Footer**: per the PDF's footer link groups (Company, Products, Solutions, Industries,
  Resources, Legal) — links to not-yet-built pages are present but inert/placeholder in
  phase 1

Design direction: clean, minimal, premium, strong typography, no stock photography, no
gradient overload — per the PDF's design principles. The `frontend-design` skill will guide
actual visual/typography/color decisions during implementation; this spec fixes structure and
data flow, not final visual design.

## Testing

- Backend: unit/integration tests for the API endpoints (especially validation and the
  draft/published filtering on public endpoints) using the project's test runner of choice
  (decided at implementation time — likely `vitest` or `jest` + `supertest`).
- Frontend/admin: component-level tests are lighter-weight for phase 1; priority is a
  working, visually verified homepage (dev server run + manual check) over exhaustive test
  coverage, consistent with this being a marketing site rather than a transactional app.

## Explicitly out of scope for phase 1

Case studies system, blog/insights, careers page, `/build-with-us` dedicated landing page,
individual product detail pages beyond the API existing (`/products/:slug` route in the
frontend can come in phase 2), individual industry landing pages, full SEO implementation
(sitemap, schema markup, OG tags — basic meta tags only in phase 1), analytics/conversion
tracking, scroll-based storytelling animation polish, team/testimonials/FAQ content types.

## Open items for later phases

- Auth hardening (password reset flow, session expiry policy) once there's more than one
  admin user.
- Deployment target and CI/CD (not decided yet — will be its own decision when we're ready
  to ship phase 1).
- Image hosting strategy for product screenshots (local disk vs S3-compatible storage) —
  phase 1 can start with URLs to externally-hosted images or a simple local `/uploads`
  folder; revisit before production launch.
