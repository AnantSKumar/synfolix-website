const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { resetDb } = require("./testUtils");

// NOTE: signs a token for a fabricated admin id; requireAuth does not verify the admin still exists in the DB (see spec's deferred auth-hardening item)
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
