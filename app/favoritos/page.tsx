'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { ClientOnly } from '@/components/client-only';

interface Candle {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  avgRating?: number;
  reviewCount?: number;
}

export default function FavoritosPage() {
  return (
    <ClientOnly fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <FavoritosBody />
    </ClientOnly>
  );
}

function FavoritosBody() {
  const { status } = useSession() || {};
  const router = useRouter();
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated') {
      router.replace('/login?callbackUrl=/favoritos');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/favorites?detailed=1');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setCandles(Array.isArray(data?.candles) ? data.candles : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, router]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/perfil" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-foreground mb-5">
        <ArrowLeft className="w-4 h-4" /> Volver al perfil
      </Link>

      <div className="flex items-center gap-2 mb-5">
        <Heart className="w-5 h-5 text-red-500" />
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">Mis favoritos</h1>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : candles.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Aún no tienes favoritos</p>
          <p className="text-gray-400 text-xs mt-1">Toca el corazón en una vela para guardarla aquí.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-primary hover:underline"
          >
            Explorar el catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {candles.map((candle) => (
            <ProductCard
              key={candle.id}
              id={candle.id}
              name={candle.name}
              description={candle.description}
              price={candle.price}
              imageUrl={candle.imageUrl ?? ''}
              category={candle.category}
              avgRating={candle.avgRating ?? 0}
              reviewCount={candle.reviewCount ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
