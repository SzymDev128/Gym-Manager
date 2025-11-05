import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/classes/[id]
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

    const item = await prisma.class.findUnique({
      where: { id },
      include: { trainer: { include: { employee: true } } },
    });

    if (!item)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch class", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/classes/[id]
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
    const { name, startTime, durationMin, trainerId } = body || {};

    // If trainerId provided, validate existence; allow null to unassign
    if (trainerId !== undefined && trainerId !== null) {
      const trainer = await prisma.trainer.findUnique({
        where: { id: Number(trainerId) },
      });
      if (!trainer) {
        return NextResponse.json(
          { error: "Trainer not found" },
          { status: 404 }
        );
      }
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name,
        startTime: startTime ? new Date(startTime) : undefined,
        durationMin:
          durationMin !== undefined ? Number(durationMin) : undefined,
        trainerId:
          trainerId === undefined
            ? undefined
            : trainerId === null
            ? null
            : Number(trainerId),
      },
      include: { trainer: { include: { employee: true } } },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update class", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id]
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

    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete class", details: message },
      { status: 500 }
    );
  }
}
