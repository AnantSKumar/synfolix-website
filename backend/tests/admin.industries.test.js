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
