import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/trainers/[id]
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
    const trainer = await prisma.trainer.findUnique({
      where: { id },
      include: {
        classes: true,
        supervisor: true,
        subordinates: true,
        employee: true,
      },
    });
    if (!trainer)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(trainer);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch trainer", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/trainers/[id]
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
      firstName,
      lastName,
      hireDate,
      salary,
      specialization,
      experienceYears,
      supervisorId,
    } = body || {};

    // Update through Employee (which includes Trainer data)
    const updated = await prisma.employee.update({
      where: { id },
      data: {
        // Update Employee fields
        firstName,
        lastName,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        salary: salary !== undefined ? Number(salary) : undefined,
        // Update nested Trainer fields
        trainer: {
          update: {
            specialization,
            experienceYears:
              experienceYears !== undefined
                ? Number(experienceYears)
                : undefined,
            supervisorId:
              supervisorId !== undefined ? Number(supervisorId) : undefined,
          },
        },
      },
      include: {
        trainer: {
          include: {
            classes: true,
            supervisor: true,
            subordinates: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update trainer", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/trainers/[id]
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
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete trainer", details: message },
      { status: 500 }
    );
  }
}
