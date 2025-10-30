import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/receptionist/[id]
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
    const receptionist = await prisma.receptionist.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!receptionist) {
      return NextResponse.json(
        { error: "Receptionist not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(receptionist);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch receptionist", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/receptionist/[id]
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
    const { firstName, lastName, hireDate, salary, shiftHours } = body || {};

    // Update through Employee (which includes Receptionist data)
    const updated = await prisma.employee.update({
      where: { id },
      data: {
        // Update Employee fields
        firstName,
        lastName,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        salary: salary !== undefined ? Number(salary) : undefined,
        // Update nested Receptionist fields
        receptionist: {
          update: {
            shiftHours,
          },
        },
      },
      include: {
        receptionist: true,
      },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update receptionist", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/receptionist/[id]
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

    // Delete Employee (cascade will delete Receptionist)
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete receptionist", details: message },
      { status: 500 }
    );
  }
}
