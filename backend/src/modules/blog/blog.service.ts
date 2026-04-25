import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already exists');

    return this.prisma.blogPost.create({
      data: {
        ...dto,
        authorId,
        publishedAt: dto.published ? new Date() : null,
      },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findAll(query: QueryBlogDto) {
    const { page = 1, limit = 10, search, tag, published } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {};
    if (published !== undefined) where.published = published;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleAr: { contains: search, mode: 'insensitive' } },
        { contentEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where, skip, take: limit,
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data: posts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.prisma.blogPost.findFirst({ where: { slug: dto.slug, NOT: { id } } });
      if (existing) throw new ConflictException('Slug already in use');
    }

    const data: any = { ...dto };
    if (dto.published === true) {
      const current = await this.prisma.blogPost.findUnique({ where: { id } });
      if (!current?.publishedAt) data.publishedAt = new Date();
    }

    return this.prisma.blogPost.update({
      where: { id }, data,
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Blog post deleted successfully' };
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.blogPost.update({
      where: { id },
      data: { published: true, publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    await this.findOne(id);
    return this.prisma.blogPost.update({
      where: { id },
      data: { published: false },
    });
  }
}
