import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import { resetDb } from "./testUtils.js";

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
