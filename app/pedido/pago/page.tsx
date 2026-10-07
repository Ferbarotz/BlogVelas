'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Landmark,
  Lock,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCOP } from '@/lib/utils';

type Method = 'tarjeta' | 'pse' | 'transferencia';

const PSE_BANKS = [
  'Bancolombia',
  'Davivienda',
  'BBVA Colombia',
  'Banco de Bogotá',
  'Banco de Occidente',
  'Banco Caja Social',
  'Scotiabank Colpatria',
  'Banco Popular',
  'Banco AV Villas',
  'Nequi',
  'Daviplata',
];

function PagoContent() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params?.get('order') ?? '';
  const orderNumber = params?.get('n') ?? '';
  const amount = Number(params?.get('t') ?? '0') || 0;

  const [method, setMethod] = useState<Method>('tarjeta');
  const [loading, setLoading] = useState(false);

  // Tarjeta
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '' });
  // PSE
  const [pse, setPse] = useState({ bank: '', personType: 'Natural', docType: 'CC', doc: '' });

  const formatCardNumber = (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim();

  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validate = () => {
    if (method === 'tarjeta') {
      if (card.number.replace(/\s/g, '').length < 13) return 'Ingresa un número de tarjeta válido';
      if (!card.name.trim()) return 'Ingresa el nombre del titular';
      if (card.exp.length < 5) return 'Ingresa la fecha de vencimiento (MM/AA)';
      if (card.cvv.length < 3) return 'Ingresa el CVV';
    } else if (method === 'pse') {
      if (!pse.bank) return 'Selecciona tu banco';
      if (!pse.doc.trim()) return 'Ingresa tu número de documento';
    }
    return '';
  };

  const handlePay = async () => {
    if (!orderId) {
      toast.error('No se encontró el pedido.');
      return;
    }
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payments/wompi/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, method }),
      });
      if (!res.ok) throw new Error('fail');
      router.push(`/pedido/confirmacion?n=${orderNumber}&sim=1`);
    } catch {
      toast.error('No se pudo procesar el pago. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white';

  const tabs: { id: Method; label: string; icon: React.ReactNode }[] = [
    { id: 'tarjeta', label: 'Tarjeta', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'pse', label: 'PSE', icon: <Building2 className="w-4 h-4" /> },
    { id: 'transferencia', label: 'Transferencia', icon: <Landmark className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/pedido" className="text-gray-400 hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">Pago seguro</h1>
      </div>

      {/* Banner modo demo */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2.5 mb-4 text-xs">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          <span className="font-semibold">Modo demostración.</span> Esta es la pantalla de pago. No se
          realizará ningún cobro real; al pagar, tu pedido se marcará como “pagado (demo)”.
        </p>
      </div>

      {/* Resumen a pagar */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total a pagar{orderNumber ? ` • pedido #${orderNumber}` : ''}</p>
          <p className="font-bold text-2xl text-foreground">{formatCOP(amount)}</p>
        </div>
        <Lock className="w-5 h-5 text-primary" />
      </div>

      {/* Selector de método */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMethod(t.id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
              method === t.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-gray-500 hover:border-primary/40'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Formularios por método */}
      {method === 'tarjeta' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Número de tarjeta</label>
            <input
              inputMode="numeric"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
              className={inputClass}
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre del titular</label>
            <input
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              className={inputClass}
              placeholder="Como aparece en la tarjeta"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Vencimiento</label>
              <input
                inputMode="numeric"
                value={card.exp}
                onChange={(e) => setCard({ ...card, exp: formatExp(e.target.value) })}
                className={inputClass}
                placeholder="MM/AA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">CVV</label>
              <input
                inputMode="numeric"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className={inputClass}
                placeholder="123"
              />
            </div>
          </div>
        </div>
      )}

      {method === 'pse' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Banco</label>
            <select
              value={pse.bank}
              onChange={(e) => setPse({ ...pse, bank: e.target.value })}
              className={inputClass}
            >
              <option value="">Selecciona tu banco</option>
              {PSE_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tipo de persona</label>
              <select
                value={pse.personType}
                onChange={(e) => setPse({ ...pse, personType: e.target.value })}
                className={inputClass}
              >
                <option value="Natural">Natural</option>
                <option value="Jurídica">Jurídica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tipo doc.</label>
              <select
                value={pse.docType}
                onChange={(e) => setPse({ ...pse, docType: e.target.value })}
                className={inputClass}
              >
                <option value="CC">C.C.</option>
                <option value="CE">C.E.</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Número de documento</label>
            <input
              inputMode="numeric"
              value={pse.doc}
              onChange={(e) => setPse({ ...pse, doc: e.target.value.replace(/\D/g, '') })}
              className={inputClass}
              placeholder="Número de documento"
            />
          </div>
          <p className="text-xs text-gray-500">
            Serás redirigido al portal de tu banco para autorizar el pago (en el modo real de PSE).
          </p>
        </div>
      )}

      {method === 'transferencia' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 text-sm">
            <p className="font-medium text-foreground mb-2">Transferencia / Bancolombia</p>
            <ul className="space-y-1 text-gray-600">
              <li><span className="text-gray-400">Banco:</span> Bancolombia</li>
              <li><span className="text-gray-400">Tipo de cuenta:</span> Ahorros</li>
              <li><span className="text-gray-400">Número:</span> 000-000000-00</li>
              <li><span className="text-gray-400">Titular:</span> Adely Creaciones</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500">
            Realiza la transferencia por {formatCOP(amount)} y confirma tu pago. (Datos de ejemplo en modo demo.)
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="w-full mt-6 bg-primary text-white text-sm font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Procesando pago...</>
        ) : (
          <><Lock className="w-4 h-4" /> Pagar {formatCOP(amount)}</>
        )}
      </button>

      <p className="text-center text-[11px] text-gray-400 mt-3">
        Pago protegido • Tus datos no se almacenan en modo demostración
      </p>
    </div>
  );
}

export default function PagoPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>}>
      <PagoContent />
    </Suspense>
  );
}
