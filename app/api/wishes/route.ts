import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const wishes = await prisma.wish.findMany({
      where: {
        creatorId: userId,
        status: "POOL"
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ wishes });
  } catch (error) {
    console.error("Error obteniendo deseos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { text } = await request.json();

    if (!text || text.length > 100) {
      return NextResponse.json({ message: "El texto es inválido o supera los 100 caracteres" }, { status: 400 });
    }

    // Comprobar si el usuario tiene pareja
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { couple: true }
    });

    if (!user?.couple) {
      return NextResponse.json({ message: "Necesitas estar emparejado para añadir deseos" }, { status: 400 });
    }

    const receiverId = user.couple.user1Id === userId ? user.couple.user2Id : user.couple.user1Id;

    // Verificar límite de deseos en POOL
    const poolCount = await prisma.wish.count({
      where: { creatorId: userId, status: "POOL" }
    });

    if (poolCount >= 10) {
      return NextResponse.json({ message: "Ya has alcanzado el límite de 10 deseos en el Pool" }, { status: 400 });
    }

    const newWish = await prisma.wish.create({
      data: {
        text,
        creatorId: userId,
        receiverId,
        status: "POOL"
      }
    });

    return NextResponse.json({ wish: newWish }, { status: 201 });
  } catch (error) {
    console.error("Error creando deseo:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
