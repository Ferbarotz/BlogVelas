import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user (hidden test account)
  const adminPassword = await bcrypt.hash('hYR*rCyD3k', 10);
  await prisma.user.upsert({
    where: { email: 'abacus-236a8623@example.com' },
    update: {},
    create: {
      email: 'abacus-236a8623@example.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  });

  // Seed owner admin account (for the shop owner)
  const ownerPassword = await bcrypt.hash('BlogVelas2026!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@blogvelas.com' },
    update: { role: 'admin' },
    create: {
      email: 'admin@blogvelas.com',
      password: ownerPassword,
      name: 'Administrador',
      role: 'admin',
    },
  });

  // Seed candles
  const candles = [
    {
      name: 'Vela de Lavanda',
      description: 'Vela aromática con esencia de lavanda natural. Perfecta para relajarte después de un largo día.',
      price: 18.50,
      category: 'Aromáticas',
      imageUrl: 'https://cellardoorbathsupply.com/cdn/shop/products/LavenderFieldsWoodWickCandle_1024x1024_d761ae20-7769-432d-b1ac-c9cbf7400ad2_1024x1024.jpg?v=1677769036',
    },
    {
      name: 'Vela de Vainilla',
      description: 'Dulce aroma de vainilla en un elegante frasco de vidrio. Crea un ambiente cálido y acogedor.',
      price: 22.00,
      category: 'Aromáticas',
      imageUrl: 'https://bigelowchemists.com/cdn/shop/files/1_900x_ab231979-2465-4d7b-bc76-2f2e9628511e.jpg?v=1789674455&width=900',
    },
    {
      name: 'Vela Pilar Dorada',
      description: 'Vela decorativa con acabado metálico dorado. Ideal como centro de mesa o detalle especial.',
      price: 28.00,
      category: 'Decorativas',
      imageUrl: 'https://ak1.ostkcdn.com/images/products/is/images/direct/d97e2babb5f1390ff7204cb62490aea5091e312d/Metallic-Pillar-Candle-3X6.jpg',
    },
    {
      name: 'Vela Floral',
      description: 'Hermosa vela decorativa con diseño de pétalos de flores. Un toque de primavera en cualquier espacio.',
      price: 25.00,
      category: 'Decorativas',
      imageUrl: 'https://www.southlakegifts.com/cdn/shop/files/Cherry_Blossom_Sakura_Petal_Floral_Candle_Cup_2_900x.jpg?v=1774400817',
    },
    {
      name: 'Vela de Soja Natural',
      description: 'Vela ecológica 100% soja natural. Sin parábenos ni químicos. Combustión limpia y duradera.',
      price: 20.00,
      category: 'Naturales',
      imageUrl: 'https://www.slownorth.com/cdn/shop/files/MG17.jpg?v=1772555969&width=2000',
    },
    {
      name: 'Vela de Cera de Abeja',
      description: 'Vela artesanal de cera de abeja pura. Aroma natural a miel y combustión prolongada.',
      price: 24.00,
      category: 'Naturales',
      imageUrl: 'https://www.honeycandlesusa.com/cdn/shop/files/NaturalBeeswaxSquarePillarCandle7InchCase.jpg?v=1697554815',
    },
  ];

  for (const candle of candles) {
    await prisma.candle.upsert({
      where: { id: candle.name.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: {
        id: candle.name.replace(/\s+/g, '-').toLowerCase(),
        ...candle,
        isPublic: true,
        active: true,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
