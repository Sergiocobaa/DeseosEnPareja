import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Fisher-Yates shuffle
function shuffle(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function POST() {
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
      return NextResponse.json({ message: "No tienes pareja asignada" }, { status: 400 });
    }

    const partnerId = user.couple.user1Id === userId ? user.couple.user2Id : user.couple.user1Id;

    // Check if both users have exactly 10 wishes in POOL
    const myWishes = await prisma.wish.findMany({
      where: { creatorId: userId, status: "POOL" }
    });
    
    const partnerWishes = await prisma.wish.findMany({
      where: { creatorId: partnerId, status: "POOL" }
    });

    if (myWishes.length < user.couple.minWishesToDraw || partnerWishes.length < user.couple.minWishesToDraw) {
      return NextResponse.json({ message: `Ambos usuarios deben tener al menos ${user.couple.minWishesToDraw} deseos en su Pool` }, { status: 400 });
    }

    // Draw logic: pick up to 2 wishes per person, but don't exceed what they have
    const drawCount = Math.min(2, user.couple.minWishesToDraw);
    const mySelected = shuffle(myWishes).slice(0, drawCount);
    const partnerSelected = shuffle(partnerWishes).slice(0, drawCount);

    const selectedIds = [
      ...mySelected.map(w => w.id),
      ...partnerSelected.map(w => w.id)
    ];

    // Atomically update these 4 wishes to ACTIVE
    await prisma.wish.updateMany({
      where: {
        id: { in: selectedIds }
      },
      data: {
        status: "ACTIVE"
      }
    });

    return NextResponse.json({ message: "Sorteo realizado con éxito" }, { status: 200 });

  } catch (error) {
    console.error("Error en sorteo:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
