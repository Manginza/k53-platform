/**
 * Where the Google AdSense script is allowed to load.
 *
 * The publisher meta tag stays on every page. This module only decides
 * whether adsbygoogle.js is included. GA4, Tag Manager and the Meta Pixel
 * are not affected.
 *
 * A path is excluded when it equals one of these prefixes or sits under it
 * (/quiz/12, /subscribe/success, /trainer/dashboard). /admin does not exclude
 * /admin-login; that route is listed on its own.
 */
export const ADSENSE_CLIENT = 'ca-pub-4650201068372958'

export const ADSENSE_SCRIPT_SRC =
  `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`

export const ADSENSE_EXCLUDED_PREFIXES = [
  '/login',
  '/register',
  '/account',
  '/admin',
  '/admin-login',
  '/subscribe',
  '/quiz',
  '/live-notes',
  '/videos',
  '/resources',
  '/trainer',
  '/pricing',
] as const

export function adsenseAllowed(pathname: string): boolean {
  const bare = pathname.split('?')[0].split('#')[0]
  const path = bare.length > 1 && bare.endsWith('/') ? bare.slice(0, -1) : bare
  return !ADSENSE_EXCLUDED_PREFIXES.some(
    prefix => path === prefix || path.startsWith(`${prefix}/`),
  )
}
