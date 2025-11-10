import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/users - list users with filtering and sorting
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleName = searchParams.get("role");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Filter by role
    if (roleName && roleName !== "all") {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        return NextResponse.json(
          { error: `Role ${roleName} not found` },
          { status: 400 }
        );
      }
      where.roleId = role.id;
    }

    // Filter by search query (firstName, lastName, email)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      // If we already have roleId filter, combine with AND
      if (where.roleId) {
        where.AND = [
          { roleId: where.roleId },
          {
            OR: [
              { firstName: { contains: searchTerm } },
              { lastName: { contains: searchTerm } },
              { email: { contains: searchTerm } },
            ],
          },
        ];
        delete where.roleId;
      } else {
        where.OR = [
          { firstName: { contains: searchTerm } },
          { lastName: { contains: searchTerm } },
          { email: { contains: searchTerm } },
        ];
      }
    }

    // Build orderBy clause
    const orderBy: Record<string, string> = {};
    const validSortFields = [
      "id",
      "firstName",
      "lastName",
      "email",
      "roleId",
      "createdAt",
    ];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.id = "desc";
    }

    const users = await prisma.user.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
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
      orderBy,
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
