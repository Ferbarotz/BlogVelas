'use client';
import Link from 'next/link';
import Image from 'next/image';
import { User, LogIn, LogOut, ShoppingBag, LayoutDashboard, UserCircle, ChevronDown, Heart } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { ClientOnly } from '@/components/client-only';
import { CartSheet } from '@/components/cart-sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || '').trim();
  if (!base) return '?';
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export function Header() {
  const { data: session, status } = useSession() || {};
  const isAdmin = session?.user?.role === 'admin';
  const isAuthed = status === 'authenticated';
  const displayName = session?.user?.name || session?.user?.email || 'Mi cuenta';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/adely-logo.jpeg" alt="Adely Creaciones" width={48} height={48} className="rounded-full object-cover ring-1 ring-primary/20 shadow-sm" />
        </Link>
        <div className="flex items-center gap-3">
          <CartSheet />
          <ClientOnly>
            {isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-gray-50 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {initials(session?.user?.name, session?.user?.email)}
                    </span>
                    <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">
                      <UserCircle className="w-4 h-4 mr-2" /> Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Panel admin
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/mis-pedidos" className="cursor-pointer">
                          <ShoppingBag className="w-4 h-4 mr-2" /> Mis pedidos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favoritos" className="cursor-pointer">
                          <Heart className="w-4 h-4 mr-2" /> Mis favoritos
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
