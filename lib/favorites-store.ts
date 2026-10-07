'use client';
import { create } from 'zustand';

interface FavoritesState {
  ids: string[];
  loggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  hydrate: (ids: string[]) => void;
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('adely-favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('adely-favorites', JSON.stringify(ids));
  } catch {}
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: loadFavorites(),
  loggedIn: false,
  setLoggedIn: (v) => set({ loggedIn: v }),
  // Carga desde el servidor (cuenta del usuario) y reemplaza el estado local
  hydrate: (ids) => {
    saveFavorites(ids);
    set({ ids });
  },
  toggle: (id) => {
    const { ids, loggedIn } = get();
    const exists = ids.includes(id);
    const newIds = exists ? ids.filter((i) => i !== id) : [...ids, id];
    saveFavorites(newIds);
    set({ ids: newIds });
    // Si hay sesión, persistir en la cuenta para que sincronice entre dispositivos
    if (loggedIn) {
      fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candleId: id, favorite: !exists }),
      }).catch(() => {});
    }
  },
  isFavorite: (id) => get().ids.includes(id),
}));
