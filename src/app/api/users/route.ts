import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/users - list users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleName = searchParams.get("role");

    // Optional filter by role name using Role relation
    let where: Record<string, unknown> | undefined = undefined;
    if (roleName) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        return NextResponse.json(
          { error: `Role ${roleName} not found` },
          { status: 400 }
        );
      }
      where = { roleId: role.id };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        phoneNumbers: true,
        memberships: {
          include: {
            membership: true,
          },
          orderBy: { startDate: "desc" },
        },
        checkIns: {
          orderBy: { checkInTime: "desc" },
          take: 5,
        },
        employee: {
          include: {
            trainer: true,
            receptionist: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json(usersWithoutPasswords);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch users", details: message },
      { status: 500 }
    );
  }
}
