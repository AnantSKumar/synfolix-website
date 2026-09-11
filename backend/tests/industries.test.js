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
