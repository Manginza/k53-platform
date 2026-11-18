import { describe, expect, it } from 'vitest'
import { safeNextPath } from './safe-next'

describe('safeNextPath', () => {
  it('accepts same-site paths', () => {
    expect(safeNextPath('/courses')).toBe('/courses')
    expect(safeNextPath('/pricing?pay=1')).toBe('/pricing?pay=1')
    expect(safeNextPath('/subscribe/success')).toBe('/subscribe/success')
  })
  it('rejects other sites and protocol-relative URLs', () => {
    expect(safeNextPath('https://evil.example')).toBeNull()
    expect(safeNextPath('//evil.example')).toBeNull()
    expect(safeNextPath('evil.example')).toBeNull()
    expect(safeNextPath('javascript:alert(1)')).toBeNull()
  })
  it('rejects backslash and control-character tricks', () => {
    expect(safeNextPath('/\\evil.example')).toBeNull()
    expect(safeNextPath('/\\/evil.example')).toBeNull()
    expect(safeNextPath('/\t/evil.example')).toBeNull()
    expect(safeNextPath('/\n/evil.example')).toBeNull()
  })
  it('rejects non-strings and empties', () => {
    expect(safeNextPath(null)).toBeNull()
    expect(safeNextPath(undefined)).toBeNull()
    expect(safeNextPath('')).toBeNull()
    expect(safeNextPath(42)).toBeNull()
  })
})
