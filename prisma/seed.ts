import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding roles...");

  const roles = ["USER", "MEMBER", "RECEPTIONIST", "TRAINER", "ADMIN"];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    console.log(`✓ Created role: ${roleName}`);
  }

  console.log("\nSeeding admin user...");

  // Get ADMIN role
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) {
    throw new Error("ADMIN role not found");
  }

  // Create admin user
  const adminEmail = "admin@example.com";
  const adminPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      firstName: "Admin",
      lastName: "Użytkownik",
      roleId: adminRole.id,
    },
  });

  console.log(`✓ Created admin user: ${adminUser.email}`);
  console.log(`  Password: admin123`);
  console.log(`  Role: ADMIN`);

  console.log("\nSeeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
