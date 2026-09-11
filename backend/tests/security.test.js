import "./testUtils.js"; // Load dotenv before app
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Security headers and CORS", () => {
  it("sets standard security headers via helmet", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("allows the configured frontend origin", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", process.env.FRONTEND_ORIGIN || "http://localhost:5173");
    expect(res.headers["access-control-allow-origin"]).toBe(
      process.env.FRONTEND_ORIGIN || "http://localhost:5173"
    );
  });

  it("rejects a random, unconfigured origin", async () => {
    const res = await request(app).get("/api/health").set("Origin", "http://evil.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
