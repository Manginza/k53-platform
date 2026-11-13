import { describe, expect, it } from 'vitest'
import { isSameSitePost } from './origin'

describe('isSameSitePost', () => {
  it('accepts the site that served the form and rejects everyone else', () => {
    expect(isSameSitePost('https://www.skdriving.co.za', 'www.skdriving.co.za', 'www.skdriving.co.za')).toBe(true)
    expect(isSameSitePost('https://evil.example', 'www.skdriving.co.za', 'www.skdriving.co.za')).toBe(false)
    expect(isSameSitePost(null, 'www.skdriving.co.za', 'www.skdriving.co.za')).toBe(false)
    expect(isSameSitePost('not a url', 'www.skdriving.co.za', null)).toBe(false)
    expect(isSameSitePost('https://www.skdriving.co.za', 'www.skdriving.co.za, www.skdriving.co.za', null)).toBe(true)
  })
})
