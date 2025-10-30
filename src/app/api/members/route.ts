import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/members - list members
export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        phoneNumbers: true,
        membership: true,
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(members);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch members", details: message },
      { status: 500 }
    );
  }
}

// POST /api/members - create member
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      firstName,
      lastName,
      email,
      birthDate,
      membershipId,
      phoneNumbers,
    } = data || {};

    if (!firstName || !lastName || !email || !membershipId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.member.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const created = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        membershipId: Number(membershipId),
        birthDate: birthDate ? new Date(birthDate) : null,
        phoneNumbers: phoneNumbers?.length
          ? {
              create: phoneNumbers.map((n: string) => ({ number: n })),
            }
          : undefined,
      },
      include: { phoneNumbers: true, membership: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create member", details: message },
      { status: 500 }
    );
  }
}
