import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/trainers - list trainers
export async function GET() {
  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        employee: true,
        classes: true,
        supervisor: true,
        subordinates: true,
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(trainers);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch trainers", details: message },
      { status: 500 }
    );
  }
}
// POST /api/trainers - create trainer (with employee)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      firstName,
      lastName,
      hireDate,
      salary,
      specialization,
      experienceYears,
      supervisorId,
    } = data || {};

    if (
      !firstName ||
      !lastName ||
      !hireDate ||
      salary === undefined ||
      !specialization ||
      experienceYears === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: firstName, lastName, hireDate, salary, specialization, experienceYears",
        },
        { status: 400 }
      );
    }

    // Create employee first, then trainer with same ID
    const created = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        hireDate: new Date(hireDate),
        salary: Number(salary),
        trainer: {
          create: {
            specialization,
            experienceYears: Number(experienceYears),
            supervisorId: supervisorId ? Number(supervisorId) : null,
          },
        },
      },
      include: {
        trainer: {
          include: { classes: true, supervisor: true, subordinates: true },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create trainer", details: message },
      { status: 500 }
    );
  }
}
