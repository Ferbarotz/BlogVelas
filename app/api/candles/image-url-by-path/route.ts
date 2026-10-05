export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getFileUrl } from '@/lib/s3';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 });
    const url = await getFileUrl(path, 'image/jpeg', true);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error getting image URL:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
