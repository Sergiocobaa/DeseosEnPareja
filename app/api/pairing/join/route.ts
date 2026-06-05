import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { code } = await request.json();

    if (!code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json({ message: "Código inválido" }, { status: 400 });
    }

    // Validar código
    const invitation = await prisma.invitation.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!invitation) {
      return NextResponse.json({ message: "Código no encontrado o ya usado" }, { status: 404 });
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.delete({ where: { id: invitation.id } });
      return NextResponse.json({ message: "El código ha expirado" }, { status: 400 });
    }

    if (invitation.creatorId === userId) {
      return NextResponse.json({ message: "No puedes emparejarte contigo mismo" }, { status: 400 });
    }

    // Check if the current user is already in a couple
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (currentUser?.coupleId) {
      return NextResponse.json({ message: "Ya estás emparejado" }, { status: 400 });
    }

    const creatorUser = await prisma.user.findUnique({ where: { id: invitation.creatorId } });
    if (creatorUser?.coupleId) {
      return NextResponse.json({ message: "La otra persona ya está emparejada" }, { status: 400 });
    }

    // Create Couple and link users in a transaction
    await prisma.$transaction(async (tx) => {
      const couple = await tx.couple.create({
        data: {
          user1Id: invitation.creatorId,
          user2Id: userId
        }
      });

      await tx.user.update({
        where: { id: invitation.creatorId },
        data: { coupleId: couple.id }
      });

      await tx.user.update({
        where: { id: userId },
        data: { coupleId: couple.id }
      });

      // Eliminar la invitación para que no se re-use
      await tx.invitation.delete({ where: { id: invitation.id } });
    });

    return NextResponse.json({ message: "Emparejamiento exitoso" }, { status: 200 });

  } catch (error) {
    console.error("Error en join:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
