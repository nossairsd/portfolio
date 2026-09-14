import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export const proxy = createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals and files with an extension
  // (images, the CV PDFs, robots.txt, sitemap.xml...).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
