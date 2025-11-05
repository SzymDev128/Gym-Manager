import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/maintenance/[id]
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

    const item = await prisma.maintenance.findUnique({
      where: { id },
      include: { equipment: true },
    });

    if (!item)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch maintenance record", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/maintenance/[id]
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
    const { equipmentId, date, cost, description } = body || {};

    // If equipmentId is provided, ensure new equipment exists
    if (equipmentId !== undefined) {
      const exists = await prisma.equipment.findUnique({
        where: { id: Number(equipmentId) },
      });
      if (!exists) {
        return NextResponse.json(
          { error: "Equipment not found" },
          { status: 404 }
        );
      }
    }

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        equipmentId:
          equipmentId !== undefined ? Number(equipmentId) : undefined,
        date: date ? new Date(date) : undefined,
        cost: cost !== undefined ? Number(cost) : undefined,
        description: description !== undefined ? description : undefined,
      },
      include: { equipment: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update maintenance record", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/maintenance/[id]
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

    await prisma.maintenance.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete maintenance record", details: message },
      { status: 500 }
    );
  }
}
