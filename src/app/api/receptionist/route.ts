import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/receptionist - list receptionists
export async function GET() {
  try {
    const receptionists = await prisma.receptionist.findMany({
      include: {
        employee: true,
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(receptionists);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch receptionists", details: message },
      { status: 500 }
    );
  }
}

// POST /api/receptionist - create receptionist (with employee)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, hireDate, salary, shiftHours } = data || {};
    if (
      !firstName ||
      !lastName ||
      !hireDate ||
      salary === undefined ||
      !shiftHours
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: firstName, lastName, hireDate, salary, shiftHours",
        },
        { status: 400 }
      );
    }
    // Create employee first, then receptionist with same ID
    const created = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        hireDate: new Date(hireDate),
        salary: Number(salary),
        receptionist: {
          create: {
            shiftHours,
          },
        },
      },
      include: { receptionist: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create receptionist", details: message },
      { status: 500 }
    );
  }
}
