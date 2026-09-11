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
