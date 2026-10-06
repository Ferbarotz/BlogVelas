'use client';
import { useState, useEffect, useCallback } from 'react';
import { Star, MessageCircle, Send, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ClientOnly } from '@/components/client-only';
import { SafeDate } from '@/components/safe-format';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  author: string | null;
  createdAt: string;
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center" aria-label={`${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={
            n <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
          }
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
          aria-label={`Calificar con ${n} estrella(s)`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              n <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviewsSheet({
  candleId,
  candleName,
  trigger,
}: {
  candleId: string;
  candleName: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-left">
            <MessageCircle className="w-5 h-5 text-primary" /> Opiniones
          </SheetTitle>
          <p className="text-xs text-gray-500 text-left truncate">{candleName}</p>
        </SheetHeader>
        {open ? (
          <ClientOnly fallback={<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>}>
            <ReviewsBody candleId={candleId} />
          </ClientOnly>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ReviewsBody({ candleId }: { candleId: string }) {
  const { data: session } = useSession() || {};
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?candleId=${candleId}`);
      const data = res.ok ? await res.json() : { reviews: [], count: 0, average: 0 };
      setReviews(data.reviews ?? []);
      setCount(data.count ?? 0);
      setAverage(data.average ?? 0);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [candleId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (session?.user?.name) setAuthor((a) => a || session.user!.name!);
  }, [session?.user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Elige una calificación de 1 a 5 estrellas');
      return;
    }
    if (!comment.trim()) {
      toast.error('Escribe tu comentario');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candleId, rating, comment: comment.trim(), author: author.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success('¡Gracias por tu opinión!');
      setRating(0);
      setComment('');
      await load();
    } catch {
      toast.error('No se pudo guardar tu comentario. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Resumen */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
          <span className="text-2xl font-bold text-foreground">{average.toFixed(1)}</span>
          <div>
            <Stars value={average} size={16} />
            <p className="text-[11px] text-gray-500 mt-0.5">
              {count} {count === 1 ? 'opinión' : 'opiniones'}
            </p>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aún no hay opiniones.</p>
            <p className="text-xs text-gray-400 mt-0.5">¡Sé el primero en comentar!</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border border-border rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-foreground truncate">{r.author || 'Anónimo'}</span>
                <Stars value={r.rating} size={13} />
              </div>
              {r.comment ? (
                <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap">{r.comment}</p>
              ) : null}
              <p className="text-[11px] text-gray-400 mt-1.5">
                <SafeDate date={r.createdAt} options={{ dateStyle: 'medium' }} />
              </p>
            </div>
          ))
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="border-t border-border px-4 py-4 space-y-2.5 bg-white">
        <p className="text-sm font-medium text-foreground">Deja tu opinión</p>
        <StarInput value={rating} onChange={setRating} />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Tu nombre (opcional)"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Cuéntanos qué te pareció..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : (
            <><Send className="w-4 h-4" /> Enviar opinión</>
          )}
        </button>
      </form>
    </>
  );
}
