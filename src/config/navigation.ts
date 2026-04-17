export const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Quran Recitation", href: "/services/quran-recitation" },
      { label: "Tajweed", href: "/services/tajweed" },
      { label: "Arabic Language", href: "/services/arabic-language" },
      { label: "Islamic Studies", href: "/services/islamic-studies" },
      { label: "For Kids", href: "/services/kids-program" },
      { label: "For New Muslims", href: "/services/new-muslims" },
    ],
  },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
