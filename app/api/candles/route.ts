export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const candles = await prisma.candle.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(candles);
  } catch (error: any) {
    console.error('Error fetching candles:', error);
    return NextResponse.json({ error: 'Error al obtener velas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const candle = await prisma.candle.create({
      data: {
        name: body.name,
        description: body.description ?? '',
        price: parseFloat(body.price) || 0,
        category: body.category ?? 'Sin categoría',
        imageUrl: body.imageUrl ?? null,
        cloudStoragePath: body.cloudStoragePath ?? null,
        isPublic: body.isPublic ?? true,
      },
    });
    return NextResponse.json(candle);
  } catch (error: any) {
    console.error('Error creating candle:', error);
    return NextResponse.json({ error: 'Error al crear vela' }, { status: 500 });
  }
}
