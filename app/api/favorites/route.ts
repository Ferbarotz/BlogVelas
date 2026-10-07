export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

// GET /api/favorites -> lista de candleIds favoritos del usuario autenticado
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { candleId: true },
  });
  return NextResponse.json({ ids: favorites.map((f) => f.candleId) });
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
