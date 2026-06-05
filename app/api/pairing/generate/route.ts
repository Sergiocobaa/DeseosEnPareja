import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if user already has an active invitation
    await prisma.invitation.deleteMany({
      where: { creatorId: userId }
    });

    // Check if user is already in a couple
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.coupleId) {
      return NextResponse.json({ message: "Ya estás emparejado" }, { status: 400 });
    }

    // Generate unique code
    let code = "";
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existing = await prisma.invitation.findUnique({ where: { code } });
      if (!existing) isUnique = true;
    }

    // Expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        code,
        creatorId: userId,
        expiresAt
      }
    });

    return NextResponse.json({ code: invitation.code, expiresAt: invitation.expiresAt });

  } catch (error) {
    console.error("Error al generar código:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
