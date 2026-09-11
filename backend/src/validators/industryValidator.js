const { z } = require("zod");

const industrySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  displayOrder: z.number().int().default(0),
});

const industryUpdateSchema = industrySchema.partial();

module.exports = { industrySchema, industryUpdateSchema };
