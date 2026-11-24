import { describe, expect, it } from 'vitest'
import { ADSENSE_CLIENT, ADSENSE_EXCLUDED_PREFIXES, adsenseAllowed } from './adsense'

describe('adsenseAllowed', () => {
  it('keeps the existing AdSense publisher id', () => {
    expect(ADSENSE_CLIENT).toBe('ca-pub-4650201068372958')
  })

  it('allows public content pages', () => {
    for (const path of [
      '/',
      '/about',
      '/contact',
      '/privacy-policy',
      '/cookie-policy',
      '/terms-and-conditions',
      '/centers',
      '/centers/gauteng',
      '/driving-schools',
      '/driving-schools/western-cape',
      '/blog',
      '/blog/how-to-pass',
      '/courses',
      '/courses/1',
      '/k53-learners-study-guide',
      '/k53-questions-and-answers',
      '/learners-licence-cost',
      '/how-to-book-a-learners-licence-test',
      '/manifesto',
      '/affiliate',
    ]) {
      expect(adsenseAllowed(path), path).toBe(true)
    }
  })

  it('blocks every route that must not carry ads, including nested paths', () => {
    const samples: Record<string, string[]> = {
      '/login': ['/login'],
      '/register': ['/register'],
      '/account': ['/account', '/account/billing'],
      '/admin': ['/admin', '/admin/payouts', '/admin/learn-review'],
      '/admin-login': ['/admin-login'],
      '/subscribe': ['/subscribe', '/subscribe/success', '/subscribe/failed'],
      '/quiz': ['/quiz', '/quiz/1', '/quiz/code-8'],
      '/live-notes': ['/live-notes', '/live-notes/rules', '/live-notes/chapter/1', '/live-notes/k53/chapter/2/quiz'],
      '/videos': ['/videos', '/videos/intro'],
      '/resources': ['/resources'],
      '/trainer': ['/trainer', '/trainer/dashboard', '/trainer/register'],
      '/pricing': ['/pricing', '/pricing/checkout'],
    }
    expect(Object.keys(samples).sort()).toEqual([...ADSENSE_EXCLUDED_PREFIXES].sort())
    for (const paths of Object.values(samples)) {
      for (const path of paths) expect(adsenseAllowed(path), path).toBe(false)
    }
  })

  it('does not treat a shared prefix as a match', () => {
    expect(adsenseAllowed('/admin-pass')).toBe(true)
    expect(adsenseAllowed('/quizzes')).toBe(true)
    expect(adsenseAllowed('/login-help')).toBe(true)
    expect(adsenseAllowed('/pricing-guide')).toBe(true)
  })

  it('ignores a trailing slash and a query string', () => {
    expect(adsenseAllowed('/pricing/')).toBe(false)
    expect(adsenseAllowed('/centers/')).toBe(true)
    expect(adsenseAllowed('/login?next=/courses')).toBe(false)
    expect(adsenseAllowed('/k53-learners-study-guide?ref=ABC')).toBe(true)
  })
})
