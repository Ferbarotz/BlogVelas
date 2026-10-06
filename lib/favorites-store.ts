'use client';
import { create } from 'zustand';

interface FavoritesState {
  ids: string[];
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
  toggle: (id) => {
    set((state) => {
      const exists = state.ids.includes(id);
      const newIds = exists
        ? state.ids.filter((i) => i !== id)
        : [...state.ids, id];
      saveFavorites(newIds);
      return { ids: newIds };
    });
  },
  isFavorite: (id) => get().ids.includes(id),
}));
