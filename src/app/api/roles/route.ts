import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/roles - optional filter by names (comma-separated)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const namesParam = url.searchParams.get("names");
    const names = namesParam
      ? namesParam
          .split(",")
          .map((n) => n.trim().toUpperCase())
          .filter(Boolean)
      : null;

    const roles = await prisma.role.findMany({
      where: names ? { name: { in: names } } : undefined,
      orderBy: { roleId: "asc" },
    });

    return NextResponse.json(roles);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch roles", details: message },
      { status: 500 }
    );
  }
}
