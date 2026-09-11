require("dotenv").config();
const prisma = require("../src/lib/prisma");

async function resetDb() {
  await prisma.lead.deleteMany();
  await prisma.product.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.adminUser.deleteMany();
}

module.exports = { resetDb };
