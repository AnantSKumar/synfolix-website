const path = require("path");
const dotenv = require("dotenv");

// Load the dev .env first (existing behavior — JWT_SECRET etc. still come
// from here), then load .env.test ON TOP with override:true so its
// DATABASE_URL wins. This is a hard safety boundary: resetDb() below
// deletes every row in every table on every test run, so tests must never
// run against the same database the dev servers use.
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env.test"), override: true });

const devDbName = (process.env.DATABASE_URL || "").split("/").pop()?.split("?")[0];
if (!devDbName || !devDbName.includes("test")) {
  throw new Error(
    "\n\nRefusing to run tests: DATABASE_URL does not look like a test database " +
      `(resolved to "${devDbName || "(empty)"}").\n` +
      "Tests call resetDb() before every test, which deletes every row in every " +
      "table — running this against your dev database destroys real data.\n\n" +
      "Create backend/.env.test with its own DATABASE_URL pointing at a separate " +
      "database whose name contains \"test\" (e.g. postgresql://USER:PASS@localhost:5432/synf_web_test), " +
      "then run `npx prisma migrate deploy` once against it to set up its schema. " +
      "See README.md for details.\n"
  );
}

const prisma = require("../src/lib/prisma");

async function resetDb() {
  await prisma.lead.deleteMany();
  await prisma.product.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.adminUser.deleteMany();
}

module.exports = { resetDb };
