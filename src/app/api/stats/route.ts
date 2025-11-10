import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/stats - various statistics using GROUP BY, HAVING, LEFT JOIN
export async function GET() {
  try {
    // 1. GROUP BY + COUNT - Users grouped by role
    const usersByRole = await prisma.user.groupBy({
      by: ["roleId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Get role names
    const roles = await prisma.role.findMany();
    const roleMap = new Map(roles.map((r) => [r.id, r.name]));

    const usersByRoleWithNames = usersByRole.map((item) => ({
      roleId: item.roleId,
      roleName: roleMap.get(item.roleId) || "Unknown",
      count: item._count.id,
    }));

    // 2. GROUP BY + HAVING - Users with more than 5 check-ins
    const usersWithManyCheckIns = await prisma.checkIn.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 5,
          },
        },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Get user details
    const userIds = usersWithManyCheckIns.map((item) => item.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const usersWithManyCheckInsDetails = usersWithManyCheckIns.map((item) => ({
      userId: item.userId,
      user: userMap.get(item.userId),
      checkInCount: item._count.id,
    }));

    // 3. LEFT JOIN - Users without any check-ins
    const usersWithoutCheckIns = await prisma.user.findMany({
      where: {
        checkIns: {
          none: {},
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const usersWithoutCheckInsFormatted = usersWithoutCheckIns.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: user.role.name,
    }));

    // 4. CORRELATED SUBQUERY - Equipment with their latest maintenance date
    // SQL: SELECT * FROM Equipment e WHERE EXISTS
    //      (SELECT 1 FROM Maintenance m WHERE m.equipmentId = e.id
    //       AND m.date = (SELECT MAX(date) FROM Maintenance m2 WHERE m2.equipmentId = e.id))
    const equipmentWithLatestMaintenance = await prisma.equipment.findMany({
      where: {
        maintenance: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        condition: true,
        maintenance: {
          orderBy: {
            date: "desc",
          },
          take: 1,
          select: {
            id: true,
            date: true,
            cost: true,
            description: true,
          },
        },
      },
      take: 15,
    });

    const equipmentWithLatestMaintenanceFormatted =
      equipmentWithLatestMaintenance.map((equipment) => ({
        id: equipment.id,
        name: equipment.name,
        category: equipment.category,
        condition: equipment.condition,
        latestMaintenance: equipment.maintenance[0] || null,
      }));

    // 5. UNCORRELATED SUBQUERY - Users with memberships more expensive than average
    // SQL: SELECT * FROM UserMembership um
    //      JOIN User u ON u.id = um.userId
    //      JOIN Membership m ON m.id = um.membershipId
    //      WHERE m.price > (SELECT AVG(price) FROM Membership)

    // First, calculate average membership price (uncorrelated subquery)
    const avgMembershipPrice = await prisma.membership.aggregate({
      _avg: {
        price: true,
      },
    });

    const averagePrice = avgMembershipPrice._avg.price || 0;

    // Then get users with memberships above average
    const usersWithExpensiveMemberships = await prisma.userMembership.findMany({
      where: {
        membership: {
          price: {
            gt: averagePrice,
          },
        },
        active: true,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        membership: {
          select: {
            id: true,
            name: true,
            price: true,
            durationMonths: true,
          },
        },
        startDate: true,
        endDate: true,
      },
      orderBy: {
        membership: {
          price: "desc",
        },
      },
      take: 20,
    });

    const usersWithExpensiveMembershipsFormatted =
      usersWithExpensiveMemberships.map((um) => ({
        id: um.id,
        user: um.user,
        membership: um.membership,
        startDate: um.startDate,
        endDate: um.endDate,
        averagePrice,
      }));

    // 6. IN with SUBQUERY - Users with specific roles (TRAINER, ADMIN, RECEPTIONIST)
    // SQL: SELECT * FROM User WHERE roleId IN
    //      (SELECT id FROM Role WHERE name IN ('TRAINER', 'ADMIN', 'RECEPTIONIST'))

    // First, get role IDs (subquery)
    const staffRoles = await prisma.role.findMany({
      where: {
        name: {
          in: ["TRAINER", "ADMIN", "RECEPTIONIST"],
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const staffRoleIds = staffRoles.map((role) => role.id);

    // Then, get users with those role IDs (using IN)
    const staffUsers = await prisma.user.findMany({
      where: {
        roleId: {
          in: staffRoleIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roleId: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            hireDate: true,
            salary: true,
            trainer: {
              select: {
                specialization: true,
                experienceYears: true,
              },
            },
            receptionist: {
              select: {
                shiftHours: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const staffRoleMap = new Map(staffRoles.map((r) => [r.id, r.name]));

    const staffUsersFormatted = staffUsers.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: staffRoleMap.get(user.roleId) || "Unknown",
      employee: user.employee,
      createdAt: user.createdAt,
    }));

    // 7. EXISTS - Users with active memberships
    // SQL: SELECT * FROM User u WHERE EXISTS
    //      (SELECT 1 FROM UserMembership um WHERE um.userId = u.id AND um.active = true)
    const usersWithActiveMemberships = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            active: true,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: {
        firstName: "asc",
      },
      take: 20,
    });

    const usersWithActiveMembershipsFormatted = usersWithActiveMemberships.map(
      (user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
    );

    // 8. ANY - Equipment more expensive than ANY membership
    // SQL: SELECT * FROM Equipment WHERE purchasePrice > ANY (SELECT price FROM Membership)
    const membershipPrices = await prisma.membership.findMany({
      select: {
        price: true,
      },
    });

    const prices = membershipPrices.map((m) => m.price);
    const minMembershipPrice = prices.length > 0 ? Math.min(...prices) : 0;

    const equipmentGreaterThanAny = await prisma.equipment.findMany({
      where: {
        purchasePrice: {
          gt: minMembershipPrice,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        purchasePrice: true,
        condition: true,
      },
      orderBy: {
        purchasePrice: "desc",
      },
      take: 10,
    });

    const equipmentGreaterThanAnyFormatted = equipmentGreaterThanAny.map(
      (e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        purchasePrice: e.purchasePrice,
        condition: e.condition,
        minMembershipPrice: minMembershipPrice,
      })
    );

    // 9. ALL - Equipment more expensive than ALL memberships
    // SQL: SELECT * FROM Equipment WHERE purchasePrice > ALL (SELECT price FROM Membership)
    const maxMembershipPrice = prices.length > 0 ? Math.max(...prices) : 0;

    const equipmentGreaterThanAll = await prisma.equipment.findMany({
      where: {
        purchasePrice: {
          gt: maxMembershipPrice,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        purchasePrice: true,
        condition: true,
      },
      orderBy: {
        purchasePrice: "desc",
      },
      take: 10,
    });

    const equipmentGreaterThanAllFormatted = equipmentGreaterThanAll.map(
      (e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        purchasePrice: e.purchasePrice,
        condition: e.condition,
        maxMembershipPrice: maxMembershipPrice,
      })
    );

    return NextResponse.json({
      usersByRole: usersByRoleWithNames,
      usersWithManyCheckIns: usersWithManyCheckInsDetails,
      usersWithoutCheckIns: usersWithoutCheckInsFormatted,
      equipmentWithLatestMaintenance: equipmentWithLatestMaintenanceFormatted,
      usersWithExpensiveMemberships: usersWithExpensiveMembershipsFormatted,
      staffUsers: staffUsersFormatted,
      usersWithActiveMemberships: usersWithActiveMembershipsFormatted,
      equipmentGreaterThanAny: equipmentGreaterThanAnyFormatted,
      equipmentGreaterThanAll: equipmentGreaterThanAllFormatted,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: message },
      { status: 500 }
    );
  }
}
