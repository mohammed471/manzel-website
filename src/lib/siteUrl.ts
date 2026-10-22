/** Public address of the site — canonical URLs, sitemap, robots, JSON-LD, share links. */
export const SITE_URL = "https://www.manzel360.com";

/**
 * Staging / preview hosts set NEXT_PUBLIC_ALLOW_INDEXING=false → robots.txt closed and
 * every page noindex. Unset means allowed, so production can't be de-indexed by a missing variable.
 */
export const allowIndexing = () => process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false";
