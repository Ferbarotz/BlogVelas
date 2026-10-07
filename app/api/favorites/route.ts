export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

// GET /api/favorites -> lista de candleIds favoritos del usuario autenticado
// GET /api/favorites?detailed=1 -> incluye además los datos completos de cada vela favorita
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { candleId: true },
  });
  const ids = favorites.map((f) => f.candleId);

  const detailed = req.nextUrl.searchParams.get('detailed');
  if (!detailed) {
    return NextResponse.json({ ids });
  }

  // Datos completos de las velas favoritas (solo activas), con calificaciones.
  const candlesRaw = await prisma.candle.findMany({
    where: { id: { in: ids }, active: true },
    include: { reviews: { select: { rating: true } } },
  });
  // Mantener el orden de favoritos (más reciente primero).
  const byId = new Map(candlesRaw.map((c) => [c.id, c]));
  const candles = ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((c: any) => {
      const reviewCount = c.reviews?.length ?? 0;
      const avgRating =
        reviewCount > 0
          ? c.reviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) / reviewCount
          : 0;
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        price: c.price,
        imageUrl: c.imageUrl,
        category: c.category,
        avgRating,
        reviewCount,
      };
    });

  return NextResponse.json({ ids, candles });
}

// POST /api/favorites { candleId, favorite: boolean } -> agrega/quita favorito
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const candleId: string = body?.candleId;
    const favorite: boolean = !!body?.favorite;
    if (!candleId) {
      return NextResponse.json({ error: 'candleId requerido' }, { status: 400 });
    }
    if (favorite) {
      await prisma.favorite.upsert({
        where: { userId_candleId: { userId: session.user.id, candleId } },
        create: { userId: session.user.id, candleId },
        update: {},
      });
    } else {
      await prisma.favorite.deleteMany({
        where: { userId: session.user.id, candleId },
      });
    }
    return NextResponse.json({ ok: true, favorite });
  } catch (err) {
    return NextResponse.json({ error: 'Error al actualizar favorito' }, { status: 500 });
  }
}
