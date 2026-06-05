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
      include: {
        couple: {
          include: {
            users: true
          }
        }
      }
    });

    if (!user || !user.couple) {
      return NextResponse.json({ isPaired: false });
    }

    // Encuentra a la otra persona en la pareja
    const partner = user.couple.users.find(u => u.id !== userId);

    if (!partner) {
      return NextResponse.json({ isPaired: false });
    }

    return NextResponse.json({ 
      isPaired: true, 
      partner: { 
        name: partner.name, 
        email: partner.email 
      } 
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener estado de pareja:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
