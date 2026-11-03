import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16 renamed the "middleware" file convention to "proxy".
export default createMiddleware(routing);

export const config = {
  // Every page path except API routes, Next internals and files with an extension
  // (images, sitemap.xml, robots.txt…). Paths without a locale prefix such as
  // /about or /products are redirected to /ar/… instead of returning a bare 404.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
