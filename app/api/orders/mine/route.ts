export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { candle: { select: { name: true, imageUrl: true } } },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: 'Error al obtener tus pedidos' }, { status: 500 });
  }
}
