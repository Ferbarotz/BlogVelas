export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { deleteFile } from '@/lib/s3';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const candle = await prisma.candle.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? '',
        price: parseFloat(body.price) || 0,
        category: body.category ?? 'Sin categoría',
        imageUrl: body.imageUrl ?? undefined,
        cloudStoragePath: body.cloudStoragePath ?? undefined,
        isPublic: body.isPublic ?? true,
      },
    });
    return NextResponse.json(candle);
  } catch (error: any) {
    console.error('Error updating candle:', error);
    return NextResponse.json({ error: 'Error al actualizar vela' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const { id } = await params;
    const candle = await prisma.candle.findUnique({ where: { id } });
    if (candle?.cloudStoragePath) {
      try { await deleteFile(candle.cloudStoragePath); } catch {}
    }
    await prisma.candle.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting candle:', error);
    return NextResponse.json({ error: 'Error al eliminar vela' }, { status: 500 });
  }
}
