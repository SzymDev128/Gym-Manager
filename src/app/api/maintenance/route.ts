import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/maintenance - list all maintenance records
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get("equipmentId");

    const where = equipmentId ? { equipmentId: Number(equipmentId) } : {};

    const items = await prisma.maintenance.findMany({
      where,
      include: { equipment: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(items);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch maintenance records", details: message },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - create a maintenance record
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { equipmentId, date, cost, description } = body || {};

    if (equipmentId === undefined || !date || cost === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: equipmentId, date, cost" },
        { status: 400 }
      );
    }

    // Optional existence check for clearer error
    const equipment = await prisma.equipment.findUnique({
      where: { id: Number(equipmentId) },
    });
    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    const created = await prisma.maintenance.create({
      data: {
        equipmentId: Number(equipmentId),
        date: new Date(date),
        cost: Number(cost),
        description: description ?? null,
      },
      include: { equipment: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create maintenance record", details: message },
      { status: 500 }
    );
  }
}
