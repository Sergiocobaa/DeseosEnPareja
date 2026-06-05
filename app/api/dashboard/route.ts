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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { couple: true }
    });

    if (!user?.couple) {
      return NextResponse.json({ 
        hasCouple: false 
      });
    }

    const partnerId = user.couple.user1Id === userId ? user.couple.user2Id : user.couple.user1Id;

    // Fetch wishes I need to fulfill (receiver is me, status ACTIVE)
    const toFulfill = await prisma.wish.findMany({
      where: { receiverId: userId, status: "ACTIVE" },
      include: { creator: { select: { name: true } } }
    });

    // Fetch wishes my partner needs to fulfill (creator is me, status ACTIVE)
    const toReceive = await prisma.wish.findMany({
      where: { creatorId: userId, status: "ACTIVE" },
      include: { receiver: { select: { name: true } } }
    });

    // Check pool counts for both
    const myPoolCount = await prisma.wish.count({
      where: { creatorId: userId, status: "POOL" }
    });
    const partnerPoolCount = await prisma.wish.count({
      where: { creatorId: partnerId, status: "POOL" }
    });

    return NextResponse.json({
      hasCouple: true,
      toFulfill,
      toReceive,
      myPoolCount,
      partnerPoolCount,
      canDraw: myPoolCount === 10 && partnerPoolCount === 10 && toFulfill.length === 0 && toReceive.length === 0
    });

  } catch (error) {
    console.error("Error en dashboard:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
