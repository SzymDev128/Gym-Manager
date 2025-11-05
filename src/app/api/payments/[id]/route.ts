import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/payments/[id]
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

    const item = await prisma.payment.findUnique({
      where: { id },
      include: { member: true },
    });

    if (!item)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch payment", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/payments/[id]
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
    const { memberId, amount, method, date } = body || {};

    // Validate member existence if changing memberId
    let memberIdNum: number | undefined = undefined;
    if (memberId !== undefined) {
      memberIdNum = Number(memberId);
      if (Number.isNaN(memberIdNum)) {
        return NextResponse.json(
          { error: "memberId must be numeric" },
          { status: 400 }
        );
      }
      const member = await prisma.member.findUnique({
        where: { id: memberIdNum },
      });
      if (!member) {
        return NextResponse.json(
          { error: "Member not found" },
          { status: 404 }
        );
      }
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        memberId: memberIdNum,
        amount: amount !== undefined ? Number(amount) : undefined,
        method,
        date: date ? new Date(date) : undefined,
      },
      include: { member: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update payment", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id]
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

    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete payment", details: message },
      { status: 500 }
    );
  }
}
