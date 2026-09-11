const express = require("express");
const rateLimit = require("express-rate-limit");
const prisma = require("../lib/prisma");
const { leadSchema } = require("../validators/leadValidator");

const router = express.Router();

const leadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions, please try again later." },
});

router.post("/", leadRateLimiter, async (req, res, next) => {
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
