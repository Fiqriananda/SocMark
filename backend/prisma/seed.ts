import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding master roles...');

  const roles = [
    {
      id: 'REGULAR_USER',
      name: 'Regular User (Buyer)',
      description: 'Akun default untuk konsumsi sosial dan belanja',
    },
    {
      id: 'CONTENT_CREATOR',
      name: 'Content Creator',
      description: 'Pengguna yang terverifikasi untuk memproduksi konten media',
    },
    {
      id: 'MERCHANT',
      name: 'Merchant (Seller)',
      description: 'Penjual resmi dengan etalase dan gudang pengiriman',
    },
    {
      id: 'ADMIN',
      name: 'Admin (Internal)',
      description: 'Tim operasional & moderasi kepatuhan platform',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });
  }

  console.log('Master roles seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
