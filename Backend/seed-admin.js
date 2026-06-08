require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@farmconnect.com";
  const phone = process.env.ADMIN_PHONE || "9999999999";
  const plainPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    console.log("Admin user already exists:");
    console.log(`  Email: ${existing.email}`);
    console.log(`  Role: ${existing.role}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      phone,
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created successfully!");
  console.log(`  Email: ${admin.email}`);
  console.log(`  Password: ${plainPassword}`);
  console.log(`  Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
