'use client';
import { useCartStore, CartItem } from '@/lib/cart-store';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ClientOnly } from '@/components/client-only';

function CartContent() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);

  const total = getTotal();

  if ((items?.length ?? 0) === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-foreground hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {(items ?? []).map((item: CartItem) => (
          <div key={item.id} className="flex gap-3 border border-border rounded-lg p-3 bg-white">
            <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name ?? 'Vela'} fill className="object-cover rounded" sizes="80px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🕯️</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground truncate">{item.name}</h3>
              <p className="text-sm font-bold text-foreground mt-0.5">${item.price?.toFixed?.(2) ?? '0.00'}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 border border-border rounded flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 border border-border rounded flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-bold text-xl text-foreground">${total?.toFixed?.(2) ?? '0.00'}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/pedido"
            className="w-full bg-primary text-white text-sm font-medium py-3 rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            Hacer pedido
          </Link>
          <button
            onClick={clearCart}
            className="w-full border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Vaciar carrito
          </button>
        </div>
      </div>
    </>
  );
}

export default function CarritoPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-gray-400 hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">Mi Carrito</h1>
      </div>
      <ClientOnly fallback={<div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>}>
        <CartContent />
      </ClientOnly>
    </div>
  );
}
