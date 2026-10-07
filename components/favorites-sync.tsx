'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useFavoritesStore } from '@/lib/favorites-store';

/**
 * Mantiene los favoritos sincronizados con la cuenta del usuario.
 * - Al iniciar sesión: sube los favoritos locales (de invitado) a la cuenta
 *   y luego carga la lista completa del servidor, para que coincidan entre
 *   dispositivos (PC y celular con el mismo usuario).
 * - Sin sesión: se mantiene sólo el localStorage del dispositivo.
 */
export function FavoritesSync() {
  const { data: session, status } = useSession() || {};
  const setLoggedIn = useFavoritesStore((s) => s.setLoggedIn);
  const hydrate = useFavoritesStore((s) => s.hydrate);

  useEffect(() => {
    if (status === 'loading') return;
    const loggedIn = !!session?.user?.id;
    setLoggedIn(loggedIn);
    if (!loggedIn) return;

    let cancelled = false;
    (async () => {
      try {
        // Favoritos locales previos (de cuando no había sesión)
        const local: string[] = useFavoritesStore.getState().ids ?? [];
        // 1) Traer los de la cuenta
        const res = await fetch('/api/favorites');
        const data = res.ok ? await res.json() : { ids: [] };
        const serverIds: string[] = data.ids ?? [];
        // 2) Subir los locales que no estén en el servidor (merge)
        const toUpload = local.filter((id) => !serverIds.includes(id));
        await Promise.all(
          toUpload.map((id) =>
            fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ candleId: id, favorite: true }),
            }).catch(() => {})
          )
        );
        // 3) Estado final = unión
        const merged = Array.from(new Set([...serverIds, ...local]));
        if (!cancelled) hydrate(merged);
      } catch {
        // sin conexión: se queda con el estado local
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id, setLoggedIn, hydrate]);

  return null;
}
