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
        user: {
          include: {
            phoneNumbers: true,
          },
        },
        trainer: {
          include: {
            classes: true,
            supervisor: true,
            subordinates: true,
          },
        },
        receptionist: true,
      },
      orderBy: { hireDate: "desc" },
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

// POST /api/employees - hire user as employee (with optional trainer/receptionist role)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      userId,
      hireDate,
      salary,
      // Trainer fields (optional)
      specialization,
      experienceYears,
      supervisorId,
      // Receptionist fields (optional)
      shiftHours,
    } = data || {};

    if (!userId || !hireDate || salary === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, hireDate, salary",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already is an employee
    const existingEmployee = await prisma.employee.findUnique({
      where: { userId: Number(userId) },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: "User is already an employee" },
        { status: 409 }
      );
    }

    // Build nested create data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      userId: Number(userId),
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

    // Determine user role based on employee type
    let userRoleName = "USER"; // Default
    if (specialization) {
      userRoleName = "TRAINER";
    } else if (shiftHours) {
      userRoleName = "RECEPTIONIST";
    }

    // Get the role
    const userRole = await prisma.role.findUnique({
      where: { name: userRoleName },
    });

    if (!userRole) {
      return NextResponse.json(
        { error: `System configuration error: ${userRoleName} role not found` },
        { status: 500 }
      );
    }

    const created = await prisma.employee.create({
      data: createData,
      include: {
        user: {
          include: {
            phoneNumbers: true,
          },
        },
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

    // Update user role
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { roleId: userRole.id },
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
