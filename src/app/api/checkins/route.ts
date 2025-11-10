import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/checkins - list all check-ins (optional filter by userId)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");
    const where = userIdParam ? { userId: Number(userIdParam) } : undefined;

    if (where && Number.isNaN(where.userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const items = await prisma.checkIn.findMany({
      where,
      include: { user: true },
      orderBy: { checkInTime: "desc" },
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
    const { userId } = body || {};

    if (userId === undefined) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const created = await prisma.checkIn.create({
      data: {
        userId: Number(userId),
        checkInTime: new Date(),
      },
      include: { user: true },
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

// PATCH /api/checkins - update checkOutTime for last open check-in
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body || {};

    if (userId === undefined) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    // Find last open check-in (checkOutTime is null)
    const lastCheckin = await prisma.checkIn.findFirst({
      where: {
        userId: Number(userId),
        checkOutTime: null,
      },
      orderBy: { checkInTime: "desc" },
    });

    if (!lastCheckin) {
      return NextResponse.json(
        { error: "No open check-in found" },
        { status: 404 }
      );
    }

    const updated = await prisma.checkIn.update({
      where: { id: lastCheckin.id },
      data: { checkOutTime: new Date() },
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update check-out", details: message },
      { status: 500 }
    );
  }
}
