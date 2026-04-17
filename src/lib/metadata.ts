import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ibrahimabdelnasser.com";

export function createMetadata({
  title,
  description,
  path = "",
  ogImage = "/og-image.jpg",
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
}): Metadata {
  const url = `${baseUrl}${path}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Ibrahim Abdelnasser",
      images: [{ url: `${baseUrl}${ogImage}`, width: 1200, height: 630 }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}${ogImage}`],
    },
    alternates: {
      canonical: url,
    },
  };
}
