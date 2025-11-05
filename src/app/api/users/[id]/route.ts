import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// GET /api/users/[id] - get single user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        phoneNumbers: true,
        memberships: {
          include: {
            membership: true,
            payments: true,
          },
          orderBy: { startDate: "desc" },
        },
        checkIns: {
          orderBy: { checkInTime: "desc" },
        },
        employee: {
          include: {
            trainer: {
              include: {
                classes: true,
              },
            },
            receptionist: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch user", details: message },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - update user
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      birthDate,
      role: roleName,
      phoneNumbers,
    } = data || {};

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate role if provided
    const validRoles = [
      "USER",
      "MEMBER",
      "RECEPTIONIST",
      "TRAINER",
      "ADMIN",
    ] as const;
    if (roleName && !validRoles.includes(roleName)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }

    // Hash password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // Update user
    // Resolve roleId if roleName provided
    let roleIdToSet: number | undefined = undefined;
    if (roleName) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        return NextResponse.json(
          { error: `Role ${roleName} not found` },
          { status: 400 }
        );
      }
      roleIdToSet = role.id;
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        email: email || undefined,
        password: hashedPassword,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        roleId: roleIdToSet,
        phoneNumbers: phoneNumbers
          ? {
              deleteMany: {},
              create: phoneNumbers.map((n: string) => ({ number: n })),
            }
          : undefined,
      },
      include: {
        phoneNumbers: true,
        memberships: {
          include: { membership: true },
          orderBy: { startDate: "desc" },
        },
        checkIns: {
          orderBy: { checkInTime: "desc" },
        },
        employee: {
          include: { trainer: true, receptionist: true },
        },
      },
    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = updated;

    return NextResponse.json(userWithoutPassword);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update user", details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - delete user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete user", details: message },
      { status: 500 }
    );
  }
}
