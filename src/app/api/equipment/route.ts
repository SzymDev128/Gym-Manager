import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/equipment - list all equipment
export async function GET() {
  try {
    const equipment = await prisma.equipment.findMany({
      include: { maintenance: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(equipment);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch equipment", details: message },
      { status: 500 }
    );
  }
}

// POST /api/equipment - create equipment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, condition, purchaseDate } = body || {};

    if (!name || !category || !condition || !purchaseDate) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, category, condition, purchaseDate",
        },
        { status: 400 }
      );
    }

    const created = await prisma.equipment.create({
      data: {
        name,
        category,
        condition,
        purchaseDate: new Date(purchaseDate),
      },
      include: { maintenance: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create equipment", details: message },
      { status: 500 }
    );
  }
}
