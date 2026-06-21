'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import WhatsAppButton from './WhatsAppButton';

// Prefixes where public Navbar/Footer should NOT render
const EXCLUDED = ['/admin', '/teacher', '/student', '/auth'];

// Prefixes where the home hero handles its own spacing (navbar is overlaid)
const OVERLAY_ROUTES = ['/'];

function shouldExclude(pathname: string): boolean {
  const clean = pathname.replace(/^\/(en|ar)/, '') || '/';
  return EXCLUDED.some((p) => clean.startsWith(p));
}

function isOverlayRoute(pathname: string): boolean {
  const clean = pathname.replace(/^\/(en|ar)/, '') || '/';
  return clean === '/';
}

export default function LayoutShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Dashboard / auth routes — no public shell
  if (shouldExclude(pathname)) {
    return <>{children}</>;
  }

  // Home page — navbar overlays hero, no top padding
  if (isOverlayRoute(pathname)) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ScrollToTop />
        <WhatsAppButton />
      </>
    );
  }

  // All other public pages — navbar is fixed, add top padding
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 md:pt-20">{children}</main>
      <Footer />
      <ScrollToTop />
      <WhatsAppButton />
    </>
  );
}