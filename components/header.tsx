'use client';
import Link from 'next/link';
import { ShoppingCart, Flame, User } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useSession } from 'next-auth/react';
import { ClientOnly } from '@/components/client-only';

export function Header() {
  const count = useCartStore((s) => s.getCount());
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-foreground" />
          <span className="font-display font-bold text-lg text-foreground tracking-tight">BlogVelas</span>
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
          <Link
            href="/carrito"
            className="relative flex items-center gap-1 text-gray-600 hover:text-foreground transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <ClientOnly fallback={<span className="text-xs font-medium">0</span>}>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </ClientOnly>
          </Link>
        </div>
      </div>
    </header>
  );
}
