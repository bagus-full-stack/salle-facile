import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
  const email = 'admin@sallefacile.com';
  const password = 'Admin123!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('⚠️  Un admin avec cet email existe déjà.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'SalleFacile',
      accountType: 'INDIVIDUAL',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Administrateur créé avec succès !');
  console.log('──────────────────────────────────');
  console.log(`📧 Email    : ${admin.email}`);
  console.log(`🔑 Mot de passe : ${password}`);
  console.log(`👤 Rôle     : ${admin.role}`);
  console.log('──────────────────────────────────');
}

// Fonction pour exécuter en standalone
async function main() {
  console.log('\n📝 Démarrage: Création de l\'administrateur...');
  try {
    await seedAdmin();
  } catch (e) {
    console.error('❌ Erreur :', e);
    process.exit(1);
  }
}

// Exécuter seulement si appelé directement
if (require.main === module) {
  main()
    .finally(async () => {
      await prisma.$disconnect();
    });
}

