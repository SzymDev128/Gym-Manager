import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/memberships - list all membership plans
export async function GET() {
  try {
    const memberships = await prisma.membership.findMany({
      orderBy: [{ name: "asc" }, { durationMonths: "asc" }],
    });
    return NextResponse.json(memberships);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch memberships", details: message },
      { status: 500 }
    );
  }
}
