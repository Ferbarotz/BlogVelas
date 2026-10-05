export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const candle = await prisma.candle.findUnique({ where: { id } });
    if (!candle?.cloudStoragePath) {
      return NextResponse.json({ url: candle?.imageUrl ?? null });
    }
    const url = await getFileUrl(
      candle.cloudStoragePath,
      'image/jpeg',
      candle.isPublic
    );
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error getting image URL:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
