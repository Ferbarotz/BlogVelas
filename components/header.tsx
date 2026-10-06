'use client';
import Link from 'next/link';
import Image from 'next/image';
import { User, LogIn, LogOut, ShoppingBag } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { ClientOnly } from '@/components/client-only';
import { CartSheet } from '@/components/cart-sheet';

export function Header() {
  const { data: session, status } = useSession() || {};
  const isAdmin = session?.user?.role === 'admin';
  const isAuthed = status === 'authenticated';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/adely-logo.jpeg" alt="Adely Creaciones" width={48} height={48} className="rounded-full object-cover ring-1 ring-primary/20 shadow-sm" />
        </Link>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          <ClientOnly>
            {isAuthed && !isAdmin && (
              <Link
                href="/mis-pedidos"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-foreground transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Mis pedidos</span>
              </Link>
            )}
          </ClientOnly>
          <CartSheet />
          <ClientOnly>
            {isAuthed ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm font-medium bg-primary text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </Link>
            )}
          </ClientOnly>
        </div>
      </div>
    </header>
  );
}
