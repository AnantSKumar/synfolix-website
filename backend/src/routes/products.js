const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "published" },
      select: {
        id: true,
        slug: true,
        name: true,
        industry: true,
        tagline: true,
        screenshots: true,
      },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });

    if (!product || product.status !== "published") {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
