export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isWompiConfigured } from '@/lib/wompi';

// POST /api/payments/wompi/complete { orderId, method }
// Solo para MODO DEMO: marca el pedido como pagado (simulado) tras "pagar"
// en la pantalla de pago de demostración.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId: string = body?.orderId;
    const method: string = body?.method ?? '';
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 });
    }

    // Si hay credenciales reales, este endpoint de demo no aplica.
    if (isWompiConfigured()) {
      return NextResponse.json(
        { error: 'El pago real se procesa a través de Wompi.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const provider = method ? `simulado (${method})` : 'simulado';
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'pagado (simulado)',
        paymentProvider: provider,
      },
    });

    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  } catch (err) {
    console.error('Error al completar pago demo:', err);
    return NextResponse.json({ error: 'Error al completar el pago' }, { status: 500 });
  }
}
