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

    // Verificar si el usuario tiene pareja
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { couple: true }
    });

    if (!user || !user.coupleId || !user.couple) {
      return NextResponse.json({ message: "No estás emparejado actualmente" }, { status: 400 });
    }

    const coupleId = user.coupleId;
    const partnerId = user.couple.user1Id === userId ? user.couple.user2Id : user.couple.user1Id;

    // Transacción para asegurar la integridad de los datos
    await prisma.$transaction([
      // 1. Eliminar deseos activos y en pool entre ambos (no los completados)
      prisma.wish.deleteMany({
        where: {
          OR: [
            { creatorId: userId, receiverId: partnerId },
            { creatorId: partnerId, receiverId: userId }
          ],
          status: {
            not: "COMPLETED"
          }
        }
      }),
      // 2. Desvincular al usuario 1
      prisma.user.update({
        where: { id: user.couple.user1Id },
        data: { coupleId: null }
      }),
      // 3. Desvincular al usuario 2
      prisma.user.update({
        where: { id: user.couple.user2Id },
        data: { coupleId: null }
      }),
      // 4. Eliminar el registro Couple
      prisma.couple.delete({
        where: { id: coupleId }
      })
    ]);

    return NextResponse.json({ message: "Desvinculación exitosa" }, { status: 200 });

  } catch (error) {
    console.error("Error al desvincular:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
