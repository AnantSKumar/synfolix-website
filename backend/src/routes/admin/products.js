const express = require("express");
const prisma = require("../../lib/prisma");
const requireAuth = require("../../middleware/requireAuth");
const { productSchema, productUpdateSchema } = require("../../validators/productValidator");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with that slug already exists" });
    }
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  const parsed = productUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(product);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with that slug already exists" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    next(err);
  }
});

module.exports = router;
