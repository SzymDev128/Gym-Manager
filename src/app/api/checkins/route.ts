import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/checkins - list all check-ins (optional filter by memberId)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const memberIdParam = url.searchParams.get("memberId");
    const where = memberIdParam
      ? { memberId: Number(memberIdParam) }
      : undefined;

    if (where && Number.isNaN(where.memberId)) {
      return NextResponse.json({ error: "Invalid memberId" }, { status: 400 });
    }

    const items = await prisma.checkIn.findMany({
      where,
      include: { member: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(items);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch check-ins", details: message },
      { status: 500 }
    );
  }
}

// POST /api/checkins - create a check-in
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, checkInTime } = body || {};

    if (memberId === undefined) {
      return NextResponse.json(
        { error: "Missing required field: memberId" },
        { status: 400 }
      );
    }

    // Ensure member exists (better error message than FK error)
    const member = await prisma.member.findUnique({
      where: { id: Number(memberId) },
    });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const created = await prisma.checkIn.create({
      data: {
        memberId: Number(memberId),
        checkInTime: checkInTime ? new Date(checkInTime) : undefined,
      },
      include: { member: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create check-in", details: message },
      { status: 500 }
    );
  }
}
