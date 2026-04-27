import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@iqa.com';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'IQA',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('Admin user created:', admin.email);
  console.log('Password: Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
