'use client';
import { Heart, ShoppingCart, Minus, Plus, Eye } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useFavoritesStore } from '@/lib/favorites-store';
import { ProductReviewsSheet, Stars } from '@/components/product-reviews-sheet';
import { ClientOnly } from '@/components/client-only';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  avgRating?: number;
  reviewCount?: number;
}

export function ProductCard({ id, name, description, price, imageUrl, category, avgRating = 0, reviewCount = 0 }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const liked = favoriteIds.includes(id);

  const handleAddToCart = () => {
    addItem({ id, name, price, imageUrl: imageUrl ?? '' }, quantity);
    toast.success(`${quantity} × ${name} añadido al carrito`);
    setQuantity(1);
  };

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        {!imgError && imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🕯️</span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-white/90 text-[11px] font-medium text-gray-600 px-2 py-0.5 rounded">
          {category}
        </span>
        <ClientOnly>
          <button
            onClick={() => toggleFavorite(id)}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full hover:bg-white transition-colors"
            aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                liked ? 'fill-red-500 text-red-500' : 'text-gray-500'
              }`}
            />
          </button>
        </ClientOnly>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-foreground text-sm tracking-tight">{name}</h3>

        {/* Calificación */}
        <div className="flex items-center gap-1.5 mt-1">
          <Stars value={avgRating} size={13} />
          <span className="text-[11px] text-gray-400">
            {reviewCount > 0 ? `${avgRating.toFixed(1)} (${reviewCount})` : 'Sin opiniones'}
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{description}</p>
        <span className="font-bold text-foreground text-base mt-3">${price?.toFixed?.(2) ?? '0.00'}</span>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-md"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-medium w-7 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-md"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <ProductReviewsSheet
            candleId={id}
            candleName={name}
            trigger={
              <button
                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded border border-border text-gray-600 hover:text-foreground hover:border-gray-400 transition-colors"
                aria-label="Ver opiniones"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver
              </button>
            }
          />
        </div>

        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-medium px-3 py-2.5 rounded hover:bg-primary/90 transition-colors mt-3"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
