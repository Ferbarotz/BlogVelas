export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getWompiConfig, isWompiConfigured, wompiApiBase } from '@/lib/wompi';

// GET /api/payments/wompi/verify?orderId=...&transactionId=...
// Verifica el estado de la transacción contra Wompi y actualiza el pedido.
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');
    const transactionId = req.nextUrl.searchParams.get('transactionId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // MODO SIMULADO: el pago se considera aprobado.
    if (!isWompiConfigured()) {
      return NextResponse.json({
        status: 'pagado (simulado)',
        wompiStatus: 'APPROVED',
        mock: true,
        orderNumber: order.orderNumber,
      });
    }

    if (!transactionId) {
      return NextResponse.json({
        status: order.paymentStatus,
        orderNumber: order.orderNumber,
      });
    }

    const { privateKey } = getWompiConfig();
    const res = await fetch(`${wompiApiBase()}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${privateKey}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(
        { status: order.paymentStatus, error: 'No se pudo verificar la transacción' },
        { status: 200 }
      );
    }
    const data = await res.json();
    const wompiStatus: string = data?.data?.status ?? 'PENDING';

    const map: Record<string, string> = {
      APPROVED: 'pagado',
      DECLINED: 'rechazado',
      VOIDED: 'anulado',
      ERROR: 'error',
      PENDING: 'pendiente',
    };
    const paymentStatus = map[wompiStatus] ?? 'pendiente';

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus, paymentRef: transactionId },
    });

    return NextResponse.json({ status: paymentStatus, wompiStatus, orderNumber: order.orderNumber });
  } catch (err) {
    console.error('Error al verificar pago Wompi:', err);
    return NextResponse.json({ error: 'Error al verificar el pago' }, { status: 500 });
  }
}
