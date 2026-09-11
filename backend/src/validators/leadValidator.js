const { z } = require("zod");

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional(),
  industry: z.string().optional(),
  projectDescription: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().optional(),
});

module.exports = { leadSchema };
