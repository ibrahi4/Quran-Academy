import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get existing users
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
  const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' } });

  // Create student records
  for (const student of students) {
    const exists = await prisma.student.findUnique({ where: { userId: student.id } });
    if (!exists) {
      await prisma.student.create({
        data: { userId: student.id, level: 'BEGINNER' },
      });
      console.log('✅ Created student for:', student.email);
    }
  }

  // Create teacher records
  for (const teacher of teachers) {
    const exists = await prisma.teacher.findUnique({ where: { userId: teacher.id } });
    if (!exists) {
      await prisma.teacher.create({
        data: { userId: teacher.id, hourlyRate: 15.0 },
      });
      console.log('✅ Created teacher for:', teacher.email);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
