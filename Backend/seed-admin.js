const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@farmconnect.com";

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    console.log("Admin user already exists:");
    console.log(`  Email: ${existing.email}`);
    console.log(`  Role: ${existing.role}`);
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      phone: "9999999999",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created successfully!");
  console.log(`  Email: ${admin.email}`);
  console.log(`  Password: Admin@123`);
  console.log(`  Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
