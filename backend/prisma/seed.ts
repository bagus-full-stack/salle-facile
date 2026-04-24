import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './seed-admin';
import { seedEquipments } from './seed-equipments';

const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('🌱 Démarrage du seeding Prisma');
  console.log('========================================');

  try {
    console.log('\n📝 Démarrage: Création de l\'administrateur...');
    await seedAdmin();

    console.log('\n📝 Démarrage: Seeding equipments...');
    await seedEquipments();

    console.log('\n========================================');
    console.log('✨ Seeding complété avec succès !');
    console.log('========================================\n');
  } catch (e) {
    console.error('\n❌ Erreur lors du seeding :', e);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });



