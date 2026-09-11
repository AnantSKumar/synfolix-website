const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error("Usage: node src/scripts/createAdmin.js <email> <password>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Admin user ready: ${admin.email}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
