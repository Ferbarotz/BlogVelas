export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { CatalogClient } from './_components/catalog-client';

export default async function HomePage() {
  const candles = await prisma.candle.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = ['Todas', ...new Set(candles.map((c: any) => c.category))];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          Nuestra Colección
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Velas artesanales hechas con amor para iluminar tus momentos.
        </p>
      </div>
      <CatalogClient
        candles={JSON.parse(JSON.stringify(candles))}
        categories={categories}
      />
    </div>
  );
}
