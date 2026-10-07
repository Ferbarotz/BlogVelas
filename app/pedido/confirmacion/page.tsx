'use client';
import { CheckCircle, AlertCircle, Clock, ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type UiState = {
  icon: 'ok' | 'pending' | 'error' | 'loading';
  title: string;
  message: string;
};

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get('n') ?? '';
  const orderId = searchParams?.get('order') ?? '';
  const transactionId = searchParams?.get('id') ?? '';
  const sim = searchParams?.get('sim') ?? '';

  const [ui, setUi] = useState<UiState>(() => {
    if (sim === '1') {
      return {
        icon: 'ok',
        title: '¡Pedido confirmado!',
        message:
          'Tu pago se registró en modo de demostración. Te contactaremos pronto para coordinar la entrega.',
      };
    }
    if (orderId) {
      return { icon: 'loading', title: 'Verificando tu pago...', message: 'Un momento, por favor.' };
    }
    return {
      icon: 'ok',
      title: '¡Pedido confirmado!',
      message: 'Hemos recibido tu pedido. Te contactaremos pronto para coordinar la entrega.',
    };
  });

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams({ orderId });
        if (transactionId) qs.set('transactionId', transactionId);
        const res = await fetch(`/api/payments/wompi/verify?${qs.toString()}`);
        const data = res.ok ? await res.json() : null;
        if (cancelled) return;
        const status: string = data?.status ?? 'pendiente';
        if (status === 'pagado' || status === 'pagado (simulado)') {
          setUi({
            icon: 'ok',
            title: '¡Pago aprobado!',
            message: 'Tu pago fue aprobado. Te contactaremos pronto para coordinar la entrega.',
          });
        } else if (status === 'pendiente') {
          setUi({
            icon: 'pending',
            title: 'Pago en proceso',
            message:
              'Tu pago aún se está procesando. Te avisaremos en cuanto se confirme.',
          });
        } else {
          setUi({
            icon: 'error',
            title: 'El pago no se completó',
            message:
              'No pudimos confirmar tu pago (' +
              status +
              '). Puedes intentarlo de nuevo desde tu carrito.',
          });
        }
      } catch {
        if (!cancelled) {
          setUi({
            icon: 'pending',
            title: 'Pago en proceso',
            message: 'No pudimos verificar el estado ahora mismo. Te avisaremos en cuanto se confirme.',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, transactionId]);

  const Icon =
    ui.icon === 'ok' ? (
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
    ) : ui.icon === 'pending' ? (
      <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
    ) : ui.icon === 'error' ? (
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    ) : (
      <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
    );

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {Icon}
      <h1 className="font-display text-2xl font-bold text-foreground tracking-tight mb-2">{ui.title}</h1>
      {orderNumber && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 inline-block">
          <p className="text-xs text-gray-500">Número de pedido</p>
          <p className="text-2xl font-bold font-mono text-foreground">#{orderNumber}</p>
        </div>
      )}
      <p className="text-sm text-gray-500 mb-6">{ui.message}</p>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/mis-pedidos"
          className="inline-flex items-center justify-center gap-1.5 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" /> Ver mis pedidos
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
