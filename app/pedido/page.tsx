'use client';
import { useCartStore, CartItem } from '@/lib/cart-store';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ClientOnly } from '@/components/client-only';
import { formatCOP } from '@/lib/utils';

function OrderForm() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // Precargar datos del cliente autenticado (nombre de la cuenta y, si existe,
  // el teléfono/dirección de su último pedido) para no pedirlos de nuevo.
  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    setPrefilling(true);
    (async () => {
      try {
        const res = await fetch('/api/orders/mine');
        const orders = res.ok ? await res.json() : [];
        const last = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
        if (cancelled) return;
        setForm((prev) => ({
          ...prev,
          customerName: prev.customerName || last?.customerName || session?.user?.name || '',
          phone: prev.phone || last?.phone || '',
          email: prev.email || last?.email || session?.user?.email || '',
          address: prev.address || last?.address || '',
        }));
      } catch {
        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            customerName: prev.customerName || session?.user?.name || '',
            email: prev.email || session?.user?.email || '',
          }));
        }
      } finally {
        if (!cancelled) setPrefilling(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.name]);

  const total = getTotal();

  if ((items?.length ?? 0) === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">No hay productos en tu carrito</p>
        <Link href="/" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-foreground hover:underline">
          <ArrowLeft className="w-4 h-4" /> Ver catálogo
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName?.trim() || !form.phone?.trim() || !form.address?.trim() || !form.email?.trim()) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i: CartItem) => ({ candleId: i.id, quantity: i.quantity, price: i.price, candleName: i.name, note: i.note ?? '' })),
          total,
        }),
      });
      if (!res.ok) throw new Error('Error al crear pedido');
      const data = await res.json();

      // Iniciar el pago (Wompi o modo simulado)
      const payRes = await fetch('/api/payments/wompi/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data?.id }),
      });
      if (!payRes.ok) throw new Error('Error al iniciar el pago');
      const pay = await payRes.json();

      clearCart();
      if (pay?.mock) {
        router.push(
          `/pedido/pago?order=${encodeURIComponent(pay?.orderId ?? data?.id ?? '')}&n=${
            data?.orderNumber ?? ''
          }&t=${pay?.amount ?? total ?? 0}`
        );
      } else if (pay?.checkoutUrl) {
        window.location.href = pay.checkoutUrl;
      } else {
        router.push(`/pedido/confirmacion?n=${data?.orderNumber ?? ''}`);
      }
    } catch (err: any) {
      toast.error('Error al procesar tu pedido. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-xs text-gray-500 mb-2">{items?.length ?? 0} producto(s)</p>
        <p className="font-bold text-lg text-foreground">Total: {formatCOP(total ?? 0)}</p>
      </div>

      {prefilling ? (
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando tus datos...
        </p>
      ) : status === 'authenticated' ? (
        <p className="text-xs text-primary">Rellenamos tus datos automáticamente. Puedes editarlos si lo necesitas.</p>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Nombre completo *</label>
        <input
          type="text"
          required
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Teléfono *</label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Tu número de teléfono"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Correo electrónico *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="tucorreo@ejemplo.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Dirección de entrega *</label>
        <textarea
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={2}
          placeholder="Calle, número, ciudad..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Notas (opcional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={2}
          placeholder="Instrucciones especiales..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white text-sm font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
        ) : (
          'Continuar al pago'
        )}
      </button>
    </form>
  );
}

export default function PedidoPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/carrito" className="text-gray-400 hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">Datos del Pedido</h1>
      </div>
      <ClientOnly fallback={<div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>}>
        <OrderForm />
      </ClientOnly>
    </div>
  );
}
