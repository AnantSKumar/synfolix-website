const express = require("express");
const prisma = require("../lib/prisma");
const { leadSchema } = require("../validators/leadValidator");
const { leadLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/", leadLimiter, async (req, res, next) => {
  const parsed = leadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  try {
    const lead = await prisma.lead.create({ data: parsed.data });
    res.status(201).json({ id: lead.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
