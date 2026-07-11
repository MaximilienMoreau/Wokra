import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// /profile/[handle] itself is a public read view (profils ouverts) — only the
// mutation routes underneath it require a session.
const PROTECTED_PREFIXES = ["/profile/edit", "/profile/artifacts", "/feed", "/search", "/messages"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (req.auth && !req.auth.user.handle && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
