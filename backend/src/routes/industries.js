const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const industries = await prisma.industry.findMany({
      orderBy: { displayOrder: "asc" },
    });
    res.json(industries);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
