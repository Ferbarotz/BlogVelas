'use client';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get('n') ?? '';

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="font-display text-2xl font-bold text-foreground tracking-tight mb-2">
        ¡Pedido Confirmado!
      </h1>
      {orderNumber && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 inline-block">
          <p className="text-xs text-gray-500">Número de pedido</p>
          <p className="text-2xl font-bold font-mono text-foreground">#{orderNumber}</p>
        </div>
      )}
      <p className="text-sm text-gray-500 mb-6">
        Hemos recibido tu pedido. Te contactaremos pronto para coordinar la entrega.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>
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
