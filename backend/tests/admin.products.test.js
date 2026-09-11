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
