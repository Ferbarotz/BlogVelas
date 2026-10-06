'use client';
import { useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { Search } from 'lucide-react';

interface Candle {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  avgRating?: number;
  reviewCount?: number;
}

export function CatalogClient({ candles, categories }: { candles: Candle[]; categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [search, setSearch] = useState('');

  const filtered = (candles ?? []).filter((c: Candle) => {
    const matchCategory = activeCategory === 'Todas' || c.category === activeCategory;
    const matchSearch =
      !search ||
      c.name?.toLowerCase()?.includes(search.toLowerCase()) ||
      c.description?.toLowerCase()?.includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar velas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {(categories ?? []).map((cat: string) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-border hover:border-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">🕯️</p>
          <p className="text-sm mt-2">No se encontraron velas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((candle: Candle) => (
            <ProductCard
              key={candle.id}
              id={candle.id}
              name={candle.name}
              description={candle.description}
              price={candle.price}
              imageUrl={candle.imageUrl ?? ''}
              category={candle.category}
              avgRating={candle.avgRating ?? 0}
              reviewCount={candle.reviewCount ?? 0}
            />
          ))}
        </div>
      )}
    </>
  );
}
