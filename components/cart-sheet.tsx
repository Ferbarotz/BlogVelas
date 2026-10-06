'use client';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore, CartItem } from '@/lib/cart-store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ClientOnly } from '@/components/client-only';

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const count = useCartStore((s) => s.getCount());

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative flex items-center text-gray-600 hover:text-foreground transition-colors"
          aria-label="Abrir carrito"
        >
          <ShoppingCart className="w-5 h-5" />
          <ClientOnly>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [1.4, 1], opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </ClientOnly>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Mi Carrito
          </SheetTitle>
        </SheetHeader>
        <ClientOnly fallback={<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>}>
          <CartSheetBody onClose={() => setOpen(false)} />
        </ClientOnly>
      </SheetContent>
    </Sheet>
  );
}

function CartSheetBody({ onClose }: { onClose: () => void }) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const getCount = useCartStore((s) => s.getCount);
  const total = getTotal();
  const count = getCount();

  if ((items?.length ?? 0) === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <ShoppingCart className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm mb-4">Tu carrito está vacío</p>
        <SheetClose asChild>
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Seguir comprando
          </Link>
        </SheetClose>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {(items ?? []).map((item: CartItem) => (
          <div key={item.id} className="flex gap-3 border border-border rounded-lg p-2.5 bg-white">
            <div className="relative w-16 h-16 bg-gray-100 rounded flex-shrink-0">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name ?? 'Vela'} fill className="object-cover rounded" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">🕯️</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm text-foreground truncate">{item.name}</h3>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {item.note ? (
                <p className="text-[11px] text-gray-500 italic mt-0.5 line-clamp-2">“{item.note}”</p>
              ) : null}
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-bold text-foreground">
                  ${((item.price ?? 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-4 space-y-3 bg-white">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{count} artículo(s)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-bold text-xl text-foreground">${total?.toFixed?.(2) ?? '0.00'}</span>
        </div>
        <SheetClose asChild>
          <Link
            href="/pedido"
            className="w-full bg-primary text-white text-sm font-medium py-3 rounded-lg text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
          >
            Hacer pedido <ArrowRight className="w-4 h-4" />
          </Link>
        </SheetClose>
        <div className="flex gap-2">
          <SheetClose asChild>
            <Link
              href="/carrito"
              className="flex-1 border border-border text-foreground text-sm font-medium py-2.5 rounded-lg text-center hover:bg-gray-50 transition-colors"
            >
              Ver carrito
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <button
              onClick={onClose}
              className="flex-1 border border-border text-gray-600 text-sm font-medium py-2.5 rounded-lg text-center hover:bg-gray-50 transition-colors"
            >
              Seguir comprando
            </button>
          </SheetClose>
        </div>
      </div>
    </>
  );
}
