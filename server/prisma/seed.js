// Prisma Seed Script
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'mathematics' },
      update: {},
      create: {
        name: 'Mathematics',
        slug: 'mathematics',
        color: '#7c5ce7',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Programming',
        slug: 'programming',
        color: '#00d4ff',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'science' },
      update: {},
      create: {
        name: 'Science',
        slug: 'science',
        color: '#00c896',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'literature' },
      update: {},
      create: {
        name: 'Literature',
        slug: 'literature',
        color: '#f5a623',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'general' },
      update: {},
      create: {
        name: 'General',
        slug: 'general',
        color: '#9898b0',
      },
    }),
  ]);

  console.log('✓ Categories seeded:', categories.map((c) => c.name).join(', '));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
