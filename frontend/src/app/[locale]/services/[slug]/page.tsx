import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailContent from "@/components/services/ServiceDetailContent";

const validSlugs = [
  "quran-recitation",
  "tajweed",
  "arabic-language",
  "islamic-studies",
  "kids-program",
  "new-muslims",
];

const locales = ["ar", "en"];

// ⚠️ هنا params Promise
type Props = {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
};

// ✅ generate static params
export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    validSlugs.map((slug) => ({
      locale,
      slug,
    }))
  );
}

// ✅ هنا لازم await
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const titles: Record<string, string> = {
    "quran-recitation": "Quran Recitation Lessons",
    "tajweed": "Tajweed Course",
    "arabic-language": "Arabic Language Course",
    "islamic-studies": "Islamic Studies Program",
    "kids-program": "Kids Quran Program",
    "new-muslims": "New Muslims Program",
  };

  const title = titles[slug] || "Service";

  return {
    title,
    description: `Learn ${title} with personalized 1-on-1 online lessons from a certified teacher.`,
  };
}

// ✅ هنا برضو لازم await
export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!validSlugs.includes(slug)) {
    notFound();
  }

  return <ServiceDetailContent slug={slug} />;
}