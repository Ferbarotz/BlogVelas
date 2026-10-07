export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

// GET /api/profile -> datos del usuario autenticado + contadores
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, favorites: true } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    ordersCount: user._count.orders,
    favoritesCount: user._count.favorites,
  });
}

// PATCH /api/profile { name } -> actualiza el nombre del usuario
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const name: string = (body?.name ?? '').toString().trim();
    if (!name) {
      return NextResponse.json({ error: 'El nombre no puede estar vacío' }, { status: 400 });
    }
    if (name.length > 60) {
      return NextResponse.json({ error: 'El nombre es demasiado largo' }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'No se pudo actualizar el perfil' }, { status: 500 });
  }
}
