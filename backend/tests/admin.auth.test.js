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
