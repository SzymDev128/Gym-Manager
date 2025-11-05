import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  return d;
}

// GET /api/members/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const member = await prisma.userMembership.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            phoneNumbers: true,
            checkIns: { orderBy: { checkInTime: "desc" }, take: 10 },
          },
        },
        membership: true,
        payments: { orderBy: { date: "desc" } },
      },
    });

    if (!member)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(member);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch member", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/members/[id] - update membership plan
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { membershipId, startDate, active } = body || {};

    // Load existing user membership
    const existing = await prisma.userMembership.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let newStart: Date | undefined = undefined;
    let newEnd: Date | undefined = undefined;

    // When changing membership plan or startDate, recalculate endDate
    if (membershipId || startDate) {
      const planId = Number(membershipId ?? existing.membershipId);
      const plan = await prisma.membership.findUnique({
        where: { id: planId },
      });
      if (!plan) {
        return NextResponse.json(
          { error: "Membership plan not found" },
          { status: 404 }
        );
      }
      newStart = startDate ? new Date(startDate) : existing.startDate;
      newEnd = addMonths(newStart, plan.durationMonths);
    }

    // If toggling active to true, enforce single active membership per user
    if (active === true) {
      const otherActive = await prisma.userMembership.findFirst({
        where: { userId: existing.userId, active: true, NOT: { id } },
      });
      if (otherActive) {
        return NextResponse.json(
          { error: "User already has another active membership" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.userMembership.update({
      where: { id },
      data: {
        membershipId: membershipId ? Number(membershipId) : undefined,
        startDate: newStart,
        endDate: newEnd,
        active: typeof active === "boolean" ? active : undefined,
      },
      include: {
        user: {
          include: {
            phoneNumbers: true,
            checkIns: { orderBy: { checkInTime: "desc" }, take: 10 },
          },
        },
        membership: true,
      },
    });

    // Role adjustments when deactivating: if no active memberships left and not an employee, demote MEMBER -> USER
    if (active === false) {
      const stillActive = await prisma.userMembership.findFirst({
        where: { userId: updated.userId, active: true },
      });
      if (!stillActive) {
        const [employee, user, userRole] = await Promise.all([
          prisma.employee.findUnique({ where: { userId: updated.userId } }),
          prisma.user.findUnique({
            where: { id: updated.userId },
            include: { role: true },
          }),
          prisma.role.findUnique({ where: { name: "USER" } }),
        ]);
        if (!employee && user?.role?.name === "MEMBER" && userRole) {
          await prisma.user.update({
            where: { id: updated.userId },
            data: { roleId: userRole.id },
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update member", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - cancel membership (user remains, member record deleted)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Deactivate membership instead of deleting (preserve history)
    const existing = await prisma.userMembership.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.userMembership.update({
      where: { id },
      data: { active: false, endDate: existing.endDate ?? new Date() },
    });

    // Adjust role if this was the last active membership and user is not employee
    const stillActive = await prisma.userMembership.findFirst({
      where: { userId: existing.userId, active: true },
    });

    if (!stillActive) {
      const [employee, user, userRole] = await Promise.all([
        prisma.employee.findUnique({ where: { userId: existing.userId } }),
        prisma.user.findUnique({
          where: { id: existing.userId },
          include: { role: true },
        }),
        prisma.role.findUnique({ where: { name: "USER" } }),
      ]);

      if (!employee && user?.role?.name === "MEMBER" && userRole) {
        await prisma.user.update({
          where: { id: existing.userId },
          data: { roleId: userRole.id },
        });
      }
    }

    return NextResponse.json({ message: "Membership deactivated" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete member", details: message },
      { status: 500 }
    );
  }
}
