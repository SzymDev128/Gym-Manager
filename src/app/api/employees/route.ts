import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/employees - list employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        trainer: true,
        receptionist: true,
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(employees);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch employees", details: message },
      { status: 500 }
    );
  }
}

// POST /api/employees - create employee
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, hireDate, salary } = data || {};

    if (!firstName || !lastName || !hireDate || salary === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: firstName, lastName, hireDate, salary",
        },
        { status: 400 }
      );
    }

    const created = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        hireDate: new Date(hireDate),
        salary: Number(salary),
      },
      include: { trainer: true, receptionist: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create employee", details: message },
      { status: 500 }
    );
  }
}
