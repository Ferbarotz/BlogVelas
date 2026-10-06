'use client';
import { Heart, ShoppingCart, Minus, Plus, Pencil } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({ id, name, price, imageUrl: imageUrl ?? '', note: note.trim() || undefined }, quantity);
    toast.success(`${quantity} × ${name} añadido al carrito`);
    setQuantity(1);
    setNote('');
    setShowNote(false);
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
          <button
            onClick={() => setShowNote((s) => !s)}
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1.5 rounded transition-colors ${
              showNote || note ? 'text-primary' : 'text-gray-500 hover:text-foreground'
            }`}
          >
            <Pencil className="w-3 h-3" />
            Nota
          </button>
        </div>

        {showNote && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Aroma, color, dedicatoria..."
            className="w-full mt-2 border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        )}

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
