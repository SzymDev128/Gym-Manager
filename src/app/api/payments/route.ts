import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/payments - list all payments (optional filter by memberId)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const memberIdParam = url.searchParams.get("memberId");
    const where = memberIdParam
      ? { memberId: Number(memberIdParam) }
      : undefined;

    if (where && Number.isNaN(where.memberId)) {
      return NextResponse.json({ error: "Invalid memberId" }, { status: 400 });
    }

    const items = await prisma.payment.findMany({
      where,
      include: { member: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(items);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch payments", details: message },
      { status: 500 }
    );
  }
}

// POST /api/payments - create a payment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, amount, method, date } = body || {};

    if (memberId === undefined || amount === undefined || !method) {
      return NextResponse.json(
        { error: "Missing required fields: memberId, amount, method" },
        { status: 400 }
      );
    }

    const memberIdNum = Number(memberId);
    const amountNum = Number(amount);
    if (Number.isNaN(memberIdNum) || Number.isNaN(amountNum)) {
      return NextResponse.json(
        { error: "memberId and amount must be numeric" },
        { status: 400 }
      );
    }

    // Ensure member exists for clearer error
    const member = await prisma.member.findUnique({
      where: { id: memberIdNum },
    });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const created = await prisma.payment.create({
      data: {
        memberId: memberIdNum,
        amount: amountNum,
        method,
        date: date ? new Date(date) : undefined,
      },
      include: { member: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create payment", details: message },
      { status: 500 }
    );
  }
}
