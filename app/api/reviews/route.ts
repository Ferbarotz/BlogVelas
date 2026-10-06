export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

// GET /api/reviews?candleId=xxx -> lista pública de comentarios/calificaciones
export async function GET(req: NextRequest) {
  const candleId = req.nextUrl.searchParams.get('candleId');
  if (!candleId) {
    return NextResponse.json({ error: 'candleId requerido' }, { status: 400 });
  }
  const reviews = await prisma.review.findMany({
    where: { candleId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      rating: true,
      comment: true,
      author: true,
      createdAt: true,
    },
  });
  const count = reviews.length;
  const average =
    count > 0 ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / count : 0;
  return NextResponse.json({ reviews, count, average });
}

// POST /api/reviews -> crea una calificación + comentario (cualquier visitante)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candleId: string = body?.candleId;
    const ratingRaw = Number(body?.rating);
    const comment: string = (body?.comment ?? '').toString().trim();
    const authorInput: string = (body?.author ?? '').toString().trim();

    if (!candleId) {
      return NextResponse.json({ error: 'candleId requerido' }, { status: 400 });
    }
    const rating = Math.max(1, Math.min(5, Math.round(ratingRaw || 0)));
    if (!rating) {
      return NextResponse.json({ error: 'Calificación inválida' }, { status: 400 });
    }
    if (!comment && !authorInput) {
      // permitimos sólo calificación, pero exigimos al menos algo
    }

    const candle = await prisma.candle.findUnique({ where: { id: candleId }, select: { id: true } });
    if (!candle) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const session = await auth();
    const author = authorInput || session?.user?.name || 'Anónimo';

    const review = await prisma.review.create({
      data: {
        candleId,
        rating,
        comment: comment || null,
        author,
        userId: session?.user?.id ?? null,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        author: true,
        createdAt: true,
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Error al guardar el comentario' }, { status: 500 });
  }
}
