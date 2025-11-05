import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  return d;
}

// GET /api/members - list members with memberships
export async function GET() {
  try {
    const members = await prisma.userMembership.findMany({
      include: {
        user: {
          include: {
            phoneNumbers: true,
            checkIns: { orderBy: { checkInTime: "desc" }, take: 5 },
          },
        },
        membership: true,
        payments: true,
      },
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json(members);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch members", details: message },
      { status: 500 }
    );
  }
}

// POST /api/members - assign membership to user
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId, membershipId, startDate } = data || {};

    if (!userId || !membershipId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, membershipId" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent multiple active memberships at the same time
    const existingActive = await prisma.userMembership.findFirst({
      where: { userId: Number(userId), active: true },
    });

    if (existingActive) {
      return NextResponse.json(
        { error: "User already has an active membership" },
        { status: 409 }
      );
    }

    // Check if membership plan exists
    const membership = await prisma.membership.findUnique({
      where: { id: Number(membershipId) },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Membership plan not found" },
        { status: 404 }
      );
    }

    // Get roles
    const [memberRole, userRole] = await Promise.all([
      prisma.role.findUnique({ where: { name: "MEMBER" } }),
      prisma.role.findUnique({ where: { name: "USER" } }),
    ]);

    if (!memberRole || !userRole) {
      return NextResponse.json(
        { error: "System configuration error: required roles not found" },
        { status: 500 }
      );
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = addMonths(start, membership.durationMonths);

    // Create user membership
    const created = await prisma.userMembership.create({
      data: {
        userId: Number(userId),
        membershipId: Number(membershipId),
        startDate: start,
        endDate: end,
        active: true,
      },
      include: {
        user: {
          include: {
            phoneNumbers: true,
            checkIns: { orderBy: { checkInTime: "desc" }, take: 5 },
          },
        },
        membership: true,
        payments: true,
      },
    });

    // Promote USER -> MEMBER only if user wasn't employee already
    // If user already has an employee record, keep their employee role
    const employee = await prisma.employee.findUnique({
      where: { userId: Number(userId) },
      select: { id: true, trainer: true, receptionist: true },
    });

    if (!employee && user.role?.name === "USER") {
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { roleId: memberRole.id },
      });
    }

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create member", details: message },
      { status: 500 }
    );
  }
}
