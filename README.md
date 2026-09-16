# Synfolix Website

A monorepo with three apps:

| App | Path | What it is |
|---|---|---|
| Backend API | `backend/` | Express + Prisma + PostgreSQL. Public read endpoints, the lead-capture form endpoint, and the authenticated admin CRUD API. |
| Admin CMS | `admin/` | React + Vite. Login-gated app for managing products, industries, and viewing leads. |
| Public site | `frontend/` | React + Vite. The public marketing homepage — pulls products/industries live from the backend. |

All three need to run at the same time for the site to work end to end.

## Prerequisites

- **Node.js** 18 or newer (with npm)
- **PostgreSQL** running locally (or reachable via a connection string), with a database created for this project — the app will not create the database itself

## 1. Install dependencies

From the repo root, install each app's dependencies separately:

```powershell
cd backend; npm install
cd ../admin; npm install
cd ../frontend; npm install
```

## 2. Create the `.env` files

Each app needs its own `.env` file in its own folder. These are **not** committed to git (see `.gitignore`), so you create them yourself. No template file ships in the repo either — copy the exact contents below.

### `backend/.env`

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/synfolix?schema=public"
JWT_SECRET="replace-with-a-long-random-string"
PORT=4000
FRONTEND_ORIGIN="http://localhost:5173"
ADMIN_ORIGIN="http://localhost:5174"
```

- Replace `USER:PASSWORD` and the database name with your actual local PostgreSQL credentials and the database you created.
- `JWT_SECRET` can be any long random string — used to sign admin login tokens.
- `FRONTEND_ORIGIN`/`ADMIN_ORIGIN` must exactly match the URLs your `frontend`/`admin` dev servers actually run on (including port), since the backend uses these for CORS. If you run the dev servers on different ports than the defaults below, update these to match.

### `admin/.env`

```
VITE_API_URL=http://localhost:4000/api
```

### `frontend/.env`

```
VITE_API_URL=http://localhost:4000/api
```

**On Windows, create these with PowerShell's `WriteAllText`, not `>`, `Out-File`, or `Set-Content`.** Those commonly write a UTF-8 byte-order-mark (BOM) at the start of the file, which silently breaks how Vite parses the first environment variable in the file (see Troubleshooting below). Example for `admin/.env`:

```powershell
[System.IO.File]::WriteAllText("C:\path\to\synf_web\admin\.env", "VITE_API_URL=http://localhost:4000/api`n")
```

Do the same for `frontend/.env` and `backend/.env` (adjust content and path).

## 3. Set up a separate test database (do this before ever running the test suite)

The backend's tests call `resetDb()` before every single test, which **deletes every row in every table.** They intentionally use a completely separate database from the one your dev servers point at — `backend/tests/testUtils.js` refuses to run at all if `DATABASE_URL` doesn't resolve to a database whose name contains `"test"`, specifically so `npm test` can never silently wipe real dev/admin data (this happened once during development of this project).

Create `backend/.env.test` (same rules as the other `.env` files — not committed, create it yourself, use `WriteAllText` on Windows to avoid a BOM):

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/synf_web_test?schema=public"
```

Use the same `USER:PASSWORD` as your main `backend/.env`, just a different database name (must contain `test`). You don't need to create this database manually first — running the migration below creates it automatically:

```powershell
cd backend
npx prisma migrate deploy --schema prisma/schema.prisma
```

(If that fails because the database doesn't exist yet and your Postgres user can't auto-create it, create it once yourself — e.g. via pgAdmin, or `createdb synf_web_test` if you have the Postgres `bin` folder on your PATH — then re-run the command above.)

## 4. Set up the main database

From `backend/`:

```powershell
npx prisma migrate dev
```

This creates all tables in the database your `DATABASE_URL` points to.

## 5. Create an admin account

From `backend/`:

```powershell
node src/scripts/createAdmin.js you@example.com your-password
```

This is also how you reset a forgotten password later — re-running it with the same email overwrites that account's password.

### If the database ever comes up completely empty

If you ever find every table empty (no admin account, no products, no industries — most commonly after accidentally running `npx prisma migrate reset`, which wipes all data but keeps the schema), there's a one-command recovery instead of rebuilding everything by hand:

```powershell
node src/scripts/seedDev.js
```

This creates a working admin account (`admin@synfolix.test` / `dev-password-123` by default — pass your own email/password as two arguments to use different ones) plus the four standard industries and the published HIMS product. It's safe to run any time, including against a database that already has this data — every write is an upsert, so it won't create duplicates.

## 6. Run all three apps

Each needs its own terminal, left running:

```powershell
# Terminal 1 — backend, port 4000
cd backend
npm run dev

# Terminal 2 — admin CMS, port 5174
cd admin
npm run dev

# Terminal 3 — public site, port 5173
cd frontend
npm run dev
```

Then open:
- **Public site:** http://localhost:5173
- **Admin CMS:** http://localhost:5174 (log in with the account from step 5)

## 7. Add content

The public site shows nothing interesting until there's data behind it:

1. Log into the admin CMS.
2. Go to **Industries** → **New industry** — create a few (e.g. Healthcare, Legal, Education). Industries appear on the public site immediately, no publish step.
3. Go to **Products** → **New product** — fill in the fields, and set status to **Published** (not Draft) if you want it visible on the public site. Draft products only show in the admin list, never publicly.
4. Refresh the public site — the new content should appear in the Industries and Our Products sections.

## Troubleshooting

### `POST http://localhost:5174/undefined/admin/login 404` (or similar `undefined/...` URL, or a console error like `Unexpected token '<' ... not valid JSON`)

This means `VITE_API_URL` isn't actually being read by the app — the fetch call is falling back to a relative path against the dev server's own origin instead of the backend, which then returns its own HTML page instead of JSON. Two usual causes, in order of likelihood:

1. **The `.env` file has a UTF-8 BOM.** This is the most common cause on Windows. A BOM at the very start of the file gets treated as part of the first key's name, so `VITE_API_URL` silently becomes a different, non-matching key. Recreate the file with `[System.IO.File]::WriteAllText(...)` as shown in step 2 above — that method never adds a BOM.
2. **The dev server was started before the `.env` file existed (or before it was last edited).** Vite only reads `.env` files at startup, not on every request, and editing the file won't hot-reload it. Fully stop the dev server (Ctrl+C — confirm the prompt actually returns) and run `npm run dev` again. A browser refresh alone does not fix this.

After fixing either cause, also hard-refresh the browser (Ctrl+Shift+R) to make sure you're not looking at a cached page.

### The hero's cloud animation goes blank and never comes back

This is a WebGL context loss (a GPU/driver-level event — check the browser console for `CONTEXT_LOST_WEBGL` to confirm). It can happen after a long dev session with many hot-reloads. The component recovers from this automatically now; if you're seeing it stay blank, do one hard refresh to clear whatever state triggered it.

### Login says "invalid credentials" but you're sure the password is right

This is very likely not a password problem at all — the backend deliberately returns the exact same generic error for "wrong password" and "no account with that email," so a database with no admin account in it looks identical to a typo. Check first: run `node src/scripts/seedDev.js` from `backend/` (see step 5 above) and try logging in with `admin@synfolix.test` / `dev-password-123`. If that works, your previous admin account was gone, not your memory of the password.

### Tests fail immediately with "Refusing to run tests: DATABASE_URL does not look like a test database"

This is the intended safety check, not a bug — see step 3 above. You haven't created `backend/.env.test` yet (or it exists but its `DATABASE_URL` doesn't point at a database whose name contains `test`). Fix that and the tests will run normally.

### A product I created isn't showing on the public site

Check its status in the admin Products list — it must be **Published**, not **Draft**. Industries don't have this gate and always show once created.

### `npm run dev` fails or the site looks visually broken after a fresh install

Make sure you ran `npm install` inside **each** of the three app folders separately (`backend/`, `admin/`, `frontend/`) — there is no single root-level install.
