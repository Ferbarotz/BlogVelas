'use client';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export function ProductCard({ id, name, description, price, imageUrl, category }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({ id, name, price, imageUrl: imageUrl ?? '' });
    toast.success(`${name} añadido al carrito`);
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
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full hover:bg-white transition-colors"
          aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked ? 'fill-red-500 text-red-500' : 'text-gray-500'
            }`}
          />
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-foreground text-sm tracking-tight">{name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-foreground text-base">${price?.toFixed?.(2) ?? '0.00'}</span>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-medium px-3 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
