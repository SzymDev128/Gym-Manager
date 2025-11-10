import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/equipment/[id]
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

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: { maintenance: true },
    });

    if (!equipment)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(equipment);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch equipment", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/equipment/[id]
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
    const { name, category, condition, purchaseDate, purchasePrice } =
      body || {};

    const updated = await prisma.equipment.update({
      where: { id },
      data: {
        name,
        category,
        condition,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        purchasePrice:
          purchasePrice !== undefined && purchasePrice !== null
            ? Number(purchasePrice)
            : undefined,
      },
      include: { maintenance: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update equipment", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/[id]
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

    await prisma.$transaction(async (tx) => {
      // Remove dependent maintenance records first (no cascade defined in schema)
      await tx.maintenance.deleteMany({ where: { equipmentId: id } });
      await tx.equipment.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete equipment", details: message },
      { status: 500 }
    );
  }
}
