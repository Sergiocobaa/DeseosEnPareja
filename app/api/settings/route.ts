import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { couple: true }
    });

    if (!user || !user.couple) {
      return NextResponse.json({ message: "No tienes pareja vinculada" }, { status: 400 });
    }

    return NextResponse.json({
      maxWishes: user.couple.maxWishes,
      minWishesToDraw: user.couple.minWishesToDraw,
      showReceivedWishes: user.couple.showReceivedWishes
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { maxWishes, minWishesToDraw, showReceivedWishes } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { couple: true }
    });

    if (!user || !user.couple) {
      return NextResponse.json({ message: "No tienes pareja vinculada" }, { status: 400 });
    }

    // Actualizar configuración
    const updatedCouple = await prisma.couple.update({
      where: { id: user.coupleId! },
      data: {
        maxWishes: maxWishes !== undefined ? parseInt(maxWishes) : undefined,
        minWishesToDraw: minWishesToDraw !== undefined ? parseInt(minWishesToDraw) : undefined,
        showReceivedWishes: showReceivedWishes !== undefined ? Boolean(showReceivedWishes) : undefined,
      }
    });

    return NextResponse.json({ message: "Ajustes guardados", settings: updatedCouple });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
