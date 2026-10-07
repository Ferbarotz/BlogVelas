'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Mail, Calendar, ShoppingBag, Heart, Pencil, Check, X, LogOut, ShieldCheck } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { SafeDate } from '@/components/safe-format';
import { ClientOnly } from '@/components/client-only';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  ordersCount: number;
  favoritesCount: number;
}

function initials(name?: string | null, email?: string) {
  const base = (name || email || '').trim();
  if (!base) return '?';
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default function PerfilPage() {
  return (
    <ClientOnly fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <PerfilBody />
    </ClientOnly>
  );
}

function PerfilBody() {
  const { data: session, status, update } = useSession() || {};
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated') {
      router.replace('/login?callbackUrl=/perfil');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setNameInput(data.name ?? '');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [status, router]);

  const handleSave = async () => {
    const name = nameInput.trim();
    if (!name) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProfile((p) => (p ? { ...p, name: updated.name } : p));
      setEditing(false);
      toast.success('Perfil actualizado');
      try {
        await update?.({ name: updated.name });
      } catch {}
    } catch {
      toast.error('No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const isAdmin = profile.role === 'admin';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-foreground mb-5">
        <ArrowLeft className="w-4 h-4" /> Volver a la tienda
      </Link>

      {/* Tarjeta principal */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary/15 to-accent/30 px-5 py-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
            {initials(profile.name, profile.email)}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-foreground truncate">
              {profile.name || 'Mi perfil'}
            </h1>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
                <ShieldCheck className="w-3 h-3" /> Administrador
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1">
                Cliente
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Nombre editable */}
          <div>
            <label className="text-xs font-medium text-gray-500">Nombre</label>
            {editing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Tu nombre"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  aria-label="Guardar"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setEditing(false); setNameInput(profile.name ?? ''); }}
                  className="w-9 h-9 flex items-center justify-center border border-border text-gray-500 rounded-lg hover:bg-gray-50"
                  aria-label="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-foreground">{profile.name || 'Sin nombre'}</span>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-gray-500">Correo</label>
            <div className="flex items-center gap-2 mt-1 text-sm text-foreground">
              <Mail className="w-4 h-4 text-gray-400" />
              <span suppressHydrationWarning>{profile.email}</span>
            </div>
          </div>

          {/* Miembro desde */}
          <div>
            <label className="text-xs font-medium text-gray-500">Miembro desde</label>
            <div className="flex items-center gap-2 mt-1 text-sm text-foreground">
              <Calendar className="w-4 h-4 text-gray-400" />
              <SafeDate date={profile.createdAt} locale="es-ES" options={{ dateStyle: 'long' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      {!isAdmin && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link href="/mis-pedidos" className="bg-white border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <p className="text-2xl font-bold text-foreground mt-2">{profile.ordersCount}</p>
            <p className="text-xs text-gray-500">Mis pedidos</p>
          </Link>
          <Link href="/favoritos" className="bg-white border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
            <Heart className="w-5 h-5 text-red-500" />
            <p className="text-2xl font-bold text-foreground mt-2">{profile.favoritesCount}</p>
            <p className="text-xs text-gray-500">Favoritos</p>
          </Link>
        </div>
      )}

      {isAdmin && (
        <Link href="/admin" className="block bg-white border border-border rounded-xl p-4 mt-4 hover:border-primary/50 transition-colors text-sm font-medium text-foreground">
          Ir al panel de administración
        </Link>
      )}

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full flex items-center justify-center gap-2 border border-border text-gray-600 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors mt-4"
      >
        <LogOut className="w-4 h-4" /> Cerrar sesión
      </button>
    </div>
  );
}
