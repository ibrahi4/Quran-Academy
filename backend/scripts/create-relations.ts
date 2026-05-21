import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRelations() {
  try {
    console.log('🔄 Creating Student and Teacher records...\n');

    // ========== STUDENTS ==========
    const studentUsers = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { student: true },
    });

    console.log(`Found ${studentUsers.length} STUDENT users`);

    for (const user of studentUsers) {
      if (user.student) {
        console.log(`  ✅ ${user.email} - Already has student record`);
        continue;
      }

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          level: 'BEGINNER',
          goals: ['Learn Quran', 'Improve Tajweed'],
        },
      });

      console.log(`  ✅ ${user.email} - Created student record (ID: ${student.id})`);
    }

    // ========== TEACHERS ==========
    const teacherUsers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: { teacher: true },
    });

    console.log(`\nFound ${teacherUsers.length} TEACHER users`);

    for (const user of teacherUsers) {
      if (user.teacher) {
        console.log(`  ✅ ${user.email} - Already has teacher record`);
        continue;
      }

      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          hourlyRate: 15.0,
          bio: 'Experienced Quran teacher with years of teaching experience',
          specialties: ['Tajweed', 'Memorization', 'Recitation'],
          experience: 5,
          rating: 5.0,
          isActive: true,
        },
      });

      console.log(`  ✅ ${user.email} - Created teacher record (ID: ${teacher.id})`);
    }

    console.log('\n🎉 All done! Checking results...\n');

    // Verify
    const [studentsCount, teachersCount] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
    ]);

    console.log(`📊 Total Students in DB: ${studentsCount}`);
    console.log(`📊 Total Teachers in DB: ${teachersCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createRelations();
