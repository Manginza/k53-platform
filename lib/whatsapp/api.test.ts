import { createHmac } from 'crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { clip, resolvePublicImageUrl, setting, verifySignature } from './api'

describe('verifySignature', () => {
  const secret = 'unit-test-secret'
  afterEach(() => { delete process.env.WHATSAPP_APP_SECRET })

  it('accepts the signature Meta sends and rejects a tampered body', () => {
    process.env.WHATSAPP_APP_SECRET = secret
    const body = '{"entry":[]}'
    const signature = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
    expect(verifySignature(body, signature)).toBe(true)
    expect(verifySignature(`${body} `, signature)).toBe(false)
  })

  it('rejects a missing, wrong, or truncated header', () => {
    process.env.WHATSAPP_APP_SECRET = secret
    expect(verifySignature('a', null)).toBe(false)
    expect(verifySignature('a', 'sha1=abcd')).toBe(false)
    expect(verifySignature('a', 'sha256=zz')).toBe(false)
    expect(verifySignature('a', 'sha256=')).toBe(false)
    delete process.env.WHATSAPP_APP_SECRET
    const signature = `sha256=${createHmac('sha256', secret).update('a').digest('hex')}`
    expect(verifySignature('a', signature)).toBe(false)
  })
})

describe('settings and pictures', () => {
  afterEach(() => { delete process.env.WHATSAPP_TOKEN })

  it('trims a token that was pasted with a trailing line break', () => {
    process.env.WHATSAPP_TOKEN = '  abc\n'
    expect(setting('WHATSAPP_TOKEN')).toBe('abc')
  })

  it('turns a site-relative sign into an https URL Meta can fetch', () => {
    expect(resolvePublicImageUrl('/images/code10/test 1/a.png', 'https://www.skdriving.co.za'))
      .toBe('https://www.skdriving.co.za/images/code10/test%201/a.png')
    expect(resolvePublicImageUrl('https://cdn.example.com/a.png', 'https://www.skdriving.co.za'))
      .toBe('https://cdn.example.com/a.png')
    expect(resolvePublicImageUrl('http://cdn.example.com/a.png', 'https://www.skdriving.co.za')).toBeNull()
    expect(resolvePublicImageUrl('javascript:alert(1)', 'https://www.skdriving.co.za')).toBeNull()
    expect(resolvePublicImageUrl('', 'https://www.skdriving.co.za')).toBeNull()
  })

  it('clips text WhatsApp would otherwise reject', () => {
    expect(clip('hello', 10)).toBe('hello')
    expect(clip('hello there', 8)).toBe('hello t…')
  })
})
