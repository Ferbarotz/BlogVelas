export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getWompiConfig,
  isWompiConfigured,
  wompiCheckoutBase,
  buildIntegritySignature,
} from '@/lib/wompi';

// POST /api/payments/wompi/checkout { orderId }
// Devuelve { mock: true } cuando no hay credenciales (flujo simulado),
// o { mock: false, checkoutUrl } para redirigir al checkout de Wompi.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId: string = body?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const amountInCents = Math.round((order.total ?? 0) * 100);
    const currency = 'COP';
    const reference = order.id;

    // MODO SIMULADO: marcamos el pago como aprobado (simulado) para poder probar.
    if (!isWompiConfigured()) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'pagado (simulado)',
          paymentProvider: 'simulado',
          paymentRef: reference,
        },
      });
      return NextResponse.json({ mock: true, orderNumber: order.orderNumber });
    }

    // MODO REAL: construimos la URL del checkout de Wompi con la firma de integridad.
    const { publicKey, integritySecret } = getWompiConfig();
    const signature = buildIntegritySignature(reference, amountInCents, currency, integritySecret);
    const redirectUrl = `${process.env.NEXTAUTH_URL}/pedido/confirmacion?order=${encodeURIComponent(
      order.id
    )}&n=${order.orderNumber}`;

    const params = new URLSearchParams({
      'public-key': publicKey,
      currency,
      'amount-in-cents': String(amountInCents),
      reference,
      'signature:integrity': signature,
      'redirect-url': redirectUrl,
    });
    if (order.email) params.set('customer-email', order.email);

    const checkoutUrl = `${wompiCheckoutBase()}?${params.toString()}`;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'pendiente',
        paymentProvider: 'wompi',
        paymentRef: reference,
      },
    });

    return NextResponse.json({ mock: false, checkoutUrl, orderNumber: order.orderNumber });
  } catch (err) {
    console.error('Error en checkout Wompi:', err);
    return NextResponse.json({ error: 'Error al iniciar el pago' }, { status: 500 });
  }
}
