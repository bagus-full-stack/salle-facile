import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

