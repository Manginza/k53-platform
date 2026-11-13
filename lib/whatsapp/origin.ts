/**
 * A form posted from this site. Compared on the host, so a page on another
 * site cannot submit the link confirmation with the learner's cookies.
 */
export function isSameSitePost(origin: string | null, forwardedHost: string | null, host: string | null): boolean {
  if (!origin) return false
  let originHost: string
  try { originHost = new URL(origin).host } catch { return false }
  const received = (forwardedHost ?? host ?? '').split(',')[0]?.trim() ?? ''
  return received.length > 0 && originHost === received
}
