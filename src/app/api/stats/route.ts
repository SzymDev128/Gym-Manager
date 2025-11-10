import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/stats - various statistics using GROUP BY, HAVING, etc.
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

    // 3. GROUP BY - Equipment by category
    const equipmentByCategory = await prisma.equipment.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // 4. GROUP BY - Equipment by condition
    const equipmentByCondition = await prisma.equipment.groupBy({
      by: ["condition"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // 5. GROUP BY + SUM - Total maintenance cost per equipment
    const maintenanceCostByEquipment = await prisma.maintenance.groupBy({
      by: ["equipmentId"],
      _sum: {
        cost: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          cost: "desc",
        },
      },
      take: 10,
    });

    // Get equipment details
    const equipmentIds = maintenanceCostByEquipment.map(
      (item) => item.equipmentId
    );
    const equipmentList = await prisma.equipment.findMany({
      where: { id: { in: equipmentIds } },
      select: {
        id: true,
        name: true,
        category: true,
        condition: true,
      },
    });
    const equipmentMap = new Map(equipmentList.map((e) => [e.id, e]));

    const maintenanceCostByEquipmentDetails = maintenanceCostByEquipment.map(
      (item) => ({
        equipmentId: item.equipmentId,
        equipment: equipmentMap.get(item.equipmentId),
        totalCost: item._sum.cost,
        maintenanceCount: item._count.id,
      })
    );

    // 6. GROUP BY + AVG - Average membership duration by membership type
    const membershipStats = await prisma.membership.findMany({
      include: {
        userMemberships: true,
      },
    });

    const membershipStatsFormatted = membershipStats.map((membership) => ({
      id: membership.id,
      name: membership.name,
      price: membership.price,
      durationMonths: membership.durationMonths,
      totalUsers: membership.userMemberships.length,
      activeUsers: membership.userMemberships.filter((um) => um.active).length,
    }));

    return NextResponse.json({
      usersByRole: usersByRoleWithNames,
      usersWithManyCheckIns: usersWithManyCheckInsDetails,
      equipmentByCategory,
      equipmentByCondition,
      maintenanceCostByEquipment: maintenanceCostByEquipmentDetails,
      membershipStats: membershipStatsFormatted,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: message },
      { status: 500 }
    );
  }
}
