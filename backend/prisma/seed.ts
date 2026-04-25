import { PrismaClient, Role, Locale } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('?? Seeding database...\n');

  // ===== 1. ADMIN USER =====
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iqa.com' },
    update: {},
    create: {
      email: 'admin@iqa.com',
      password: adminPassword,
      firstName: 'Ibrahim',
      lastName: 'Admin',
      role: Role.ADMIN,
      locale: Locale.EN,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('? Admin user created:', admin.email);

  // ===== 2. TEACHER USER =====
  const teacherPassword = await bcrypt.hash('Teacher123!', 12);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@iqa.com' },
    update: {},
    create: {
      email: 'teacher@iqa.com',
      password: teacherPassword,
      firstName: 'Ahmed',
      lastName: 'Teacher',
      role: Role.TEACHER,
      locale: Locale.AR,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('? Teacher user created:', teacher.email);

  // ===== 3. STUDENT USERS =====
  const studentPassword = await bcrypt.hash('Student123!', 12);
  const students = [
    { email: 'sarah@test.com', firstName: 'Sarah', lastName: 'Ahmed', locale: Locale.EN },
    { email: 'omar@test.com', firstName: 'Omar', lastName: 'Hassan', locale: Locale.AR },
    { email: 'fatima@test.com', firstName: 'Fatima', lastName: 'Ali', locale: Locale.EN },
  ];

  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        ...s,
        password: studentPassword,
        role: Role.STUDENT,
        isActive: true,
        emailVerified: true,
      },
    });
    console.log('? Student created:', user.email);
  }

  // ===== 4. PLANS =====
  const plans = [
    {
      slug: 'trial',
      nameEn: 'Free Trial',
      nameAr: 'ÊÌÑÈÉ ãÌÇäíÉ',
      descriptionEn: 'Try one free session to experience our teaching method',
      descriptionAr: 'ÌÑÈ ÍÕÉ ãÌÇäíÉ æÇÍÏÉ áÊÌÑÈÉ ØÑíŞÊäÇ İí ÇáÊÏÑíÓ',
      priceMonthly: 0,
      priceYearly: 0,
      sessionsPerWeek: 1,
      sessionDuration: 30,
      features: ['1 free session', 'No commitment', 'Meet your teacher'],
      isActive: true,
      sortOrder: 0,
    },
    {
      slug: 'basic',
      nameEn: 'Basic Plan',
      nameAr: 'ÇáÎØÉ ÇáÃÓÇÓíÉ',
      descriptionEn: 'Perfect for beginners - 2 sessions per week',
      descriptionAr: 'ãËÇáíÉ ááãÈÊÏÆíä - ÍÕÊÇä İí ÇáÃÓÈæÚ',
      priceMonthly: 49.99,
      priceYearly: 479.99,
      sessionsPerWeek: 2,
      sessionDuration: 45,
      features: [
        '2 sessions per week',
        '45 min each session',
        'Progress tracking',
        'WhatsApp support',
        'Monthly progress report',
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: 'premium',
      nameEn: 'Premium Plan',
      nameAr: 'ÇáÎØÉ ÇáããíÒÉ',
      descriptionEn: 'Our most popular plan - 4 sessions per week',
      descriptionAr: 'ÎØÊäÇ ÇáÃßËÑ ÔÚÈíÉ - 4 ÍÕÕ İí ÇáÃÓÈæÚ',
      priceMonthly: 89.99,
      priceYearly: 863.99,
      sessionsPerWeek: 4,
      sessionDuration: 60,
      features: [
        '4 sessions per week',
        '60 min each session',
        'Progress tracking',
        'Priority WhatsApp support',
        'Weekly progress report',
        'Recording access',
        'Personalized curriculum',
      ],
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: 'family',
      nameEn: 'Family Plan',
      nameAr: 'ÎØÉ ÇáÚÇÆáÉ',
      descriptionEn: 'Best value for families - up to 3 children',
      descriptionAr: 'ÃİÖá ŞíãÉ ááÚÇÆáÇÊ - ÍÊì 3 ÃØİÇá',
      priceMonthly: 149.99,
      priceYearly: 1439.99,
      sessionsPerWeek: 6,
      sessionDuration: 60,
      features: [
        'Up to 3 children',
        '2 sessions per child/week',
        '60 min each session',
        'Family dashboard',
        'Priority support',
        'Weekly reports per child',
        'Recording access',
        'Personalized curriculum',
      ],
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log('? Plan created:', plan.nameEn);
  }

  // ===== 5. BLOG POSTS =====
  const blogPosts = [
    {
      slug: 'how-to-memorize-quran-effectively',
      titleEn: 'How to Memorize the Quran Effectively: A Complete Guide',
      titleAr: 'ßíİ ÊÍİÙ ÇáŞÑÂä ÈİÚÇáíÉ: Ïáíá ÔÇãá',
      contentEn: `<h2>Introduction</h2>
<p>Memorizing the Quran is one of the most rewarding spiritual journeys a Muslim can undertake. With the right approach, dedication, and guidance, anyone can achieve this noble goal.</p>
<h2>1. Set a Clear Schedule</h2>
<p>Consistency is key. Set aside specific times each day for memorization, preferably after Fajr prayer when the mind is fresh.</p>
<h2>2. Start with Short Surahs</h2>
<p>Begin with Juz Amma (30th part) which contains shorter surahs. This builds confidence and momentum.</p>
<h2>3. Use Repetition</h2>
<p>Repeat each verse at least 20 times before moving to the next. This embeds it in your long-term memory.</p>
<h2>4. Listen to Recitations</h2>
<p>Listen to renowned reciters like Mishary Rashid Alafasy or Abdul Rahman Al-Sudais to perfect your pronunciation.</p>
<h2>5. Find a Qualified Teacher</h2>
<p>A good teacher corrects your mistakes and keeps you accountable. Online Quran academies make this accessible worldwide.</p>`,
      contentAr: `<h2>ãŞÏãÉ</h2>
<p>ÍİÙ ÇáŞÑÂä ãä ÃÚÙã ÇáÑÍáÇÊ ÇáÑæÍíÉ ÇáÊí íãßä ááãÓáã ÇáŞíÇã ÈåÇ. ãÚ ÇáäåÌ ÇáÕÍíÍ æÇáÊİÇäí æÇáÊæÌíå¡ íãßä áÃí ÔÎÕ ÊÍŞíŞ åĞÇ ÇáåÏİ ÇáäÈíá.</p>
<h2>1. ÖÚ ÌÏæáÇğ æÇÖÍÇğ</h2>
<p>ÇáÇÓÊãÑÇÑíÉ åí ÇáãİÊÇÍ. ÎÕÕ ÃæŞÇÊÇğ ãÍÏÏÉ ßá íæã ááÍİÙ¡ æíİÖá ÈÚÏ ÕáÇÉ ÇáİÌÑ.</p>`,
      excerptEn: 'A comprehensive guide to memorizing the Quran with practical tips and proven methods.',
      excerptAr: 'Ïáíá ÔÇãá áÍİÙ ÇáŞÑÂä ãÚ äÕÇÆÍ ÚãáíÉ æÃÓÇáíÈ ãÌÑÈÉ.',
      tags: ['quran', 'memorization', 'tips', 'guide'],
      published: true,
      publishedAt: new Date('2024-12-01'),
    },
    {
      slug: 'importance-of-tajweed',
      titleEn: 'The Importance of Tajweed: Why Proper Recitation Matters',
      titleAr: 'ÃåãíÉ ÇáÊÌæíÏ: áãÇĞÇ Êåã ÇáÊáÇæÉ ÇáÕÍíÍÉ',
      contentEn: `<h2>What is Tajweed?</h2>
<p>Tajweed literally means "to make better" or "to improve." In Quranic context, it refers to the set of rules governing pronunciation during recitation of the Quran.</p>
<h2>Why is Tajweed Important?</h2>
<p>Allah says in the Quran: "And recite the Quran with measured recitation" (73:4). Tajweed ensures we recite the Quran as it was revealed to Prophet Muhammad (PBUH).</p>
<h2>Common Tajweed Mistakes</h2>
<p>Many beginners struggle with proper pronunciation of letters like Ú, Í, and Õ. A qualified teacher can help identify and correct these mistakes.</p>`,
      contentAr: `<h2>ãÇ åæ ÇáÊÌæíÏ¿</h2>
<p>ÇáÊÌæíÏ İí ÇááÛÉ íÚäí ÇáÊÍÓíä. æİí ÇáÓíÇŞ ÇáŞÑÂäí¡ íÔíÑ Åáì ãÌãæÚÉ ÇáŞæÇÚÏ ÇáÊí ÊÍßã ÇáäØŞ ÃËäÇÁ ÊáÇæÉ ÇáŞÑÂä ÇáßÑíã.</p>`,
      excerptEn: 'Understanding why Tajweed is essential for every Muslim who wants to recite the Quran correctly.',
      excerptAr: 'İåã áãÇĞÇ ÇáÊÌæíÏ ÖÑæÑí áßá ãÓáã íÑíÏ ÊáÇæÉ ÇáŞÑÂä ÈÔßá ÕÍíÍ.',
      tags: ['tajweed', 'recitation', 'quran', 'rules'],
      published: true,
      publishedAt: new Date('2024-12-15'),
    },
    {
      slug: 'online-quran-learning-benefits',
      titleEn: '7 Benefits of Learning Quran Online',
      titleAr: '7 İæÇÆÏ áÊÚáã ÇáŞÑÂä ÃæäáÇíä',
      contentEn: `<h2>The Digital Age of Quran Learning</h2>
<p>Technology has made Quran education accessible to everyone, everywhere. Here are 7 key benefits:</p>
<h3>1. Learn from Anywhere</h3>
<p>No need to travel. Learn from the comfort of your home.</p>
<h3>2. Flexible Scheduling</h3>
<p>Choose times that work for your family's schedule.</p>
<h3>3. One-on-One Attention</h3>
<p>Private sessions mean personalized learning at your pace.</p>
<h3>4. Qualified Teachers Worldwide</h3>
<p>Access the best teachers regardless of location.</p>
<h3>5. Safe Learning Environment</h3>
<p>Especially important for children learning from home.</p>
<h3>6. Recorded Sessions</h3>
<p>Review lessons anytime to reinforce learning.</p>
<h3>7. Affordable</h3>
<p>Online classes are often more affordable than in-person alternatives.</p>`,
      contentAr: `<h2>ÇáÚÕÑ ÇáÑŞãí áÊÚáã ÇáŞÑÂä</h2>
<p>ÌÚáÊ ÇáÊßäæáæÌíÇ ÊÚáíã ÇáŞÑÂä ãÊÇÍÇğ ááÌãíÚ İí ßá ãßÇä.</p>`,
      excerptEn: 'Discover why online Quran learning is becoming the preferred choice for families worldwide.',
      excerptAr: 'ÇßÊÔİ áãÇĞÇ ÃÕÈÍ ÊÚáã ÇáŞÑÂä ÃæäáÇíä ÇáÎíÇÑ ÇáãİÖá ááÚÇÆáÇÊ Íæá ÇáÚÇáã.',
      tags: ['online-learning', 'quran', 'benefits', 'education'],
      published: true,
      publishedAt: new Date('2025-01-10'),
    },
    {
      slug: 'noor-al-bayan-method',
      titleEn: 'Noor Al-Bayan: The Best Method to Teach Children Arabic Reading',
      titleAr: 'äæÑ ÇáÈíÇä: ÃİÖá ØÑíŞÉ áÊÚáíã ÇáÃØİÇá ÇáŞÑÇÁÉ ÇáÚÑÈíÉ',
      contentEn: `<h2>What is Noor Al-Bayan?</h2>
<p>Noor Al-Bayan is a structured curriculum designed to teach Arabic reading from zero. It takes students from recognizing letters to reading the Quran fluently.</p>
<h2>Why Choose Noor Al-Bayan?</h2>
<p>It uses a progressive, phonics-based approach that children find engaging and easy to follow. Most students can read basic Arabic within 3-6 months.</p>`,
      contentAr: `<h2>ãÇ åæ äæÑ ÇáÈíÇä¿</h2>
<p>äæÑ ÇáÈíÇä åæ ãäåÌ ãäÙã ãÕãã áÊÚáíã ÇáŞÑÇÁÉ ÇáÚÑÈíÉ ãä ÇáÕİÑ.</p>`,
      excerptEn: 'Learn about the Noor Al-Bayan method and why it is the most effective way to teach children Arabic reading.',
      excerptAr: 'ÊÚÑİ Úáì ØÑíŞÉ äæÑ ÇáÈíÇä æáãÇĞÇ åí ÃßËÑ ÇáØÑŞ İÚÇáíÉ áÊÚáíã ÇáÃØİÇá ÇáŞÑÇÁÉ ÇáÚÑÈíÉ.',
      tags: ['noor-albayan', 'children', 'arabic', 'reading'],
      published: true,
      publishedAt: new Date('2025-02-01'),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: {
        ...post,
        authorId: admin.id,
        locale: Locale.EN,
      },
    });
    console.log('? Blog post created:', post.slug);
  }

  // ===== 6. TESTIMONIALS =====
  const testimonials = [
    {
      name: 'Sarah Ahmed',
      country: 'United States',
      textEn: 'My 8-year-old daughter has been learning with Ibrahim for 6 months now. She went from not knowing the Arabic alphabet to reading short surahs fluently. The patience and dedication of the teaching is remarkable!',
      textAr: 'ÇÈäÊí ĞÇÊ ÇáÜ 8 ÓäæÇÊ ÊÊÚáã ãÚ ÅÈÑÇåíã ãäĞ 6 ÃÔåÑ. ÇäÊŞáÊ ãä ÚÏã ãÚÑİÉ ÇáÍÑæİ ÇáÚÑÈíÉ Åáì ŞÑÇÁÉ ÇáÓæÑ ÇáŞÕíÑÉ ÈØáÇŞÉ.',
      rating: 5,
      approved: true,
      featured: true,
    },
    {
      name: 'Mohammed Al-Rashid',
      country: 'United Kingdom',
      textEn: 'As a busy professional, the flexible scheduling was a game changer. I can now maintain my Quran memorization journey despite my hectic work schedule. Highly recommended!',
      textAr: 'ßÔÎÕ ãåäí ãÔÛæá¡ ßÇäÊ ÇáãÑæäÉ İí ÇáãæÇÚíÏ äŞØÉ ÊÍæá. ÃÓÊØíÚ ÇáÂä ÇáÇÓÊãÑÇÑ İí ÑÍáÉ ÍİÙ ÇáŞÑÂä.',
      rating: 5,
      approved: true,
      featured: true,
    },
    {
      name: 'Aisha Patel',
      country: 'Canada',
      textEn: 'Both my sons are enrolled and they absolutely love their Quran classes. The interactive games and engaging teaching style keeps them motivated. Best investment in their Islamic education!',
      textAr: 'ÃÈäÇÆí ÇáÇËäÇä ãÓÌáÇä æíÍÈæä ÍÕÕ ÇáŞÑÂä. ÇáÃáÚÇÈ ÇáÊİÇÚáíÉ æÃÓáæÈ ÇáÊÏÑíÓ ÇáÌĞÇÈ íÈŞíåã ãÊÍãÓíä.',
      rating: 5,
      approved: true,
      featured: true,
    },
    {
      name: 'Yusuf Hassan',
      country: 'Australia',
      textEn: 'I started as a complete beginner in Tajweed. After 4 months, my recitation has improved dramatically. The teacher explains the rules in a simple, easy-to-understand way.',
      textAr: 'ÈÏÃÊ ßãÈÊÏÆ ÊãÇãÇğ İí ÇáÊÌæíÏ. ÈÚÏ 4 ÃÔåÑ¡ ÊÍÓäÊ ÊáÇæÊí ÈÔßá ßÈíÑ.',
      rating: 5,
      approved: true,
      featured: false,
    },
    {
      name: 'Fatima Osman',
      country: 'UAE',
      textEn: 'The one-on-one sessions are perfect for my daughter who is shy in group settings. She has blossomed and now confidently recites in front of the family. Jazak Allah Khair!',
      textAr: 'ÇáÍÕÕ ÇáİÑÏíÉ ãËÇáíÉ áÇÈäÊí ÇáÊí ÊÎÌá İí ÇáãÌãæÚÇÊ. áŞÏ ÊİÊÍÊ æÃÕÈÍÊ ÊÊáæ ÈËŞÉ ÃãÇã ÇáÚÇÆáÉ.',
      rating: 5,
      approved: true,
      featured: false,
    },
    {
      name: 'Ahmad Khan',
      country: 'Germany',
      textEn: 'Professional, punctual, and passionate about teaching. The progress reports help me track my children\'s development. Worth every penny!',
      textAr: 'ãÍÊÑİ¡ ÏŞíŞ İí ÇáãæÇÚíÏ¡ æÔÛæİ ÈÇáÊÏÑíÓ. ÊŞÇÑíÑ ÇáÊŞÏã ÊÓÇÚÏäí Úáì ãÊÇÈÚÉ ÊØæÑ ÃØİÇáí.',
      rating: 4,
      approved: true,
      featured: false,
    },
    {
      name: 'Mariam Abdullah',
      country: 'Malaysia',
      textEn: 'Finding a good Quran teacher was always a challenge living abroad. This academy solved that problem completely. The quality of teaching is exceptional.',
      textAr: 'ÅíÌÇÏ ãÚáã ŞÑÂä ÌíÏ ßÇä ÏÇÆãÇğ ÊÍÏíÇğ æÃäÇ ÃÚíÔ İí ÇáÎÇÑÌ. åĞå ÇáÃßÇÏíãíÉ ÍáÊ ÇáãÔßáÉ ÊãÇãÇğ.',
      rating: 5,
      approved: true,
      featured: false,
    },
    {
      name: 'Pending Review',
      country: 'Egypt',
      textEn: 'Just started last week, looking forward to sharing my experience.',
      textAr: 'ÈÏÃÊ ÇáÃÓÈæÚ ÇáãÇÖí İŞØ¡ ÃÊØáÚ áãÔÇÑßÉ ÊÌÑÈÊí.',
      rating: 4,
      approved: false,
      featured: false,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
    console.log('? Testimonial created:', t.name);
  }

  // ===== 7. SAMPLE BOOKINGS =====
  const bookings = [
    {
      name: 'Ali Hassan',
      email: 'ali.hassan@email.com',
      phone: '+1234567890',
      country: 'United States',
      timezone: 'America/New_York',
      serviceSlug: 'quran-memorization',
      type: 'TRIAL' as const,
      status: 'PENDING' as const,
      notes: 'Looking for Quran memorization classes for my 10-year-old son',
    },
    {
      name: 'Nour Ibrahim',
      email: 'nour.ibrahim@email.com',
      phone: '+447123456789',
      country: 'United Kingdom',
      timezone: 'Europe/London',
      serviceSlug: 'tajweed-course',
      type: 'TRIAL' as const,
      status: 'CONFIRMED' as const,
      preferredDate: new Date('2025-05-01'),
      preferredTime: '10:00 AM',
      notes: 'Adult beginner, wants to learn Tajweed from scratch',
    },
    {
      name: 'Zainab Mohamed',
      email: 'zainab@email.com',
      phone: '+61412345678',
      country: 'Australia',
      timezone: 'Australia/Sydney',
      serviceSlug: 'noor-albayan',
      type: 'TRIAL' as const,
      status: 'COMPLETED' as const,
      preferredDate: new Date('2025-04-15'),
      preferredTime: '4:00 PM',
      notes: 'Daughter age 6, complete beginner',
    },
  ];

  for (const b of bookings) {
    await prisma.booking.create({ data: b });
    console.log('? Booking created:', b.name);
  }

  // ===== 8. SAMPLE CONTACTS =====
  const contacts = [
    {
      name: 'Khalid Omar',
      email: 'khalid@email.com',
      phone: '+966501234567',
      subject: 'Group Classes',
      message: 'Do you offer group classes for siblings? I have 3 children aged 7-12.',
      status: 'NEW' as const,
    },
    {
      name: 'Amina Yusuf',
      email: 'amina@email.com',
      subject: 'Payment Options',
      message: 'What payment methods do you accept? Is there a discount for yearly subscription?',
      status: 'READ' as const,
    },
    {
      name: 'Hassan Ali',
      email: 'hassan.ali@email.com',
      subject: 'Teacher Qualifications',
      message: 'Can you tell me more about the teacher qualifications and teaching methodology?',
      status: 'REPLIED' as const,
      adminNote: 'Sent detailed info about our Ijazah-certified teachers',
      repliedAt: new Date(),
    },
  ];

  for (const c of contacts) {
    await prisma.contact.create({ data: c });
    console.log('? Contact created:', c.name);
  }

  // ===== 9. ANALYTICS EVENTS =====
  const pages = ['/en', '/en/services', '/en/about', '/en/contact', '/en/book-trial', '/en/blog', '/ar', '/ar/services'];
  const events = ['page_view', 'page_view', 'page_view', 'booking_started', 'contact_form_opened', 'page_view'];

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    await prisma.analyticsEvent.create({
      data: {
        event: events[Math.floor(Math.random() * events.length)],
        page: pages[Math.floor(Math.random() * pages.length)],
        locale: Math.random() > 0.5 ? Locale.EN : Locale.AR,
        sessionId: `session-${Math.random().toString(36).substring(7)}`,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (seed data)',
        metadata: {},
        createdAt: date,
      },
    });
  }
  console.log('? 50 Analytics events created');

  console.log('\n========================================');
  console.log('?? Seed completed successfully!');
  console.log('========================================');
  console.log('\n?? Login Credentials:');
  console.log('  Admin:   admin@iqa.com / Admin123!');
  console.log('  Teacher: teacher@iqa.com / Teacher123!');
  console.log('  Student: sarah@test.com / Student123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('? Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
