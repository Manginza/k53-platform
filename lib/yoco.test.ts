import { afterEach, describe, expect, it, vi } from 'vitest'
import { getYocoCheckout } from './yoco'

describe('getYocoCheckout id validation', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

  it('never calls Yoco for an id that could alter the URL path', async () => {
    vi.stubEnv('YOCO_SECRET_KEY', 'sk_test_dummy')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    for (const bad of ['../payments/abc', 'a/b', 'a?x=1', '', 'a b', 'x'.repeat(200)]) {
      expect(await getYocoCheckout(bad)).toBeNull()
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('looks up a normal checkout id', async () => {
    vi.stubEnv('YOCO_SECRET_KEY', 'sk_test_dummy')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'ch_abc123', status: 'completed' }) })
    vi.stubGlobal('fetch', fetchMock)
    const res = await getYocoCheckout('ch_abc123')
    expect(res?.status).toBe('completed')
    expect(fetchMock.mock.calls[0][0]).toBe('https://payments.yoco.com/api/checkouts/ch_abc123')
  })
})
