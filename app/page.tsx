export const dynamic = 'force-dynamic';
import Image from 'next/image';
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
      {/* Hero de marca */}
      <div className="flex flex-col items-center text-center mb-8 mt-2">
        <Image
          src="/adely-logo.jpeg"
          alt="Adely Creaciones"
          width={160}
          height={160}
          priority
          className="rounded-full object-cover ring-2 ring-primary/20 shadow-md"
        />
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight mt-4">
          Adely Creaciones
        </h1>
        <p className="text-sm text-primary font-medium italic mt-1">
          Pequeños detalles, grandes emociones.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-foreground tracking-tight">
          Nuestra Colección
        </h2>
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
