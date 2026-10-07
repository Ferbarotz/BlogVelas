export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { candle: { select: { name: true, imageUrl: true } } },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    if (!body.customerName || !body.phone || !body.address || !body.items?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        phone: body.phone,
        address: body.address,
        notes: body.notes ?? '',
        email: body.email ?? session?.user?.email ?? null,
        userId: session?.user?.id ?? null,
        total: parseFloat(body.total) || 0,
        items: {
          create: (body.items ?? []).map((item: any) => ({
            candleId: item.candleId,
            quantity: item.quantity ?? 1,
            price: parseFloat(item.price) || 0,
            candleName: item.candleName ?? '',
            note: item.note ?? '',
          })),
        },
      },
    });

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber, total: order.total });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 });
  }
}
