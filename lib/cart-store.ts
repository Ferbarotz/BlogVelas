'use client';
import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('adely-cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('adely-cart', JSON.stringify(items));
  } catch {}
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i: CartItem) => i.id === item.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i: CartItem) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }
      saveCart(newItems);
      return { items: newItems };
    });
  },
  removeItem: (id) => {
    set((state) => {
      const newItems = state.items.filter((i: CartItem) => i.id !== id);
      saveCart(newItems);
      return { items: newItems };
    });
  },
  updateQuantity: (id, quantity) => {
    set((state) => {
      const newItems = quantity <= 0
        ? state.items.filter((i: CartItem) => i.id !== id)
        : state.items.map((i: CartItem) =>
            i.id === id ? { ...i, quantity } : i
          );
      saveCart(newItems);
      return { items: newItems };
    });
  },
  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },
  getTotal: () => {
    return get().items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
  },
  getCount: () => {
    return get().items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
  },
}));
