'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Loader2, ShoppingBag } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';
import { ClientOnly } from '@/components/client-only';

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  enviado: 'Enviado',
  entregado: 'Entregado',
};
const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  enviado: 'bg-purple-100 text-purple-800',
  entregado: 'bg-green-100 text-green-800',
};

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  candleName: string;
  note?: string | null;
  candle: { name: string; imageUrl: string | null } | null;
}
interface Order {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

function MisPedidosContent() {
  const { status } = useSession() || {};
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/mis-pedidos');
      return;
    }
    if (status !== 'authenticated') return;
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/orders/mine');
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setOrders(Array.isArray(data) ? data : []);
      } catch {
        if (active) setOrders([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if ((orders?.length ?? 0) === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Todavía no has hecho ningún pedido</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-foreground hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="border border-border rounded-lg bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-mono font-bold text-foreground">#{order.orderNumber}</p>
              <p className="text-xs text-gray-500">
                <SafeDate date={order.createdAt} options={{ dateStyle: 'medium' }} />
              </p>
            </div>
            <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <div className="border-t border-border pt-2 space-y-1">
            {(order.items ?? []).map((item) => (
              <div key={item.id} className="text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>{item.candle?.name ?? item.candleName ?? 'Vela'} x{item.quantity}</span>
                  <span>${(item.price * item.quantity)?.toFixed?.(2) ?? '0.00'}</span>
                </div>
                {item.note ? (
                  <p className="text-[11px] text-primary italic mt-0.5">✎ {item.note}</p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t border-border mt-2 pt-2">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-sm font-bold text-foreground">${order.total?.toFixed?.(2) ?? '0.00'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MisPedidosPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-gray-400 hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" /> Mis Pedidos
        </h1>
      </div>
      <ClientOnly fallback={<div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>}>
        <MisPedidosContent />
      </ClientOnly>
    </div>
  );
}
