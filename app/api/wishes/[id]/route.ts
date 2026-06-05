import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: wishId } = await params;

    const wish = await prisma.wish.findUnique({
      where: { id: wishId }
    });

    if (!wish) {
      return NextResponse.json({ message: "Deseo no encontrado" }, { status: 404 });
    }

    if (wish.receiverId !== userId) {
      return NextResponse.json({ message: "No puedes completar este deseo" }, { status: 403 });
    }

    const updatedWish = await prisma.wish.update({
      where: { id: wishId },
      data: { status: "COMPLETED" }
    });

    return NextResponse.json({ wish: updatedWish }, { status: 200 });

  } catch (error) {
    console.error("Error al completar deseo:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: wishId } = await params;

    const wish = await prisma.wish.findUnique({
      where: { id: wishId }
    });

    if (!wish) {
      return NextResponse.json({ message: "Deseo no encontrado" }, { status: 404 });
    }

    if (wish.creatorId !== userId) {
      return NextResponse.json({ message: "Solo puedes borrar tus propios deseos" }, { status: 403 });
    }

    if (wish.status !== "POOL") {
      return NextResponse.json({ message: "No puedes borrar un deseo que ya ha sido sorteado" }, { status: 400 });
    }

    await prisma.wish.delete({
      where: { id: wishId }
    });

    return NextResponse.json({ message: "Deseo eliminado correctamente" }, { status: 200 });

  } catch (error) {
    console.error("Error al eliminar deseo:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
