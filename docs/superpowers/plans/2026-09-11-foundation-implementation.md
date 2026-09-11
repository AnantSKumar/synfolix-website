# Synfolix Foundation (Schema + API + Homepage) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Synfolix monorepo foundation — Postgres schema via Prisma, an Express API (public read/write + JWT-authenticated admin CRUD), a minimal React admin CMS, and a real public homepage that renders products/industries from the database — proving the "add a product without touching code" architecture end to end.

**Architecture:** Three independent apps in one repo (`backend`, `admin`, `frontend`), all talking over HTTP/JSON. `backend` owns the Postgres schema (Prisma) and is the only thing that touches the database. `admin` and `frontend` are separate Vite React SPAs consuming the same API from different origins.

**Tech Stack:** Node.js + Express (JavaScript, no TypeScript), PostgreSQL, Prisma ORM, React (JavaScript) + Vite + Tailwind CSS + React Router, vitest + supertest for backend tests, JWT (jsonwebtoken) + bcrypt for admin auth, zod for input validation, express-rate-limit + helmet for hardening.

**Spec:** `docs/superpowers/specs/2026-09-11-foundation-design.md`

## Global Constraints

- Stack is fixed: React (JS) frontend/admin, Express (JS) backend, PostgreSQL via Prisma, Tailwind CSS. No TypeScript.
- Repo layout: `backend/`, `admin/`, `frontend/` at the repo root, plus `docs/`.
- Never read, print, or commit any `.env` file, in this repo or any other (e.g. `hms_project`) — this is a strict user rule with no exceptions.
- Never expose secrets (DB connection string, JWT secret) to `admin` or `frontend` code — they only ever call the `backend` HTTP API.
- Only `published` products are ever returned from public endpoints; `draft` products are admin-only.
- Every endpoint that writes data validates its input with zod before touching the database.
- The public `POST /api/leads` endpoint must be rate-limited (spam protection, per spec).
- Admin endpoints require a valid JWT (`Authorization: Bearer <token>`); passwords are bcrypt-hashed, never stored or logged in plaintext.
- Launch product content is HIMS only (seeded via the admin CMS in Task 16, not hardcoded into the frontend).
- CORS on the backend is restricted to the known `admin` and `frontend` dev origins (`http://localhost:5173`, `http://localhost:5174`) — not wildcard.
- Design language for `frontend`/`admin`: clean, minimal, premium, strong typography, no stock photography — per the spec's design principles.

---

## Part A — Backend (`backend/`)

### Task 1: Backend scaffold + health check endpoint

**Files:**
- Create: `backend/package.json`
- Create: `backend/.gitignore`
- Create: `backend/.env.example`
- Create: `backend/src/app.js`
- Create: `backend/src/server.js`
- Test: `backend/tests/health.test.js`
- Create: `backend/vitest.config.js`

**Interfaces:**
- Produces: `backend/src/app.js` exports a configured Express `app` (not listening) — every later task mounts routes on this `app`.
- Produces: `GET /api/health` returns `{ status: "ok" }`.

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "synfolix-backend",
  "version": "0.1.0",
  "type": "commonjs",
  "private": true,
  "scripts": {
    "dev": "node src/server.js",
    "test": "vitest run",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.4.5",
    "@prisma/client": "^5.20.0",
    "zod": "^3.23.8",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.4.0"
  },
  "devDependencies": {
    "prisma": "^5.20.0",
    "vitest": "^2.1.1",
    "supertest": "^7.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd backend && npm install`

- [ ] **Step 3: Create `backend/.gitignore`**

```
node_modules/
.env
dist/
```

- [ ] **Step 4: Create `backend/.env.example`** (documents required vars, never a real secret)

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/synfolix?schema=public"
JWT_SECRET="replace-with-a-long-random-string"
PORT=4000
FRONTEND_ORIGIN="http://localhost:5173"
ADMIN_ORIGIN="http://localhost:5174"
```

- [ ] **Step 5: Create `backend/vitest.config.js`**

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
```

- [ ] **Step 6: Write the failing test for the health endpoint**

`backend/tests/health.test.js`:

```js
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `cd backend && npx vitest run tests/health.test.js`
Expected: FAIL — `src/app.js` does not exist yet.

- [ ] **Step 8: Create `backend/src/app.js`**

```js
const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
```

Note: use `require`/`module.exports` (CommonJS) throughout the backend to match `"type": "commonjs"` in package.json. Adjust the test file's import to `import app from "../src/app.js"` — Vitest transpiles this fine against a CommonJS module via its default interop; if it complains, change the test import to `const app = require("../src/app.js")` and switch the test file itself to CommonJS-friendly syntax (Vitest supports both).

- [ ] **Step 9: Create `backend/src/server.js`**

```js
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Synfolix backend listening on port ${PORT}`);
});
```

- [ ] **Step 10: Run test to verify it passes**

Run: `cd backend && npx vitest run tests/health.test.js`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add backend/package.json backend/.gitignore backend/.env.example backend/src/app.js backend/src/server.js backend/vitest.config.js backend/tests/health.test.js backend/package-lock.json
git commit -m "feat(backend): scaffold Express app with health check endpoint"
```

---

### Task 2: Prisma schema + initial migration

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/lib/prisma.js`

**Interfaces:**
- Consumes: `DATABASE_URL` from `backend/.env` (the engineer creates this locally from `.env.example` — never commit it).
- Produces: `backend/src/lib/prisma.js` exports a singleton `prisma` client — every DB-touching task in this plan imports it as `const prisma = require("../lib/prisma")`.
- Produces: Prisma models `Product`, `Industry`, `Lead`, `AdminUser` mapped to tables `products`, `industries`, `leads`, `admin_users`.

- [ ] **Step 1: Create `backend/prisma/schema.prisma`**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ProductStatus {
  draft
  published
}

model Product {
  id          Int           @id @default(autoincrement())
  slug        String        @unique
  name        String
  industry    String
  tagline     String
  description String
  keyFeatures Json          @map("key_features")
  screenshots Json
  status      ProductStatus @default(draft)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@map("products")
}

model Industry {
  id           Int      @id @default(autoincrement())
  slug         String   @unique
  name         String
  description  String
  icon         String
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("industries")
}

model Lead {
  id                 Int      @id @default(autoincrement())
  name               String
  company             String?
  email              String
  phone              String?
  industry           String?
  projectDescription String?  @map("project_description")
  budget             String?
  timeline           String?
  message            String?
  createdAt          DateTime @default(now()) @map("created_at")

  @@map("leads")
}

model AdminUser {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         String    @default("admin")
  createdAt    DateTime  @default(now()) @map("created_at")
  lastLoginAt  DateTime? @map("last_login_at")

  @@map("admin_users")
}
```

- [ ] **Step 2: Create local `.env` from the example (not committed)**

Run: `cd backend && cp .env.example .env` then edit `backend/.env` to point `DATABASE_URL` at a real local Postgres database (create one first, e.g. `createdb synfolix` or via `psql`). Do not read this file back with any tool afterward — the user's strict rule against reading `.env` files applies here too; the engineer edits it directly in their own editor.

- [ ] **Step 3: Run the initial migration**

Run: `cd backend && npx prisma migrate dev --name init`
Expected: Prisma creates `backend/prisma/migrations/<timestamp>_init/migration.sql` and applies it, creating the four tables in the local database.

- [ ] **Step 4: Verify tables exist**

Run: `cd backend && npx prisma studio` (opens a browser UI) or `psql $DATABASE_URL -c '\dt'` — confirm `products`, `industries`, `leads`, `admin_users` are present. Close Prisma Studio when done.

- [ ] **Step 5: Create `backend/src/lib/prisma.js`**

```js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
```

- [ ] **Step 6: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations backend/src/lib/prisma.js
git commit -m "feat(backend): add Prisma schema and initial migration"
```

(`backend/.env` stays uncommitted per `.gitignore` from Task 1.)

---

### Task 3: Public `GET /api/industries`

**Files:**
- Create: `backend/src/routes/industries.js`
- Modify: `backend/src/app.js`
- Test: `backend/tests/industries.test.js`
- Create: `backend/tests/testUtils.js`

**Interfaces:**
- Consumes: `prisma` from `backend/src/lib/prisma.js` (Task 2).
- Produces: `GET /api/industries` → `200`, JSON array of industries ordered by `displayOrder` ascending, each `{ id, slug, name, description, icon, displayOrder }`.
- Produces: `backend/tests/testUtils.js` exports `resetDb()` (deletes all rows from all four tables) — reused by every later backend test file.

- [ ] **Step 1: Create `backend/tests/testUtils.js`**

```js
const prisma = require("../src/lib/prisma");

async function resetDb() {
  await prisma.lead.deleteMany();
  await prisma.product.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.adminUser.deleteMany();
}

module.exports = { resetDb };
```

- [ ] **Step 2: Write the failing test**

`backend/tests/industries.test.js`:

```js
const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

describe("GET /api/industries", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it("returns industries ordered by displayOrder", async () => {
    await prisma.industry.create({
      data: { slug: "legal", name: "Legal", description: "d", icon: "scale", displayOrder: 2 },
    });
    await prisma.industry.create({
      data: { slug: "healthcare", name: "Healthcare", description: "d", icon: "heart", displayOrder: 1 },
    });

    const res = await request(app).get("/api/industries");

    expect(res.status).toBe(200);
    expect(res.body.map((i) => i.slug)).toEqual(["healthcare", "legal"]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && npx vitest run tests/industries.test.js`
Expected: FAIL — route `/api/industries` does not exist (404).

- [ ] **Step 4: Create `backend/src/routes/industries.js`**

```js
const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const industries = await prisma.industry.findMany({
      orderBy: { displayOrder: "asc" },
    });
    res.json(industries);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 5: Mount the route in `backend/src/app.js`**

Add near the top after `app.use(express.json())`:

```js
const industriesRouter = require("./routes/industries");
app.use("/api/industries", industriesRouter);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && npx vitest run tests/industries.test.js`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/industries.js backend/src/app.js backend/tests/industries.test.js backend/tests/testUtils.js
git commit -m "feat(backend): add public GET /api/industries endpoint"
```

---

### Task 4: Public `GET /api/products` and `GET /api/products/:slug`

**Files:**
- Create: `backend/src/routes/products.js`
- Modify: `backend/src/app.js`
- Test: `backend/tests/products.test.js`

**Interfaces:**
- Consumes: `prisma`, `resetDb` (from Tasks 2–3).
- Produces: `GET /api/products` → `200`, JSON array of `published` products only, each `{ id, slug, name, industry, tagline, screenshots }` (list view — no `description`/`keyFeatures` to keep the list payload light).
- Produces: `GET /api/products/:slug` → `200` with full product `{ id, slug, name, industry, tagline, description, keyFeatures, screenshots, status }` if published; `404 { error: "Product not found" }` if missing or `draft`.

- [ ] **Step 1: Write the failing tests**

`backend/tests/products.test.js`:

```js
const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

describe("Products public endpoints", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it("GET /api/products only returns published products", async () => {
    await prisma.product.create({
      data: {
        slug: "hims",
        name: "HIMS",
        industry: "healthcare",
        tagline: "Run your hospital end to end",
        description: "Full description",
        keyFeatures: ["OPD", "IPD"],
        screenshots: [{ url: "/img/hims-1.png", alt: "Dashboard" }],
        status: "published",
      },
    });
    await prisma.product.create({
      data: {
        slug: "draft-product",
        name: "Draft Product",
        industry: "legal",
        tagline: "Not ready",
        description: "d",
        keyFeatures: [],
        screenshots: [],
        status: "draft",
      },
    });

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].slug).toBe("hims");
  });

  it("GET /api/products/:slug returns full detail for a published product", async () => {
    await prisma.product.create({
      data: {
        slug: "hims",
        name: "HIMS",
        industry: "healthcare",
        tagline: "Run your hospital end to end",
        description: "Full description",
        keyFeatures: ["OPD", "IPD"],
        screenshots: [{ url: "/img/hims-1.png", alt: "Dashboard" }],
        status: "published",
      },
    });

    const res = await request(app).get("/api/products/hims");

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("HIMS");
    expect(res.body.keyFeatures).toEqual(["OPD", "IPD"]);
  });

  it("GET /api/products/:slug returns 404 for a draft product", async () => {
    await prisma.product.create({
      data: {
        slug: "draft-product",
        name: "Draft Product",
        industry: "legal",
        tagline: "Not ready",
        description: "d",
        keyFeatures: [],
        screenshots: [],
        status: "draft",
      },
    });

    const res = await request(app).get("/api/products/draft-product");

    expect(res.status).toBe(404);
  });

  it("GET /api/products/:slug returns 404 for an unknown slug", async () => {
    const res = await request(app).get("/api/products/does-not-exist");
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run tests/products.test.js`
Expected: FAIL — route `/api/products` does not exist.

- [ ] **Step 3: Create `backend/src/routes/products.js`**

```js
const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "published" },
      select: {
        id: true,
        slug: true,
        name: true,
        industry: true,
        tagline: true,
        screenshots: true,
      },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });

    if (!product || product.status !== "published") {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 4: Mount the route in `backend/src/app.js`**

```js
const productsRouter = require("./routes/products");
app.use("/api/products", productsRouter);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd backend && npx vitest run tests/products.test.js`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/products.js backend/src/app.js backend/tests/products.test.js
git commit -m "feat(backend): add public product list and detail endpoints"
```

---

### Task 5: Public `POST /api/leads` (validated, rate-limited)

**Files:**
- Create: `backend/src/validators/leadValidator.js`
- Create: `backend/src/routes/leads.js`
- Modify: `backend/src/app.js`
- Test: `backend/tests/leads.test.js`

**Interfaces:**
- Produces: `backend/src/validators/leadValidator.js` exports `leadSchema` (zod) — used by this route and reused by the admin leads read model implicitly (no reuse needed there, read-only).
- Produces: `POST /api/leads` → `201` with the created lead's `{ id }` on valid body; `400 { error: "Validation failed", details: [...] }` on invalid body; `429` after exceeding the rate limit.

- [ ] **Step 1: Write the failing tests**

`backend/tests/leads.test.js`:

```js
const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

describe("POST /api/leads", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it("creates a lead with valid data", async () => {
    const res = await request(app).post("/api/leads").send({
      name: "Jane Founder",
      company: "Acme Startup",
      email: "jane@acme.test",
      phone: "555-0100",
      industry: "startups",
      projectDescription: "An MVP for scheduling",
      timeline: "3 months",
      message: "Let's talk",
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();

    const stored = await prisma.lead.findUnique({ where: { id: res.body.id } });
    expect(stored.email).toBe("jane@acme.test");
  });

  it("rejects a lead missing required fields", async () => {
    const res = await request(app).post("/api/leads").send({
      company: "Acme Startup",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("rejects a lead with an invalid email", async () => {
    const res = await request(app).post("/api/leads").send({
      name: "Jane Founder",
      email: "not-an-email",
      message: "hi",
    });

    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run tests/leads.test.js`
Expected: FAIL — route does not exist.

- [ ] **Step 3: Create `backend/src/validators/leadValidator.js`**

```js
const { z } = require("zod");

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional(),
  industry: z.string().optional(),
  projectDescription: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().optional(),
});

module.exports = { leadSchema };
```

- [ ] **Step 4: Create `backend/src/routes/leads.js`**

```js
const express = require("express");
const rateLimit = require("express-rate-limit");
const prisma = require("../lib/prisma");
const { leadSchema } = require("../validators/leadValidator");

const router = express.Router();

const leadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions, please try again later." },
});

router.post("/", leadRateLimiter, async (req, res, next) => {
  const parsed = leadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const lead = await prisma.lead.create({ data: parsed.data });
    res.status(201).json({ id: lead.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 5: Mount the route in `backend/src/app.js`**

```js
const leadsRouter = require("./routes/leads");
app.use("/api/leads", leadsRouter);
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd backend && npx vitest run tests/leads.test.js`
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add backend/src/validators/leadValidator.js backend/src/routes/leads.js backend/src/app.js backend/tests/leads.test.js
git commit -m "feat(backend): add validated, rate-limited POST /api/leads endpoint"
```

---

### Task 6: Admin auth — create-admin script + `POST /api/admin/login`

**Files:**
- Create: `backend/src/scripts/createAdmin.js`
- Create: `backend/src/routes/admin/auth.js`
- Modify: `backend/src/app.js`
- Test: `backend/tests/admin.auth.test.js`

**Interfaces:**
- Produces: `backend/src/scripts/createAdmin.js` — a CLI script (`node src/scripts/createAdmin.js <email> <password>`) that bcrypt-hashes the password and inserts an `AdminUser` row. Used in this task's test setup and by the engineer to create the first real admin later.
- Produces: `POST /api/admin/login` → `200 { token }` on valid credentials; `401 { error: "Invalid credentials" }` otherwise. Token payload is `{ sub: adminUser.id, email }`, signed with `JWT_SECRET`, 12h expiry.

- [ ] **Step 1: Create `backend/src/scripts/createAdmin.js`**

```js
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error("Usage: node src/scripts/createAdmin.js <email> <password>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Admin user ready: ${admin.email}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
```

- [ ] **Step 2: Write the failing test**

`backend/tests/admin.auth.test.js`:

```js
const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

describe("POST /api/admin/login", () => {
  beforeEach(async () => {
    await resetDb();
    await prisma.adminUser.create({
      data: {
        email: "admin@synfolix.test",
        passwordHash: await bcrypt.hash("correct-horse", 10),
      },
    });
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it("returns a token for valid credentials", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: "admin@synfolix.test", password: "correct-horse" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects an invalid password", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: "admin@synfolix.test", password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("rejects an unknown email", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: "nobody@synfolix.test", password: "whatever" });

    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && npx vitest run tests/admin.auth.test.js`
Expected: FAIL — route does not exist.

- [ ] **Step 4: Create `backend/src/routes/admin/auth.js`**

```js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign({ sub: admin.id, email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 5: Mount the route in `backend/src/app.js`**

```js
const adminAuthRouter = require("./routes/admin/auth");
app.use("/api/admin", adminAuthRouter);
```

Note: `JWT_SECRET` must be set for tests to run — set it once at the top of `backend/vitest.config.js` via `process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-do-not-use-in-prod"` inside a `setupFiles` entry, or ensure the local `backend/.env` (loaded by `dotenv` in `server.js`) is also loaded for tests. Simplest fix: add `require("dotenv").config()` as the first line of `backend/tests/testUtils.js` so every test file that imports it also loads `.env`.

- [ ] **Step 6: Add dotenv loading to test setup**

Add to the top of `backend/tests/testUtils.js`:

```js
require("dotenv").config();
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd backend && npx vitest run tests/admin.auth.test.js`
Expected: PASS (3 tests)

- [ ] **Step 8: Commit**

```bash
git add backend/src/scripts/createAdmin.js backend/src/routes/admin/auth.js backend/src/app.js backend/tests/admin.auth.test.js backend/tests/testUtils.js
git commit -m "feat(backend): add admin login endpoint and create-admin script"
```

---

### Task 7: `requireAuth` middleware

**Files:**
- Create: `backend/src/middleware/requireAuth.js`
- Modify: `backend/src/app.js`
- Test: `backend/tests/requireAuth.test.js`

**Interfaces:**
- Produces: `backend/src/middleware/requireAuth.js` exports a middleware function that verifies the `Authorization: Bearer <token>` header, attaches `req.admin = { id, email }` on success, or responds `401 { error: "Unauthorized" }`. Every admin CRUD route in Tasks 8–10 uses this.
- Adds a temporary `GET /api/admin/whoami` route in `app.js` purely to test the middleware in isolation (kept permanently — it's a genuinely useful "am I logged in" check for the admin frontend).

- [ ] **Step 1: Write the failing test**

`backend/tests/requireAuth.test.js`:

```js
const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

describe("requireAuth middleware via GET /api/admin/whoami", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/admin/whoami");
    expect(res.status).toBe(401);
  });

  it("rejects requests with an invalid token", async () => {
    const res = await request(app)
      .get("/api/admin/whoami")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("accepts a valid token and returns the admin identity", async () => {
    const token = jwt.sign({ sub: 1, email: "admin@synfolix.test" }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    const res = await request(app)
      .get("/api/admin/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("admin@synfolix.test");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run tests/requireAuth.test.js`
Expected: FAIL — route does not exist.

- [ ] **Step 3: Create `backend/src/middleware/requireAuth.js`**

```js
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = requireAuth;
```

- [ ] **Step 4: Add the `whoami` route in `backend/src/app.js`**

```js
const requireAuth = require("./middleware/requireAuth");

app.get("/api/admin/whoami", requireAuth, (req, res) => {
  res.json({ id: req.admin.id, email: req.admin.email });
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && npx vitest run tests/requireAuth.test.js`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add backend/src/middleware/requireAuth.js backend/src/app.js backend/tests/requireAuth.test.js
git commit -m "feat(backend): add requireAuth middleware and /api/admin/whoami"
```

---

### Task 8: Admin products CRUD

**Files:**
- Create: `backend/src/validators/productValidator.js`
- Create: `backend/src/routes/admin/products.js`
- Modify: `backend/src/app.js`
- Test: `backend/tests/admin.products.test.js`

**Interfaces:**
- Consumes: `requireAuth` (Task 7), `resetDb` (Task 3).
- Produces: under `requireAuth`, `GET /api/admin/products` (all products, any status), `POST /api/admin/products` (create, `201`), `PUT /api/admin/products/:id` (update, `200`), `DELETE /api/admin/products/:id` (`204`). All return `401` without a valid token; write endpoints `400` on invalid body per `productSchema`.

- [ ] **Step 1: Create `backend/src/validators/productValidator.js`**

```js
const { z } = require("zod");

const productSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  industry: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  keyFeatures: z.array(z.string()).default([]),
  screenshots: z
    .array(z.object({ url: z.string().min(1), alt: z.string().min(1) }))
    .default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});

const productUpdateSchema = productSchema.partial();

module.exports = { productSchema, productUpdateSchema };
```

- [ ] **Step 2: Write the failing tests**

`backend/tests/admin.products.test.js`:

```js
const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

function authHeader() {
  const token = jwt.sign({ sub: 1, email: "admin@synfolix.test" }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
  return `Bearer ${token}`;
}

const validProduct = {
  slug: "hims",
  name: "HIMS",
  industry: "healthcare",
  tagline: "Run your hospital end to end",
  description: "Full description",
  keyFeatures: ["OPD", "IPD"],
  screenshots: [{ url: "/img/hims-1.png", alt: "Dashboard" }],
  status: "draft",
};

describe("Admin products CRUD", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/admin/products");
    expect(res.status).toBe(401);
  });

  it("creates a product", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", authHeader())
      .send(validProduct);

    expect(res.status).toBe(201);
    expect(res.body.slug).toBe("hims");
  });

  it("rejects an invalid product body", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", authHeader())
      .send({ name: "Missing fields" });

    expect(res.status).toBe(400);
  });

  it("lists all products regardless of status", async () => {
    await prisma.product.create({ data: validProduct });
    await prisma.product.create({
      data: { ...validProduct, slug: "hims-published", status: "published" },
    });

    const res = await request(app)
      .get("/api/admin/products")
      .set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("updates a product", async () => {
    const created = await prisma.product.create({ data: validProduct });

    const res = await request(app)
      .put(`/api/admin/products/${created.id}`)
      .set("Authorization", authHeader())
      .send({ status: "published" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("published");
  });

  it("deletes a product", async () => {
    const created = await prisma.product.create({ data: validProduct });

    const res = await request(app)
      .delete(`/api/admin/products/${created.id}`)
      .set("Authorization", authHeader());

    expect(res.status).toBe(204);

    const stored = await prisma.product.findUnique({ where: { id: created.id } });
    expect(stored).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd backend && npx vitest run tests/admin.products.test.js`
Expected: FAIL — routes do not exist.

- [ ] **Step 4: Create `backend/src/routes/admin/products.js`**

```js
const express = require("express");
const prisma = require("../../lib/prisma");
const requireAuth = require("../../middleware/requireAuth");
const { productSchema, productUpdateSchema } = require("../../validators/productValidator");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  const parsed = productUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(product);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 5: Mount the route in `backend/src/app.js`**

```js
const adminProductsRouter = require("./routes/admin/products");
app.use("/api/admin/products", adminProductsRouter);
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd backend && npx vitest run tests/admin.products.test.js`
Expected: PASS (6 tests)

- [ ] **Step 7: Commit**

```bash
git add backend/src/validators/productValidator.js backend/src/routes/admin/products.js backend/src/app.js backend/tests/admin.products.test.js
git commit -m "feat(backend): add authenticated admin products CRUD"
```

---

### Task 9: Admin industries CRUD

**Files:**
- Create: `backend/src/validators/industryValidator.js`
- Create: `backend/src/routes/admin/industries.js`
- Modify: `backend/src/app.js`
- Test: `backend/tests/admin.industries.test.js`

**Interfaces:**
- Consumes: `requireAuth` (Task 7).
- Produces: under `requireAuth`, `GET /api/admin/industries`, `POST /api/admin/industries` (`201`), `PUT /api/admin/industries/:id` (`200`), `DELETE /api/admin/industries/:id` (`204`) — same shape and auth/validation pattern as Task 8's products routes.

- [ ] **Step 1: Create `backend/src/validators/industryValidator.js`**

```js
const { z } = require("zod");

const industrySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  displayOrder: z.number().int().default(0),
});

const industryUpdateSchema = industrySchema.partial();

module.exports = { industrySchema, industryUpdateSchema };
```

- [ ] **Step 2: Write the failing tests**

`backend/tests/admin.industries.test.js`:

```js
const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

function authHeader() {
  const token = jwt.sign({ sub: 1, email: "admin@synfolix.test" }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
  return `Bearer ${token}`;
}

const validIndustry = {
  slug: "healthcare",
  name: "Healthcare",
  description: "Hospitals and clinics",
  icon: "heart",
  displayOrder: 1,
};

describe("Admin industries CRUD", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/admin/industries");
    expect(res.status).toBe(401);
  });

  it("creates an industry", async () => {
    const res = await request(app)
      .post("/api/admin/industries")
      .set("Authorization", authHeader())
      .send(validIndustry);

    expect(res.status).toBe(201);
    expect(res.body.slug).toBe("healthcare");
  });

  it("updates an industry", async () => {
    const created = await prisma.industry.create({ data: validIndustry });

    const res = await request(app)
      .put(`/api/admin/industries/${created.id}`)
      .set("Authorization", authHeader())
      .send({ displayOrder: 5 });

    expect(res.status).toBe(200);
    expect(res.body.displayOrder).toBe(5);
  });

  it("deletes an industry", async () => {
    const created = await prisma.industry.create({ data: validIndustry });

    const res = await request(app)
      .delete(`/api/admin/industries/${created.id}`)
      .set("Authorization", authHeader());

    expect(res.status).toBe(204);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd backend && npx vitest run tests/admin.industries.test.js`
Expected: FAIL — routes do not exist.

- [ ] **Step 4: Create `backend/src/routes/admin/industries.js`**

```js
const express = require("express");
const prisma = require("../../lib/prisma");
const requireAuth = require("../../middleware/requireAuth");
const { industrySchema, industryUpdateSchema } = require("../../validators/industryValidator");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const industries = await prisma.industry.findMany({ orderBy: { displayOrder: "asc" } });
    res.json(industries);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const parsed = industrySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const industry = await prisma.industry.create({ data: parsed.data });
    res.status(201).json(industry);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  const parsed = industryUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const industry = await prisma.industry.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(industry);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Industry not found" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.industry.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Industry not found" });
    }
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 5: Mount the route in `backend/src/app.js`**

```js
const adminIndustriesRouter = require("./routes/admin/industries");
app.use("/api/admin/industries", adminIndustriesRouter);
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd backend && npx vitest run tests/admin.industries.test.js`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add backend/src/validators/industryValidator.js backend/src/routes/admin/industries.js backend/src/app.js backend/tests/admin.industries.test.js
git commit -m "feat(backend): add authenticated admin industries CRUD"
```

---

### Task 10: Admin leads list (`GET /api/admin/leads`)

**Files:**
- Create: `backend/src/routes/admin/leads.js`
- Modify: `backend/src/app.js`
- Test: `backend/tests/admin.leads.test.js`

**Interfaces:**
- Consumes: `requireAuth` (Task 7).
- Produces: `GET /api/admin/leads` (authenticated) → `200`, JSON array of all leads, newest first.

- [ ] **Step 1: Write the failing test**

`backend/tests/admin.leads.test.js`:

```js
const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

function authHeader() {
  const token = jwt.sign({ sub: 1, email: "admin@synfolix.test" }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
  return `Bearer ${token}`;
}

describe("GET /api/admin/leads", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/admin/leads");
    expect(res.status).toBe(401);
  });

  it("returns leads newest first", async () => {
    await prisma.lead.create({ data: { name: "Older", email: "a@test.com" } });
    await prisma.lead.create({ data: { name: "Newer", email: "b@test.com" } });

    const res = await request(app).get("/api/admin/leads").set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Newer");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run tests/admin.leads.test.js`
Expected: FAIL — route does not exist.

- [ ] **Step 3: Create `backend/src/routes/admin/leads.js`**

```js
const express = require("express");
const prisma = require("../../lib/prisma");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    res.json(leads);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 4: Mount the route in `backend/src/app.js`**

```js
const adminLeadsRouter = require("./routes/admin/leads");
app.use("/api/admin/leads", adminLeadsRouter);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && npx vitest run tests/admin.leads.test.js`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/admin/leads.js backend/src/app.js backend/tests/admin.leads.test.js
git commit -m "feat(backend): add authenticated admin leads list endpoint"
```

---

### Task 11: Security hardening — helmet, CORS, centralized error handler

**Files:**
- Modify: `backend/src/app.js`
- Create: `backend/src/middleware/errorHandler.js`
- Test: `backend/tests/security.test.js`

**Interfaces:**
- Produces: `backend/src/middleware/errorHandler.js` — Express error-handling middleware mounted last in `app.js`; converts any uncaught error into `500 { error: "Internal server error" }` and logs the real error server-side (never leaks stack traces to the client).
- Modifies `app.js` to add `helmet()` and a `cors()` config restricted to `FRONTEND_ORIGIN`/`ADMIN_ORIGIN` env vars.

- [ ] **Step 1: Write the failing tests**

`backend/tests/security.test.js`:

```js
const { describe, it, expect } = require("vitest");
const request = require("supertest");
const app = require("../src/app");

describe("Security headers and CORS", () => {
  it("sets standard security headers via helmet", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("allows the configured frontend origin", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", process.env.FRONTEND_ORIGIN || "http://localhost:5173");
    expect(res.headers["access-control-allow-origin"]).toBe(
      process.env.FRONTEND_ORIGIN || "http://localhost:5173"
    );
  });

  it("rejects a random, unconfigured origin", async () => {
    const res = await request(app).get("/api/health").set("Origin", "http://evil.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run tests/security.test.js`
Expected: FAIL — no helmet/CORS configured yet.

- [ ] **Step 3: Create `backend/src/middleware/errorHandler.js`**

```js
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = errorHandler;
```

- [ ] **Step 4: Update `backend/src/app.js`** to add helmet, CORS, and mount the error handler last

Add near the top, after creating `app`:

```js
const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const allowedOrigins = [process.env.FRONTEND_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
  })
);
app.use(express.json());
```

And at the very end of the file, just before `module.exports = app;`:

```js
app.use(errorHandler);
```

Ensure test env vars are set — add to `backend/tests/testUtils.js` (already loads `dotenv`), confirm `backend/.env` has `FRONTEND_ORIGIN=http://localhost:5173` and `ADMIN_ORIGIN=http://localhost:5174` (already in `.env.example` from Task 1).

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd backend && npx vitest run tests/security.test.js`
Expected: PASS (3 tests)

- [ ] **Step 6: Run the full backend test suite to confirm nothing regressed**

Run: `cd backend && npx vitest run`
Expected: All tests across all files PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/app.js backend/src/middleware/errorHandler.js backend/tests/security.test.js
git commit -m "feat(backend): add helmet, restricted CORS, and centralized error handling"
```

---

## Part B — Admin CMS (`admin/`)

### Task 12: Admin app scaffold — Vite + React + Tailwind + API client

**Files:**
- Create: `admin/package.json`
- Create: `admin/vite.config.js`
- Create: `admin/index.html`
- Create: `admin/tailwind.config.js`
- Create: `admin/postcss.config.js`
- Create: `admin/src/main.jsx`
- Create: `admin/src/App.jsx`
- Create: `admin/src/index.css`
- Create: `admin/src/lib/apiClient.js`
- Create: `admin/.env.example`
- Create: `admin/.gitignore`

**Interfaces:**
- Produces: `admin/src/lib/apiClient.js` exports `apiFetch(path, options)` — a thin `fetch` wrapper that prefixes `import.meta.env.VITE_API_URL`, attaches the stored JWT if present, and throws on non-2xx responses with the parsed error body. Every later admin task uses this instead of raw `fetch`.
- No automated test for this task (pure scaffolding) — verified by running the dev server and seeing the placeholder page render.

- [ ] **Step 1: Scaffold with Vite**

Run: `cd /c/Users/anant/synf_web && npm create vite@latest admin -- --template react` (choose the React + JavaScript template, not TypeScript, when prompted).

- [ ] **Step 2: Install Tailwind and React Router**

Run: `cd admin && npm install && npm install -D tailwindcss postcss autoprefixer && npm install react-router-dom`

- [ ] **Step 3: Initialize Tailwind config**

Run: `cd admin && npx tailwindcss init -p`

Then edit the generated `admin/tailwind.config.js` `content` array to:

```js
content: ["./index.html", "./src/**/*.{js,jsx}"],
```

- [ ] **Step 4: Set up `admin/src/index.css`**

Replace contents with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Create `admin/.env.example`**

```
VITE_API_URL=http://localhost:4000/api
```

- [ ] **Step 6: Create local `.env`**

Run: `cd admin && cp .env.example .env` (already correct for local dev, no secrets involved — this one is fine to leave as-is).

- [ ] **Step 7: Create `admin/.gitignore`** (Vite's default template already includes one — verify it has `node_modules/`, `dist/`, and add `.env` if missing)

- [ ] **Step 8: Create `admin/src/lib/apiClient.js`**

```js
const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("synfolix_admin_token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch (e) {
      // ignore non-JSON error bodies
    }
    const error = new Error(body.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.details = body.details;
    throw error;
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
```

- [ ] **Step 9: Replace `admin/src/App.jsx`** with a placeholder confirming the scaffold works

```jsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <h1 className="text-2xl font-semibold text-slate-800">Synfolix Admin</h1>
    </div>
  );
}
```

- [ ] **Step 10: Verify the dev server runs**

Run: `cd admin && npm run dev -- --port 5174`
Expected: Vite prints a local URL; opening it shows "Synfolix Admin" centered on the page. Stop the server after confirming (Ctrl+C).

- [ ] **Step 11: Commit**

```bash
cd /c/Users/anant/synf_web
git add admin/package.json admin/package-lock.json admin/vite.config.js admin/index.html admin/tailwind.config.js admin/postcss.config.js admin/src/main.jsx admin/src/App.jsx admin/src/index.css admin/src/lib/apiClient.js admin/.env.example admin/.gitignore
git commit -m "feat(admin): scaffold Vite React app with Tailwind and API client"
```

---

### Task 13: Admin login page + auth context

**Files:**
- Create: `admin/src/context/AuthContext.jsx`
- Create: `admin/src/pages/Login.jsx`
- Create: `admin/src/components/RequireAuth.jsx`
- Modify: `admin/src/App.jsx`
- Modify: `admin/src/main.jsx`

**Interfaces:**
- Produces: `AuthContext` exposing `{ token, login(email, password), logout() }` via `useAuth()` hook — consumed by `Login.jsx` and by every protected page in later tasks.
- Produces: `RequireAuth` component — wraps protected routes, redirects to `/login` if `token` is `null`.
- No backend-style automated test here (frontend auth flow for phase 1 is verified manually per spec's testing approach); verification step below walks through it against a running backend.

- [ ] **Step 1: Create `admin/src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useState } from "react";
import { apiFetch } from "../lib/apiClient";

const AuthContext = createContext(null);
const TOKEN_KEY = "synfolix_admin_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  async function login(email, password) {
    const { token: newToken } = await apiFetch("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 2: Create `admin/src/components/RequireAuth.jsx`**

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

- [ ] **Step 3: Create `admin/src/pages/Login.jsx`**

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/products");
    } catch (err) {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-80 space-y-4">
        <h1 className="text-xl font-semibold text-slate-800">Synfolix Admin</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm font-medium hover:bg-slate-700"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Wire routing in `admin/src/App.jsx`**

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";

function ProductsPlaceholder() {
  return <div className="p-8">Products page coming in the next task.</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/products"
        element={
          <RequireAuth>
            <ProductsPlaceholder />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
```

- [ ] **Step 5: Wire `AuthProvider` and `BrowserRouter` in `admin/src/main.jsx`**

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 6: Manual verification against a running backend**

Run in one terminal: `cd backend && npm run dev`
Run in another: `cd backend && node src/scripts/createAdmin.js admin@synfolix.test test-password-123`
Run in a third: `cd admin && npm run dev -- --port 5174`

Open the printed URL. Expected: redirected to `/login`. Log in with `admin@synfolix.test` / `test-password-123`. Expected: redirected to `/products`, showing the placeholder text. Refresh the page — expected: still logged in (token persisted in `localStorage`). Stop all three processes after confirming.

- [ ] **Step 7: Commit**

```bash
git add admin/src/context/AuthContext.jsx admin/src/pages/Login.jsx admin/src/components/RequireAuth.jsx admin/src/App.jsx admin/src/main.jsx
git commit -m "feat(admin): add login page and auth context"
```

---

### Task 14: Admin products list + create/edit form

**Files:**
- Create: `admin/src/pages/ProductsList.jsx`
- Create: `admin/src/pages/ProductForm.jsx`
- Modify: `admin/src/App.jsx`

**Interfaces:**
- Consumes: `apiFetch` (Task 12), `useAuth` (Task 13).
- Produces: routes `/products` (list, with a "New Product" link and publish/draft badges) and `/products/new`, `/products/:id/edit` (shared form component) — CRUD against `/api/admin/products`.

- [ ] **Step 1: Create `admin/src/pages/ProductsList.jsx`**

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await apiFetch("/admin/products");
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await apiFetch(`/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
        <Link
          to="/products/new"
          className="bg-slate-800 text-white rounded px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          New Product
        </Link>
      </div>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Industry</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.name}</td>
              <td className="py-2">{p.industry}</td>
              <td className="py-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    p.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td className="py-2 space-x-3">
                <Link to={`/products/${p.id}/edit`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create `admin/src/pages/ProductForm.jsx`**

```jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

const emptyProduct = {
  slug: "",
  name: "",
  industry: "",
  tagline: "",
  description: "",
  keyFeatures: [],
  screenshots: [],
  status: "draft",
};

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [product, setProduct] = useState(emptyProduct);
  const [featuresText, setFeaturesText] = useState("");

  useEffect(() => {
    if (isEditing) {
      apiFetch(`/admin/products`).then((all) => {
        const existing = all.find((p) => String(p.id) === id);
        if (existing) {
          setProduct(existing);
          setFeaturesText((existing.keyFeatures || []).join("\n"));
        }
      });
    }
  }, [id, isEditing]);

  function handleChange(field, value) {
    setProduct((prev) => ({ ...prev, [field]: value }));
  }

  function slugify(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...product,
      keyFeatures: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
    };

    if (isEditing) {
      await apiFetch(`/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch("/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    navigate("/products");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        {isEditing ? "Edit Product" : "New Product"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.name}
            onChange={(e) => {
              const name = e.target.value;
              handleChange("name", name);
              if (!isEditing) handleChange("slug", slugify(name));
            }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
            value={product.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Key Features (one per line)
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={product.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-slate-800 text-white rounded px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}
```

Note: screenshots array editing (image upload/URL management) is intentionally left out of the phase-1 form UI — screenshots can be set later via a follow-up admin enhancement or directly by seeding; the field still round-trips correctly through the API (defaults to `[]`).

- [ ] **Step 3: Wire routes in `admin/src/App.jsx`**

Replace the `ProductsPlaceholder` route setup with:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";
import ProductsList from "./pages/ProductsList";
import ProductForm from "./pages/ProductForm";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/products"
        element={
          <RequireAuth>
            <ProductsList />
          </RequireAuth>
        }
      />
      <Route
        path="/products/new"
        element={
          <RequireAuth>
            <ProductForm />
          </RequireAuth>
        }
      />
      <Route
        path="/products/:id/edit"
        element={
          <RequireAuth>
            <ProductForm />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
```

- [ ] **Step 4: Manual verification**

With `backend` and `admin` dev servers running (per Task 13 Step 6), log in and: create a new product named "HIMS" with industry "healthcare", tagline, description, a couple of key features, status "published" — confirm it appears in the list with a green "published" badge. Edit it, change the tagline, save, confirm the change persisted. Delete a test product, confirm it disappears from the list.

- [ ] **Step 5: Commit**

```bash
git add admin/src/pages/ProductsList.jsx admin/src/pages/ProductForm.jsx admin/src/App.jsx
git commit -m "feat(admin): add products list and create/edit form"
```

---

### Task 15: Admin industries list + create/edit form

**Files:**
- Create: `admin/src/pages/IndustriesList.jsx`
- Create: `admin/src/pages/IndustryForm.jsx`
- Modify: `admin/src/App.jsx`
- Create: `admin/src/components/NavBar.jsx`
- Modify: `admin/src/pages/ProductsList.jsx`

**Interfaces:**
- Same pattern as Task 14, against `/api/admin/industries`.
- Produces: `admin/src/components/NavBar.jsx` — simple top nav with links to Products / Industries / Leads (Leads added in Task 16) and a Logout button, rendered by `RequireAuth`-wrapped pages so navigation is consistent across the CMS.

- [ ] **Step 1: Create `admin/src/components/NavBar.jsx`**

```jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { logout } = useAuth();

  return (
    <nav className="border-b bg-white px-8 py-3 flex justify-between items-center">
      <div className="space-x-6 text-sm font-medium text-slate-700">
        <Link to="/products" className="hover:text-slate-900">
          Products
        </Link>
        <Link to="/industries" className="hover:text-slate-900">
          Industries
        </Link>
        <Link to="/leads" className="hover:text-slate-900">
          Leads
        </Link>
      </div>
      <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">
        Log out
      </button>
    </nav>
  );
}
```

- [ ] **Step 2: Add `<NavBar />` to `admin/src/pages/ProductsList.jsx`**

Wrap the existing return in a fragment with `<NavBar />` above the current `<div className="p-8 ...">`:

```jsx
import NavBar from "../components/NavBar";
// ...
return (
  <>
    <NavBar />
    <div className="p-8 max-w-4xl mx-auto">
      {/* existing content unchanged */}
    </div>
  </>
);
```

- [ ] **Step 3: Create `admin/src/pages/IndustriesList.jsx`**

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";
import NavBar from "../components/NavBar";

export default function IndustriesList() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await apiFetch("/admin/industries");
    setIndustries(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this industry?")) return;
    await apiFetch(`/admin/industries/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <NavBar />
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Industries</h1>
          <Link
            to="/industries/new"
            className="bg-slate-800 text-white rounded px-4 py-2 text-sm font-medium hover:bg-slate-700"
          >
            New Industry
          </Link>
        </div>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Order</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {industries.map((ind) => (
              <tr key={ind.id} className="border-b">
                <td className="py-2">{ind.name}</td>
                <td className="py-2">{ind.displayOrder}</td>
                <td className="py-2 space-x-3">
                  <Link
                    to={`/industries/${ind.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(ind.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Create `admin/src/pages/IndustryForm.jsx`**

```jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";
import NavBar from "../components/NavBar";

const emptyIndustry = { slug: "", name: "", description: "", icon: "", displayOrder: 0 };

export default function IndustryForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [industry, setIndustry] = useState(emptyIndustry);

  useEffect(() => {
    if (isEditing) {
      apiFetch("/admin/industries").then((all) => {
        const existing = all.find((i) => String(i.id) === id);
        if (existing) setIndustry(existing);
      });
    }
  }, [id, isEditing]);

  function handleChange(field, value) {
    setIndustry((prev) => ({ ...prev, [field]: value }));
  }

  function slugify(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...industry, displayOrder: Number(industry.displayOrder) };

    if (isEditing) {
      await apiFetch(`/admin/industries/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/admin/industries", { method: "POST", body: JSON.stringify(payload) });
    }

    navigate("/industries");
  }

  return (
    <>
      <NavBar />
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">
          {isEditing ? "Edit Industry" : "New Industry"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={industry.name}
              onChange={(e) => {
                const name = e.target.value;
                handleChange("name", name);
                if (!isEditing) handleChange("slug", slugify(name));
              }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={industry.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
              value={industry.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Icon (name or URL)
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={industry.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={industry.displayOrder}
              onChange={(e) => handleChange("displayOrder", e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-slate-800 text-white rounded px-4 py-2 text-sm font-medium hover:bg-slate-700"
          >
            Save
          </button>
        </form>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Wire routes in `admin/src/App.jsx`**

Add alongside the existing product routes:

```jsx
import IndustriesList from "./pages/IndustriesList";
import IndustryForm from "./pages/IndustryForm";

// inside <Routes>:
<Route
  path="/industries"
  element={
    <RequireAuth>
      <IndustriesList />
    </RequireAuth>
  }
/>
<Route
  path="/industries/new"
  element={
    <RequireAuth>
      <IndustryForm />
    </RequireAuth>
  }
/>
<Route
  path="/industries/:id/edit"
  element={
    <RequireAuth>
      <IndustryForm />
    </RequireAuth>
  }
/>
```

- [ ] **Step 6: Manual verification**

With both dev servers running, create an industry "Healthcare" (slug auto-fills), confirm it appears in the list, edit its display order, delete a test entry. Confirm the top nav (Products / Industries / Leads / Log out) renders on both list pages.

- [ ] **Step 7: Commit**

```bash
git add admin/src/pages/IndustriesList.jsx admin/src/pages/IndustryForm.jsx admin/src/components/NavBar.jsx admin/src/pages/ProductsList.jsx admin/src/App.jsx
git commit -m "feat(admin): add industries list and create/edit form, shared nav bar"
```

---

### Task 16: Admin leads page + seed the real HIMS product/industries

**Files:**
- Create: `admin/src/pages/Leads.jsx`
- Modify: `admin/src/App.jsx`

**Interfaces:**
- Consumes: `apiFetch` against `/api/admin/leads`.
- Produces: route `/leads` — read-only table of submissions, newest first.

- [ ] **Step 1: Create `admin/src/pages/Leads.jsx`**

```jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";
import NavBar from "../components/NavBar";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/leads").then((data) => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <NavBar />
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Leads</h1>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Company</th>
              <th className="py-2">Email</th>
              <th className="py-2">Industry</th>
              <th className="py-2">Timeline</th>
              <th className="py-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b align-top">
                <td className="py-2">{lead.name}</td>
                <td className="py-2">{lead.company || "—"}</td>
                <td className="py-2">{lead.email}</td>
                <td className="py-2">{lead.industry || "—"}</td>
                <td className="py-2">{lead.timeline || "—"}</td>
                <td className="py-2">{new Date(lead.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <p className="text-slate-500 mt-4">No leads yet.</p>}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Wire the route in `admin/src/App.jsx`**

```jsx
import Leads from "./pages/Leads";

<Route
  path="/leads"
  element={
    <RequireAuth>
      <Leads />
    </RequireAuth>
  }
/>
```

- [ ] **Step 3: Manual verification**

With both servers running, submit a test lead directly against the API to confirm the page renders it:

Run: `curl -X POST http://localhost:4000/api/leads -H "Content-Type: application/json" -d "{\"name\":\"Test Lead\",\"email\":\"test@example.com\",\"message\":\"hi\"}"`

Then open `/leads` in the admin app — expected: the test lead appears in the table.

- [ ] **Step 4: Seed the real HIMS product and initial industries through the CMS UI**

Using the admin UI (not a script — this proves the CMS is the real content authority): create industries "Healthcare" (`healthcare`), "Legal" (`legal`), "Education" (`education`), "CRM" (`crm`), each with a short description and display order 1–4. Create one product: name "HIMS", slug `hims`, industry `healthcare`, tagline "Run every department of your hospital from one system", description drawing on the hms_project structure (role-based portals for doctor/nurse/staff/admin; OPD/IPD, ward and bed management, HR/attendance, pharmacy, audit logs, AI-assisted prescription support), 4–6 key features (one per line, e.g. "OPD & IPD management", "Ward and bed tracking", "Staff scheduling and attendance", "AI-assisted prescriptions", "Role-based access control", "Audit logging"), status "published". Leave screenshots empty for phase 1 (frontend renders a placeholder when the array is empty — handled in Task 20).

- [ ] **Step 5: Commit**

```bash
git add admin/src/pages/Leads.jsx admin/src/App.jsx
git commit -m "feat(admin): add leads page"
```

(No commit needed for the seeded data itself — it lives in the database, not in git.)

---

## Part C — Public Frontend (`frontend/`)

### Task 17: Frontend app scaffold + Nav + Footer

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/lib/apiClient.js`
- Create: `frontend/src/components/NavBar.jsx`
- Create: `frontend/src/components/Footer.jsx`
- Create: `frontend/.env.example`
- Create: `frontend/.env`
- Create: `frontend/.gitignore`

**Interfaces:**
- Produces: `frontend/src/lib/apiClient.js` exports `apiFetch(path, options)` — same shape as the admin one (Task 12) but with no auth-token logic (public site never sends a token).
- Produces: `NavBar` (Home, Products, Solutions, Industries, Our Work, About, Contact links + "Build With Synfolix" CTA button — links to not-yet-built pages point to `#` for phase 1, since those pages don't exist until later phases) and `Footer` (per spec's footer link groups) — both rendered by `App.jsx` around the routed page content.

- [ ] **Step 1: Scaffold with Vite**

Run: `cd /c/Users/anant/synf_web && npm create vite@latest frontend -- --template react`

- [ ] **Step 2: Install Tailwind and React Router**

Run: `cd frontend && npm install && npm install -D tailwindcss postcss autoprefixer && npm install react-router-dom`

- [ ] **Step 3: Initialize Tailwind**

Run: `cd frontend && npx tailwindcss init -p`, then set `content: ["./index.html", "./src/**/*.{js,jsx}"]` in `frontend/tailwind.config.js`.

- [ ] **Step 4: Set up `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Create `frontend/.env.example` and `frontend/.env`**

```
VITE_API_URL=http://localhost:4000/api
```

Run: `cd frontend && cp .env.example .env`

- [ ] **Step 6: Create `frontend/src/lib/apiClient.js`**

```js
const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch (e) {
      // ignore non-JSON error bodies
    }
    const error = new Error(body.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.details = body.details;
    throw error;
  }

  return res.json();
}
```

- [ ] **Step 7: Create `frontend/src/components/NavBar.jsx`**

```jsx
import { Link } from "react-router-dom";

const links = [
  { label: "Home", to: "/" },
  { label: "Products", to: "#products" },
  { label: "Solutions", to: "#" },
  { label: "Industries", to: "#industries" },
  { label: "Our Work", to: "#" },
  { label: "About", to: "#" },
  { label: "Contact", to: "#contact" },
];

export default function NavBar() {
  return (
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
          Synfolix
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {links.map((link) => (
            <a key={link.label} href={link.to} className="hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-slate-700"
        >
          Build With Synfolix
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 8: Create `frontend/src/components/Footer.jsx`**

```jsx
const groups = [
  { title: "Company", items: ["About", "Careers", "Contact"] },
  { title: "Products", items: ["All Products", "Product Categories"] },
  {
    title: "Solutions",
    items: ["Custom Software", "SaaS Development", "Mobile Development", "Web Development", "AI Solutions", "Business Automation"],
  },
  { title: "Industries", items: ["Healthcare", "Legal", "Education"] },
  { title: "Resources", items: ["Case Studies", "Blog", "Insights"] },
  { title: "Legal", items: ["Privacy Policy", "Terms & Conditions", "Cookie Policy"] },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="text-white text-sm font-semibold mb-3">{group.title}</h4>
            <ul className="space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Synfolix Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 9: Set up `frontend/src/App.jsx`**

```jsx
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center text-slate-400">
          Homepage sections coming in the next tasks.
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 10: `frontend/src/main.jsx`** (standard Vite entry, confirm it imports `index.css` and renders `<App />`; Vite's template already does this — no change needed beyond verifying)

- [ ] **Step 11: Verify the dev server runs**

Run: `cd frontend && npm run dev -- --port 5173`
Expected: nav bar, placeholder text, footer all render correctly.

- [ ] **Step 12: Commit**

```bash
cd /c/Users/anant/synf_web
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html frontend/tailwind.config.js frontend/postcss.config.js frontend/src frontend/.env.example frontend/.gitignore
git commit -m "feat(frontend): scaffold Vite React app with Tailwind, nav, and footer"
```

---

### Task 18: Hero + What Is Synfolix sections

**Files:**
- Create: `frontend/src/components/Hero.jsx`
- Create: `frontend/src/components/WhatIsSynfolix.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Pure presentational components, no data fetching — static copy from the spec.

- [ ] **Step 1: Create `frontend/src/components/Hero.jsx`**

```jsx
export default function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
        We build digital products that solve real business problems.
      </h1>
      <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
        From our own software products to custom platforms built for businesses, Synfolix
        designs, develops and scales digital solutions across industries.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <a
          href="#products"
          className="bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-slate-700"
        >
          Explore Our Products
        </a>
        <a
          href="#contact"
          className="border border-slate-300 text-slate-800 text-sm font-medium px-6 py-3 rounded-full hover:border-slate-500"
        >
          Build With Synfolix
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/WhatIsSynfolix.jsx`**

```jsx
export default function WhatIsSynfolix() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <p className="text-center text-lg text-slate-700 max-w-3xl mx-auto mb-12">
        Synfolix is a software and technology company building digital products for modern
        businesses.
      </p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="border border-slate-200 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Our Products</h3>
          <p className="text-slate-600">
            Software products developed and owned by Synfolix — built for real industries,
            sold and supported directly.
          </p>
        </div>
        <div className="border border-slate-200 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Custom Software</h3>
          <p className="text-slate-600">
            Digital products and software developed for third-party businesses, startups,
            and organizations.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into `frontend/src/App.jsx`**

```jsx
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import WhatIsSynfolix from "./components/WhatIsSynfolix";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <WhatIsSynfolix />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Verify visually**

Run: `cd frontend && npm run dev -- --port 5173`, open the page, confirm the hero headline, subtext, two CTA buttons, and the two-column "Our Products / Custom Software" explainer render correctly at both desktop and a narrow (~400px) viewport width.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Hero.jsx frontend/src/components/WhatIsSynfolix.jsx frontend/src/App.jsx
git commit -m "feat(frontend): add hero and What Is Synfolix homepage sections"
```

---

### Task 19: Our Products section (live from API)

**Files:**
- Create: `frontend/src/components/OurProducts.jsx`
- Create: `frontend/src/components/ProductCard.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `apiFetch("/products")` (Task 4's public list endpoint).
- Produces: `ProductCard` — presentational, takes a `product` prop `{ slug, name, industry, tagline, screenshots }`.

- [ ] **Step 1: Create `frontend/src/components/ProductCard.jsx`**

```jsx
export default function ProductCard({ product }) {
  const screenshot = product.screenshots && product.screenshots[0];

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
        {screenshot ? (
          <img src={screenshot.url} alt={screenshot.alt} className="w-full h-full object-cover" />
        ) : (
          "Screenshot coming soon"
        )}
      </div>
      <div className="p-6">
        <span className="text-xs uppercase tracking-wide text-slate-400">{product.industry}</span>
        <h3 className="text-lg font-semibold text-slate-900 mt-1">{product.name}</h3>
        <p className="text-sm text-slate-600 mt-2">{product.tagline}</p>
        <div className="mt-4 flex gap-4 text-sm font-medium">
          <span className="text-slate-800">Learn more</span>
          <span className="text-slate-500">Request Demo</span>
        </div>
      </div>
    </div>
  );
}
```

Note: "Learn more" and "Request Demo" are static labels (not links) in phase 1 since individual product detail pages and the demo-request flow are later-phase work per the spec's explicit out-of-scope list.

- [ ] **Step 2: Create `frontend/src/components/OurProducts.jsx`**

```jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";
import ProductCard from "./ProductCard";

export default function OurProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/products")
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="products" className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Our Products</h2>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
          Software products built and owned by Synfolix, serving real industries today.
        </p>
        {loading && <p className="text-center text-slate-400">Loading products...</p>}
        {!loading && products.length === 0 && (
          <p className="text-center text-slate-400">More products coming soon.</p>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into `frontend/src/App.jsx`**

```jsx
import OurProducts from "./components/OurProducts";
// ...
<Hero />
<WhatIsSynfolix />
<OurProducts />
```

- [ ] **Step 4: Verify against the seeded backend**

With `backend` running and the HIMS product seeded (Task 16, Step 4) as `published`, run `cd frontend && npm run dev -- --port 5173`, open the page, confirm the HIMS card renders with its real name/industry/tagline pulled from the database — not hardcoded. Stop the backend and reload — confirm the "Loading products..." state briefly shows then the section handles the fetch failure gracefully (no unhandled crash; at minimum the loading state should stop rather than hang — if it hangs, add a `.catch` in Step 2's `useEffect` to still call `setLoading(false)` on error, since `.finally` on a fetch chain already covers this).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/OurProducts.jsx frontend/src/components/ProductCard.jsx frontend/src/App.jsx
git commit -m "feat(frontend): add Our Products section pulling live data from the API"
```

---

### Task 20: Build With Synfolix + Industries sections

**Files:**
- Create: `frontend/src/components/BuildWithSynfolix.jsx`
- Create: `frontend/src/components/Industries.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- `Industries` consumes `apiFetch("/industries")` (Task 3's public endpoint).
- `BuildWithSynfolix` is static copy (services list + journey), no data fetching.

- [ ] **Step 1: Create `frontend/src/components/BuildWithSynfolix.jsx`**

```jsx
const journey = ["Idea", "Strategy", "Design", "Development", "Testing", "Launch", "Scale"];

const services = [
  "Custom software", "SaaS platforms", "Web applications", "Mobile applications",
  "CRM systems", "ERP systems", "AI solutions", "Business automation",
  "Dashboards", "APIs", "Integrations", "MVP development",
];

export default function BuildWithSynfolix() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
        Have an idea? We'll build it with you.
      </h2>
      <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
        Synfolix designs, builds, and scales software for businesses, startups, and
        entrepreneurs.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 text-sm font-medium text-slate-700">
        {journey.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span className="bg-slate-100 rounded-full px-4 py-2">{step}</span>
            {i < journey.length - 1 && <span className="text-slate-300">→</span>}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {services.map((service) => (
          <span
            key={service}
            className="border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600"
          >
            {service}
          </span>
        ))}
      </div>
      <div className="text-center">
        <a
          href="#contact"
          className="bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-slate-700"
        >
          Tell Us What You're Building
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/Industries.jsx`**

```jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function Industries() {
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    apiFetch("/industries").then(setIndustries).catch(() => setIndustries([]));
  }, []);

  return (
    <section id="industries" className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Industries</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {industries.map((industry) => (
            <div
              key={industry.slug}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-slate-900">{industry.name}</h3>
              <p className="text-sm text-slate-500 mt-2">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into `frontend/src/App.jsx`**

```jsx
import BuildWithSynfolix from "./components/BuildWithSynfolix";
import Industries from "./components/Industries";
// ...
<Hero />
<WhatIsSynfolix />
<OurProducts />
<BuildWithSynfolix />
<Industries />
```

- [ ] **Step 4: Verify visually**

With the industries seeded in Task 16 Step 4 (Healthcare, Legal, Education, CRM), confirm the Industries section renders four cards in the order set by `displayOrder`, and the Build With Synfolix section shows the journey arrows and service tags correctly on both desktop and narrow viewports.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/BuildWithSynfolix.jsx frontend/src/components/Industries.jsx frontend/src/App.jsx
git commit -m "feat(frontend): add Build With Synfolix and Industries sections"
```

---

### Task 21: Why Synfolix + Process sections

**Files:**
- Create: `frontend/src/components/WhySynfolix.jsx`
- Create: `frontend/src/components/Process.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Both pure presentational, static copy from the spec.

- [ ] **Step 1: Create `frontend/src/components/WhySynfolix.jsx`**

```jsx
const reasons = [
  { title: "Product Thinking", body: "We think beyond simply writing code." },
  { title: "Built Around Your Business", body: "Solutions designed around actual business requirements." },
  { title: "Modern Technology", body: "AI, cloud, automation and scalable architecture." },
  { title: "End-to-End Development", body: "From idea and design through development and launch." },
  { title: "Built to Scale", body: "Products designed for future growth." },
];

export default function WhySynfolix() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Synfolix?</h2>
      <div className="grid md:grid-cols-5 gap-6">
        {reasons.map((reason) => (
          <div key={reason.title} className="text-center">
            <h3 className="font-semibold text-slate-900 mb-2">{reason.title}</h3>
            <p className="text-sm text-slate-500">{reason.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/Process.jsx`**

```jsx
const steps = [
  { n: "01", title: "Discover", body: "Understand the business, users and requirements." },
  { n: "02", title: "Define", body: "Develop the product strategy and roadmap." },
  { n: "03", title: "Design", body: "Create the UX/UI and product experience." },
  { n: "04", title: "Build", body: "Develop and test the product." },
  { n: "05", title: "Launch", body: "Deploy and launch the product." },
  { n: "06", title: "Scale", body: "Improve, maintain and scale the product." },
];

export default function Process() {
  return (
    <section className="bg-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Process</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          {steps.map((step) => (
            <div key={step.n} className="text-center">
              <div className="text-4xl font-bold text-slate-700 mb-2">{step.n}</div>
              <h3 className="text-white font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Note: the spec calls for "a modern visual representation rather than just six text boxes." This phase-1 version (numbered steps on a dark band with a responsive grid) is a deliberately simple starting treatment; richer motion/scroll-based treatment is explicitly deferred to the later animation-polish phase per the spec's out-of-scope list.

- [ ] **Step 3: Wire into `frontend/src/App.jsx`**

```jsx
import WhySynfolix from "./components/WhySynfolix";
import Process from "./components/Process";
// ...
<Industries />
<WhySynfolix />
<Process />
```

- [ ] **Step 4: Verify visually**

Confirm both sections render correctly at desktop and narrow viewport widths (the 5-column Why Synfolix grid and 6-column Process grid should both collapse sensibly on mobile — check they don't overflow horizontally).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/WhySynfolix.jsx frontend/src/components/Process.jsx frontend/src/App.jsx
git commit -m "feat(frontend): add Why Synfolix and Process sections"
```

---

### Task 22: Contact form section (wires to `POST /api/leads`)

**Files:**
- Create: `frontend/src/components/Contact.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `apiFetch("/leads", { method: "POST", body })` (Task 5's public endpoint).
- This is the last homepage section — after this task, `frontend/src/App.jsx` renders the complete phase-1 homepage.

- [ ] **Step 1: Create `frontend/src/components/Contact.jsx`**

```jsx
import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

const emptyForm = {
  name: "", company: "", email: "", phone: "", industry: "",
  projectDescription: "", budget: "", timeline: "", message: "",
};

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      await apiFetch("/leads", { method: "POST", body: JSON.stringify(form) });
      setStatus("success");
      setForm(emptyForm);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <section id="contact" className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Build With Synfolix</h2>
      <p className="text-slate-600 text-center mb-10">
        Tell us what you're building — we'll get back to you.
      </p>

      {status === "success" ? (
        <p className="text-center text-green-700 bg-green-50 border border-green-200 rounded-xl py-6">
          Thanks — we've received your message and will be in touch soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Company"
            value={form.company}
            onChange={(e) => handleChange("company", e.target.value)}
          />
          <input
            type="email"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Industry"
            value={form.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Timeline"
            value={form.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm md:col-span-2"
            placeholder="Estimated budget (optional)"
            value={form.budget}
            onChange={(e) => handleChange("budget", e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2 text-sm md:col-span-2"
            placeholder="What do you want to build?"
            rows={3}
            value={form.projectDescription}
            onChange={(e) => handleChange("projectDescription", e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2 text-sm md:col-span-2"
            placeholder="Message"
            rows={3}
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
          />

          {status === "error" && (
            <p className="md:col-span-2 text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="md:col-span-2 bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-slate-700 disabled:opacity-50"
          >
            {status === "submitting" ? "Sending..." : "Build With Synfolix"}
          </button>
        </form>
      )}

      <div className="mt-10 text-center text-sm text-slate-500 space-x-4">
        <span>hello@synfolix.com</span>
        <span>·</span>
        <span>+91 00000 00000</span>
      </div>
    </section>
  );
}
```

Note: contact email/phone are placeholders — replace with the real values the user provides before launch; not blocking for phase 1 since the form submission (the functional part) is fully wired.

- [ ] **Step 2: Wire into `frontend/src/App.jsx`** (final assembly of the phase-1 homepage)

```jsx
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import WhatIsSynfolix from "./components/WhatIsSynfolix";
import OurProducts from "./components/OurProducts";
import BuildWithSynfolix from "./components/BuildWithSynfolix";
import Industries from "./components/Industries";
import WhySynfolix from "./components/WhySynfolix";
import Process from "./components/Process";
import Contact from "./components/Contact";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <WhatIsSynfolix />
        <OurProducts />
        <BuildWithSynfolix />
        <Industries />
        <WhySynfolix />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: End-to-end verification**

With `backend` running (seeded per Task 16) and `frontend` running, load the homepage top to bottom and confirm every section renders. Submit the contact form with valid data — confirm the success message appears. Then open the admin app's `/leads` page — confirm the new submission appears there. Submit the form again with an empty email — confirm client-side `required` validation blocks it (browser-native); to also confirm server-side validation, submit via `curl` with a missing name field and confirm a `400` comes back (already covered by Task 5's automated tests, but worth re-confirming end-to-end).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Contact.jsx frontend/src/App.jsx
git commit -m "feat(frontend): add contact section wired to POST /api/leads, complete phase 1 homepage"
```

---

## Final Verification

- [ ] **Run the full backend test suite one more time**

Run: `cd backend && npx vitest run`
Expected: every test across `health`, `industries`, `products`, `leads`, `admin.auth`, `requireAuth`, `admin.products`, `admin.industries`, `admin.leads`, `security` passes.

- [ ] **Confirm no `.env` files are tracked by git**

Run: `cd /c/Users/anant/synf_web && git status --ignored | grep -i "\.env$"`
Expected: any `.env` files listed appear only under "Ignored files", never under tracked/staged changes. This is the hard check for the user's strict no-`.env` rule.

- [ ] **Full manual walkthrough**

With all three apps running (`backend` on 4000, `admin` on 5174, `frontend` on 5173): load the public homepage, confirm the HIMS product card and four industry cards render from the database; submit the contact form; confirm the lead shows up in the admin Leads page; create a second draft product in the admin CMS and confirm it does *not* appear on the public homepage (draft/published filtering working end to end); publish it and refresh the homepage — confirm it now appears, with zero code changes required. This last check is the proof of the spec's core requirement: adding a product never requires a redeploy.
