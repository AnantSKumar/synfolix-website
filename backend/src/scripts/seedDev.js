// One-command local-dev recovery: recreates a baseline admin account plus
// the standard industries and the HIMS product. Safe to re-run any time —
// every write is an upsert keyed on a unique field (email/slug), so running
// this against a database that already has this data just leaves it as-is.
//
// Usage: node src/scripts/seedDev.js [adminEmail] [adminPassword]
// Defaults: admin@synfolix.test / dev-password-123
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

const industries = [
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Healthcare systems and solutions for hospitals and clinics",
    icon: "heart",
    displayOrder: 1,
  },
  {
    slug: "legal",
    name: "Legal",
    description: "Legal practice management and case management solutions",
    icon: "scales",
    displayOrder: 2,
  },
  {
    slug: "education",
    name: "Education",
    description: "Educational institution and learning management systems",
    icon: "book",
    displayOrder: 3,
  },
  {
    slug: "crm",
    name: "CRM",
    description: "Customer relationship management and sales automation platforms",
    icon: "users",
    displayOrder: 4,
  },
];

const himsProduct = {
  slug: "hims",
  name: "HIMS",
  industry: "healthcare",
  tagline: "Run every department of your hospital from one system",
  description:
    "A comprehensive hospital management system with role-based portals for doctors, nurses, staff, and administrators. Features include OPD/IPD management, ward and bed management, HR and attendance tracking, pharmacy management, audit logging, and AI-assisted prescription support.",
  keyFeatures: [
    "OPD & IPD management",
    "Ward and bed tracking",
    "Staff scheduling and attendance",
    "AI-assisted prescriptions",
    "Role-based access control",
    "Audit logging",
  ],
  screenshots: [],
  status: "published",
};

async function main() {
  const [, , emailArg, passwordArg] = process.argv;
  const email = emailArg || "admin@synfolix.test";
  const password = passwordArg || "dev-password-123";

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`Admin ready: ${email} / ${password}`);

  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: industry,
      create: industry,
    });
  }
  console.log(`Industries ready: ${industries.map((i) => i.slug).join(", ")}`);

  await prisma.product.upsert({
    where: { slug: himsProduct.slug },
    update: himsProduct,
    create: himsProduct,
  });
  console.log(`Product ready: ${himsProduct.slug} (published)`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
