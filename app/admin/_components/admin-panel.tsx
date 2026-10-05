'use client';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Flame, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { CandleManager } from './candle-manager';
import { OrderManager } from './order-manager';

export function AdminPanel() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">Panel Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestiona tus velas y pedidos</p>
        </div>
        <button
          onClick={() => signOut({ redirectTo: '/' })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>

      <Tabs defaultValue="candles">
        <TabsList className="mb-4">
          <TabsTrigger value="candles" className="flex items-center gap-1.5">
            <Flame className="w-4 h-4" /> Velas
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-1.5">
            <Package className="w-4 h-4" /> Pedidos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="candles">
          <CandleManager />
        </TabsContent>
        <TabsContent value="orders">
          <OrderManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
