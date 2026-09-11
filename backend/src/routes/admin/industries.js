const express = require("express");
const prisma = require("../../lib/prisma");
const requireAuth = require("../../middleware/requireAuth");
const { industrySchema, industryUpdateSchema } = require("../../validators/industryValidator");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const industries = await prisma.industry.findMany({ orderBy: { displayOrder: "asc" } });
    res.json(industries);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const parsed = industrySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const industry = await prisma.industry.create({ data: parsed.data });
    res.status(201).json(industry);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with that slug already exists" });
    }
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  const parsed = industryUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const industry = await prisma.industry.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(industry);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Industry not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with that slug already exists" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.industry.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Industry not found" });
    }
    next(err);
  }
});

module.exports = router;
