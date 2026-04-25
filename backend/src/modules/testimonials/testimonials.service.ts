import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { QueryTestimonialsDto } from './dto/query-testimonials.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTestimonialDto, userId?: string) {
    return this.prisma.testimonial.create({
      data: { ...dto, userId: userId || null },
    });
  }

  async findAll(query: QueryTestimonialsDto) {
    const { page = 1, limit = 20, approved, featured } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TestimonialWhereInput = {};
    if (approved !== undefined) where.approved = approved;
    if (featured !== undefined) where.featured = featured;

    const [data, total] = await Promise.all([
      this.prisma.testimonial.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.testimonial.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findPublished() {
    return this.prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const t = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Testimonial not found');
    return t;
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    await this.findOne(id);
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  async approve(id: string) {
    await this.findOne(id);
    return this.prisma.testimonial.update({ where: { id }, data: { approved: true } });
  }

  async reject(id: string) {
    await this.findOne(id);
    return this.prisma.testimonial.update({ where: { id }, data: { approved: false } });
  }

  async toggleFeatured(id: string) {
    const t = await this.findOne(id);
    return this.prisma.testimonial.update({ where: { id }, data: { featured: !t.featured } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.testimonial.delete({ where: { id } });
    return { message: 'Testimonial deleted successfully' };
  }
}
