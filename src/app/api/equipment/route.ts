import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/equipment - list all equipment with search and sorting
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const condition = searchParams.get("condition");
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Filter by condition
    if (condition && condition !== "all") {
      where.condition = condition;
    }

    // Filter by search query (name, category)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      if (where.condition) {
        where.AND = [
          { condition: where.condition },
          {
            OR: [
              { name: { contains: searchTerm } },
              { category: { contains: searchTerm } },
            ],
          },
        ];
        delete where.condition;
      } else {
        where.OR = [
          { name: { contains: searchTerm } },
          { category: { contains: searchTerm } },
        ];
      }
    }

    // Build orderBy clause
    const orderBy: Record<string, string> = {};
    const validSortFields = [
      "id",
      "name",
      "category",
      "condition",
      "purchaseDate",
    ];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.id = "desc";
    }

    const equipment = await prisma.equipment.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: { maintenance: true },
      orderBy,
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
