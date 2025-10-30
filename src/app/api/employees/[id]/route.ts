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

// PATCH /api/employees/[id]
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
    const { firstName, lastName, hireDate, salary } = body || {};

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        salary: salary !== undefined ? Number(salary) : undefined,
      },
      include: { trainer: true, receptionist: true },
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

// DELETE /api/employees/[id]
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
      { error: "Failed to delete employee", details: message },
      { status: 500 }
    );
  }
}
