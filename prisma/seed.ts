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

  console.log("\nSeeding membership plans...");

  const plans: Array<{
    name: string;
    durationMonths: number;
    price: number;
    description: string;
  }> = [
    {
      name: "Classic",
      durationMonths: 1,
      price: 109,
      description:
        "Dostęp do siłowni, szatnia i prysznice, konsultacja trenera",
    },
    {
      name: "GymBasic",
      durationMonths: 3,
      price: 349,
      description:
        "Dostęp do siłowni, szatnia i prysznice, konsultacja trenera, rabat 17%",
    },
    {
      name: "GymPro",
      durationMonths: 12,
      price: 1399,
      description:
        "Wszystko z Classic + zajęcia grupowe, sauna i strefa relaksu, plan treningowy",
    },
    {
      name: "Premium",
      durationMonths: 12,
      price: 1499,
      description:
        "Wszystko z Classic + zajęcia grupowe, sauna i strefa relaksu, plan treningowy, rabat 27%",
    },
    {
      name: "Student",
      durationMonths: 1,
      price: 79,
      description: "Dostęp do siłowni, szatnia i prysznice, wymaga legitymacji",
    },
  ];

  for (const plan of plans) {
    const exists = await prisma.membership.findFirst({
      where: {
        name: plan.name,
        durationMonths: plan.durationMonths,
      },
    });
    if (!exists) {
      await prisma.membership.create({ data: plan });
      console.log(
        `✓ Created plan: ${plan.name} (${plan.durationMonths}m) - ${plan.price}`
      );
    } else {
      console.log(`• Plan exists: ${plan.name} (${plan.durationMonths}m)`);
    }
  }

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
