import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED: Record<string, string[]> = {
  "/student": ["STUDENT", "TRIAL_STUDENT", "ADMIN"],
  "/teacher": ["TEACHER", "ADMIN"],
  "/admin":   ["ADMIN"],
};

const AUTH_PREFIXES = ["/auth/login", "/auth/register"];

function decodeTokenRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decoded)?.role ?? null;
  } catch {
    return null;
  }
}

function dashboardPath(role: string, locale: string): string {
  switch (role) {
    case "ADMIN":         return `/${locale}/admin`;
    case "TEACHER":       return `/${locale}/teacher/dashboard`;
    case "STUDENT":
    case "TRIAL_STUDENT": return `/${locale}/student/dashboard`;
    default:              return `/${locale}`;
  }
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const intlResponse = intlMiddleware(req);
  const withoutLocale = pathname.replace(/^\/(en|ar)/, "") || "/";
  const locale = pathname.match(/^\/(en|ar)/)?.[1] ?? "en";
  const token = req.cookies.get("access_token")?.value ?? null;
  const role = token ? decodeTokenRole(token) : null;

  const protectedPrefix = Object.keys(PROTECTED).find((p) =>
    withoutLocale.startsWith(p)
  );

  if (protectedPrefix) {
    if (!token || !role) {
      const url = new URL(`/${locale}/auth/login`, req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (!PROTECTED[protectedPrefix].includes(role)) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  const isAuthPage = AUTH_PREFIXES.some((p) => withoutLocale.startsWith(p));
  if (isAuthPage && token && role) {
    return NextResponse.redirect(new URL(dashboardPath(role, locale), req.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
