import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/employees/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
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

    if (!employee)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(employee);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch employee", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/employees/[id] - update employee data (salary, hireDate) and optionally trainer/receptionist roles
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const {
      hireDate,
      salary,
      // Trainer fields (optional)
      specialization,
      experienceYears,
      supervisorId,
      // Receptionist fields (optional)
      shiftHours,
    } = body || {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      hireDate: hireDate ? new Date(hireDate) : undefined,
      salary: salary !== undefined ? Number(salary) : undefined,
    };

    // Check if employee has trainer role and update if trainer fields provided
    if (
      specialization !== undefined ||
      experienceYears !== undefined ||
      supervisorId !== undefined
    ) {
      // Validate supervisorId if provided and not null
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

      const employee = await prisma.employee.findUnique({
        where: { id },
        include: { trainer: true },
      });

      if (employee?.trainer) {
        // Update existing trainer
        updateData.trainer = {
          update: {
            specialization,
            experienceYears:
              experienceYears !== undefined
                ? Number(experienceYears)
                : undefined,
            supervisorId:
              supervisorId !== undefined
                ? supervisorId === null
                  ? null
                  : Number(supervisorId)
                : undefined,
          },
        };
      } else if (specialization && experienceYears !== undefined) {
        // Create new trainer role
        updateData.trainer = {
          create: {
            specialization,
            experienceYears: Number(experienceYears),
            supervisorId: supervisorId ? Number(supervisorId) : null,
          },
        };
      }
    }

    // Check if employee has receptionist role and update if shiftHours provided
    if (shiftHours !== undefined) {
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: { receptionist: true },
      });

      if (employee?.receptionist) {
        // Update existing receptionist
        updateData.receptionist = {
          update: {
            shiftHours,
          },
        };
      } else {
        // Create new receptionist role
        updateData.receptionist = {
          create: {
            shiftHours,
          },
        };
      }
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update employee", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - terminate employment (user remains, employee record deleted)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Load employee to get userId before deleting
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.employee.delete({ where: { id } });

    // After termination, adjust user role:
    // - If user had TRAINER/RECEPTIONIST role, demote to MEMBER if they have an active membership; otherwise to USER.
    const [user, hasActiveMembership, memberRole, userRole] = await Promise.all([
      prisma.user.findUnique({ where: { id: employee.userId }, include: { role: true } }),
      prisma.userMembership.findFirst({ where: { userId: employee.userId, active: true } }),
      prisma.role.findUnique({ where: { name: "MEMBER" } }),
      prisma.role.findUnique({ where: { name: "USER" } }),
    ]);

    if (
      user &&
      (user.role?.name === "TRAINER" || user.role?.name === "RECEPTIONIST") &&
      (memberRole && userRole)
    ) {
      const newRoleId = hasActiveMembership ? memberRole.id : userRole.id;
      await prisma.user.update({ where: { id: user.id }, data: { roleId: newRoleId } });
    }

    return NextResponse.json({ message: "Employment terminated and role adjusted if necessary" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete employee", details: message },
      { status: 500 }
    );
  }
}
