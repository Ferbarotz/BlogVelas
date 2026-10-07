'use client';
import { useState, useEffect } from 'react';
import { formatCOP } from '@/lib/utils';
import { ChevronDown, Phone, MapPin, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { SafeDate } from '@/components/safe-format';

const STATUSES = ['pendiente', 'en_proceso', 'enviado', 'entregado'];
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

function paymentBadge(ps?: string) {
  const v = (ps ?? 'pendiente').toLowerCase();
  if (v.startsWith('pagado')) return { label: v.includes('simulado') ? 'Pagado (demo)' : 'Pagado', cls: 'bg-green-100 text-green-800' };
  if (v === 'rechazado' || v === 'error') return { label: 'Pago rechazado', cls: 'bg-red-100 text-red-800' };
  if (v === 'anulado') return { label: 'Pago anulado', cls: 'bg-gray-200 text-gray-700' };
  return { label: 'Pago pendiente', cls: 'bg-orange-100 text-orange-800' };
}

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
  customerName: string;
  phone: string;
  address: string;
  notes: string | null;
  status: string;
  paymentStatus?: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Estado actualizado');
      fetchOrders();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Cargando pedidos...</div>;
  if ((orders?.length ?? 0) === 0) return <div className="text-center py-10 text-gray-400 text-sm">No hay pedidos aún</div>;

  return (
    <div className="space-y-3">
      <h2 className="font-display font-semibold text-foreground mb-2">Pedidos ({orders?.length ?? 0})</h2>
      {(orders ?? []).map((order: Order) => (
        <div key={order.id} className="border border-border rounded-lg bg-white">
          <button
            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            className="w-full flex items-center justify-between p-3 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-foreground">#{order.orderNumber}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${paymentBadge(order.paymentStatus).cls}`}>
                {paymentBadge(order.paymentStatus).label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{formatCOP(order.total)}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedOrder === order.id && (
            <div className="px-3 pb-3 border-t border-gray-100 pt-3 space-y-3">
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium text-foreground">{order.customerName}</p>
                <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</p>
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.address}</p>
                {order.notes && <p className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {order.notes}</p>}
                <p className="text-gray-400">
                  <SafeDate date={order.createdAt} options={{ dateStyle: 'medium', timeStyle: 'short' }} />
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Productos:</p>
                {(order.items ?? []).map((item: OrderItem) => (
                  <div key={item.id} className="text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>{item.candle?.name ?? item.candleName ?? 'Vela'} x{item.quantity}</span>
                      <span>{formatCOP(item.price * item.quantity)}</span>
                    </div>
                    {item.note ? (
                      <p className="text-[11px] text-primary italic mt-0.5">✎ {item.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Cambiar estado:</p>
                <div className="flex flex-wrap gap-1">
                  {STATUSES.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(order.id, s)}
                      disabled={order.status === s}
                      className={`text-[10px] font-medium px-2 py-1 rounded-full border transition-colors ${
                        order.status === s
                          ? 'border-primary bg-primary text-white'
                          : 'border-border text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
