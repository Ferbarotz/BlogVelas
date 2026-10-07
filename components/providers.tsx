'use client';
import { SessionProvider } from 'next-auth/react';
import { FavoritesSync } from '@/components/favorites-sync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FavoritesSync />
      {children}
    </SessionProvider>
  );
}
