export interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string;
  excerptEn?: string;
  excerptAr?: string;
  contentEn: string;
  contentAr?: string;
  coverImage?: string | null;
  tags: string[];
  locale: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface BlogPostFormatted {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  date: string;
  readTime: string;
  author: string;
  tags: string[];
}

export function formatBlogPost(
  post: BlogPost,
  locale: string,
): BlogPostFormatted {
  const title =
    locale === 'ar' && post.titleAr ? post.titleAr : post.titleEn;
  const excerpt =
    locale === 'ar' && post.excerptAr
      ? post.excerptAr
      : post.excerptEn || '';
  const content =
    locale === 'ar' && post.contentAr
      ? post.contentAr
      : post.contentEn;

  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(
        locale === 'ar' ? 'ar-EG' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      )
    : '';

  const authorName = post.author
    ? `${post.author.firstName} ${post.author.lastName}`
    : 'Ibrahim Abdelnasser';

  const category = post.tags?.[0] || 'general';

  return {
    id: post.id,
    slug: post.slug,
    title,
    excerpt,
    content,
    coverImage: post.coverImage || null,
    category,
    date,
    readTime,
    author: authorName,
    tags: post.tags || [],
  };
}