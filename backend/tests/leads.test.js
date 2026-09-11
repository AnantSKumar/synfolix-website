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

  it("rate-limits after 10 submissions in the window", async () => {
    const validLead = {
      name: "Jane Founder",
      company: "Acme Startup",
      email: "jane@acme.test",
      phone: "555-0100",
      industry: "startups",
      projectDescription: "An MVP for scheduling",
      timeline: "3 months",
      message: "Let's talk",
    };

    let lastRes;
    for (let i = 0; i < 11; i++) {
      lastRes = await request(app).post("/api/leads").send(validLead);
    }

    expect(lastRes.status).toBe(429);
  });
});
