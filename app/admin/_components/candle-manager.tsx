'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Candle {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  cloudStoragePath: string | null;
  isPublic: boolean;
}

const CATEGORIES = ['Aromáticas', 'Decorativas', 'Naturales'];

export function CandleManager() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Candle | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
    imageUrl: '',
    cloudStoragePath: '',
    isPublic: true,
  });

  const fetchCandles = async () => {
    try {
      const res = await fetch('/api/candles');
      const data = await res.json();
      setCandles(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Error al cargar velas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandles(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: CATEGORIES[0], imageUrl: '', cloudStoragePath: '', isPublic: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (candle: Candle) => {
    setEditing(candle);
    setForm({
      name: candle.name ?? '',
      description: candle.description ?? '',
      price: String(candle.price ?? ''),
      category: candle.category ?? CATEGORIES[0],
      imageUrl: candle.imageUrl ?? '',
      cloudStoragePath: candle.cloudStoragePath ?? '',
      isPublic: candle.isPublic ?? true,
    });
    setShowForm(true);
  };

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const res = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      if (!res.ok) throw new Error('Failed to get presigned URL');
      const { uploadUrl, cloud_storage_path } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      // Get the public URL
      const urlRes = await fetch(`/api/candles/image-url-by-path?path=${encodeURIComponent(cloud_storage_path)}`);
      let imageUrl = '';
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        imageUrl = urlData?.url ?? '';
      }

      setForm((f) => ({ ...f, imageUrl, cloudStoragePath: cloud_storage_path, isPublic: true }));
      toast.success('Imagen subida correctamente');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/candles/${editing.id}` : '/api/candles';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(editing ? 'Vela actualizada' : 'Vela creada');
      resetForm();
      fetchCandles();
    } catch {
      toast.error('Error al guardar vela');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta vela?')) return;
    try {
      const res = await fetch(`/api/candles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Vela eliminada');
      fetchCandles();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-foreground">Velas ({candles?.length ?? 0})</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1 text-sm font-medium bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      {showForm && (
        <div className="border border-border rounded-lg p-4 mb-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm text-foreground">{editing ? 'Editar Vela' : 'Nueva Vela'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Foto</label>
              <div className="flex items-center gap-3">
                {form.imageUrl ? (
                  <div className="relative w-16 h-16 rounded bg-gray-200">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover rounded" sizes="64px" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-2xl">🕯️</div>
                )}
                <label className="flex items-center gap-1 cursor-pointer text-sm text-foreground font-medium border border-gray-300 px-3 py-2 rounded-lg hover:bg-white transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Subiendo...' : 'Subir foto'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target?.files?.[0];
                      if (file) handleUploadImage(file);
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  {CATEGORIES.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : (editing ? 'Actualizar' : 'Crear Vela')}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Cargando velas...</div>
      ) : (candles?.length ?? 0) === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No hay velas aún</div>
      ) : (
        <div className="space-y-2">
          {(candles ?? []).map((candle: Candle) => (
            <div key={candle.id} className="flex items-center gap-3 border border-border rounded-lg p-3 bg-white">
              <div className="relative w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                {candle.imageUrl ? (
                  <Image src={candle.imageUrl} alt={candle.name ?? 'Vela'} fill className="object-cover rounded" sizes="48px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">🕯️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{candle.name}</p>
                <p className="text-xs text-gray-500">${candle.price?.toFixed?.(2) ?? '0.00'} · {candle.category}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(candle)} className="p-1.5 text-gray-400 hover:text-foreground">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(candle.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
