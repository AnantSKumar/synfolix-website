const { z } = require("zod");

const productSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  industry: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  keyFeatures: z.array(z.string()).default([]),
  screenshots: z
    .array(z.object({ url: z.string().min(1), alt: z.string().min(1) }))
    .default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});

const productUpdateSchema = productSchema.partial();

module.exports = { productSchema, productUpdateSchema };
