import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding equipments...');

  // Créer les équipements standards
  const equipments = await Promise.all([
    prisma.equipment.upsert({
      where: { name: 'Wifi Haut Débit' },
      update: {},
      create: {
        name: 'Wifi Haut Débit',
        iconRef: 'wifi'
      }
    }),
    prisma.equipment.upsert({
      where: { name: 'Vidéoprojecteur' },
      update: {},
      create: {
        name: 'Vidéoprojecteur',
        iconRef: 'projector'
      }
    }),
    prisma.equipment.upsert({
      where: { name: 'Climatisation' },
      update: {},
      create: {
        name: 'Climatisation',
        iconRef: 'ac'
      }
    }),
    prisma.equipment.upsert({
      where: { name: 'Tableau blanc' },
      update: {},
      create: {
        name: 'Tableau blanc',
        iconRef: 'whiteboard'
      }
    }),
    prisma.equipment.upsert({
      where: { name: 'Machine à café' },
      update: {},
      create: {
        name: 'Machine à café',
        iconRef: 'coffee'
      }
    }),
    prisma.equipment.upsert({
      where: { name: 'Accès PMR' },
      update: {},
      create: {
        name: 'Accès PMR',
        iconRef: 'accessibility'
      }
    }),
    prisma.equipment.upsert({
      where: { name: 'Imprimante / Scanner' },
      update: {},
      create: {
        name: 'Imprimante / Scanner',
        iconRef: 'printer'
      }
    })
  ]);

  console.log(`✅ ${equipments.length} équipements créés/mis à jour`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

