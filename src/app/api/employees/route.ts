import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/employees - list employees with optional role filter
// ?role=trainer - only employees with trainer role
// ?role=receptionist - only employees with receptionist role
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const role = url.searchParams.get("role");

    const where: Record<string, unknown> = {};

    if (role === "trainer") {
      where.trainer = { isNot: null };
    } else if (role === "receptionist") {
      where.receptionist = { isNot: null };
    }

    const employees = await prisma.employee.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        trainer: {
          include: {
            classes: true,
            supervisor: true,
            subordinates: true,
          },
        },
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

// POST /api/employees - create employee (with optional trainer/receptionist role)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      firstName,
      lastName,
      hireDate,
      salary,
      // Trainer fields (optional)
      specialization,
      experienceYears,
      supervisorId,
      // Receptionist fields (optional)
      shiftHours,
    } = data || {};

    if (!firstName || !lastName || !hireDate || salary === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: firstName, lastName, hireDate, salary",
        },
        { status: 400 }
      );
    }

    // Build nested create data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      firstName,
      lastName,
      hireDate: new Date(hireDate),
      salary: Number(salary),
    };

    // Add trainer role if specialization provided
    if (specialization) {
      if (experienceYears === undefined) {
        return NextResponse.json(
          { error: "experienceYears required when creating trainer" },
          { status: 400 }
        );
      }

      // Validate supervisorId if provided
      if (supervisorId !== undefined && supervisorId !== null) {
        const supervisorExists = await prisma.trainer.findUnique({
          where: { id: Number(supervisorId) },
        });
        if (!supervisorExists) {
          return NextResponse.json(
            {
              error: `Supervisor with id ${supervisorId} not found or is not a trainer`,
            },
            { status: 404 }
          );
        }
      }

      createData.trainer = {
        create: {
          specialization,
          experienceYears: Number(experienceYears),
          supervisorId: supervisorId ? Number(supervisorId) : null,
        },
      };
    }

    // Add receptionist role if shiftHours provided
    if (shiftHours) {
      createData.receptionist = {
        create: {
          shiftHours,
        },
      };
    }

    const created = await prisma.employee.create({
      data: createData,
      include: {
        trainer: {
          include: {
            classes: true,
            supervisor: true,
            subordinates: true,
          },
        },
        receptionist: true,
      },
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
