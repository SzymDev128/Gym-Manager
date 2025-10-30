import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/members/[id]
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        phoneNumbers: true,
        membership: true,
        payments: true,
        checkIns: true,
      },
    });

    if (!member)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(member);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch member", details: message },
      { status: 500 }
    );
  }
}

// PUT /api/members/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { firstName, lastName, email, birthDate, membershipId } = body || {};

    const updated = await prisma.member.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        membershipId:
          membershipId !== undefined ? Number(membershipId) : undefined,
      },
      include: { phoneNumbers: true, membership: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update member", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete member", details: message },
      { status: 500 }
    );
  }
}
