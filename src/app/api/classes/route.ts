import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/classes - list all classes (optional filter by trainerId)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trainerIdParam = url.searchParams.get("trainerId");
    const where = trainerIdParam
      ? { trainerId: Number(trainerIdParam) }
      : undefined;

    if (where && where.trainerId !== null && Number.isNaN(where.trainerId)) {
      return NextResponse.json({ error: "Invalid trainerId" }, { status: 400 });
    }

    const items = await prisma.class.findMany({
      where,
      include: { trainer: { include: { employee: true } } },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(items);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch classes", details: message },
      { status: 500 }
    );
  }
}

// POST /api/classes - create a class
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, startTime, durationMin, trainerId } = body || {};

    if (!name || !startTime || durationMin === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, startTime, durationMin" },
        { status: 400 }
      );
    }

    // If trainerId provided, ensure trainer exists
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

    const created = await prisma.class.create({
      data: {
        name,
        startTime: new Date(startTime),
        durationMin: Number(durationMin),
        trainerId:
          trainerId !== undefined && trainerId !== null
            ? Number(trainerId)
            : null,
      },
      include: { trainer: { include: { employee: true } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create class", details: message },
      { status: 500 }
    );
  }
}
