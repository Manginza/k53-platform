'use client'

/**
 * Client-side page translator.
 *
 * The official Google Website Translator widget was discontinued (it loads but
 * no longer returns translations). This walks the visible text nodes and
 * translates them via Google's translation endpoint directly, caching results
 * in sessionStorage so repeated strings (nav, buttons) are only fetched once.
 *
 * Source language is always English (the site's authored language). Switching
 * language reloads the page first, so we always translate from clean English
 * rather than from already-translated text.
 *
 * Nodes are tracked by their LAST APPLIED output (not a permanent "done" flag).
 * Components like the quiz reuse the same DOM text node and just swap its
 * content between questions — that's a plain text update, not a new node — so
 * a one-time "already translated" marker would freeze the node in whatever
 * language it first got and ignore all future English text swapped into it.
 * Comparing against the last output we wrote means a node whose text changed
 * (by React, after we translated it) is correctly seen as needing translation
 * again.
 */

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&tl='
const SEP = '␟' // cache-key separator (unlikely to appear in text)
const MAX_CHUNK = 1200 // max chars of source text per request

/** Last translated output WE wrote into each node — not what got there. */
const appliedText = new WeakMap<Text, string>()
const cache = new Map<string, string>() // `${lang}${SEP}${core}` -> translation

const key = (lang: string, core: string) => lang + SEP + core

function loadSession(lang: string) {
  try {
    const raw = sessionStorage.getItem('tr_' + lang)
    if (!raw) return
    const obj = JSON.parse(raw) as Record<string, string>
    for (const k in obj) cache.set(key(lang, k), obj[k])
  } catch {}
}

function saveSession(lang: string) {
  try {
    const obj: Record<string, string> = {}
    const prefix = lang + SEP
    cache.forEach((v, k) => { if (k.startsWith(prefix)) obj[k.slice(prefix.length)] = v })
    sessionStorage.setItem('tr_' + lang, JSON.stringify(obj))
  } catch {}
}

function collectTextNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n: Node) {
      const raw = n.nodeValue
      const t = raw?.trim()
      if (!t || !/[a-zA-Z]/.test(t)) return NodeFilter.FILTER_REJECT
      // Single-letter option badges (A / B / C) — leave as-is, they're markers
      // not prose, and translating them in isolation can produce odd output.
      if (/^[A-Za-z]$/.test(t)) return NodeFilter.FILTER_REJECT
      const p = (n as Text).parentElement
      if (!p) return NodeFilter.FILTER_REJECT
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(p.tagName)) return NodeFilter.FILTER_REJECT
      if (p.closest('[translate="no"], .notranslate')) return NodeFilter.FILTER_REJECT
      // Skip only if this exact text is what we last wrote — i.e. already
      // translated and untouched since. Anything else (fresh English content
      // swapped in by React) is picked up again.
      if (appliedText.get(n as Text) === raw) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const out: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) out.push(n as Text)
  return out
}

async function fetchBatch(texts: string[], lang: string): Promise<string[] | null> {
  try {
    const url = ENDPOINT + lang + '&q=' + encodeURIComponent(texts.join('\n'))
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const joined = (data[0] || []).map((s: [string]) => s[0]).join('')
    const parts = joined.split('\n')
    return parts.length === texts.length ? parts : null
  } catch {
    return null
  }
}

async function fetchOne(text: string, lang: string): Promise<string> {
  try {
    const url = ENDPOINT + lang + '&q=' + encodeURIComponent(text)
    const data = await (await fetch(url)).json()
    return (data[0] || []).map((s: [string]) => s[0]).join('') || text
  } catch {
    return text
  }
}

let running = false
let rerunRequested = false

/** Translate all untranslated (or freshly-changed) visible text into `lang`. */
export async function translatePage(lang: string): Promise<void> {
  if (!lang || lang === 'en' || typeof document === 'undefined') return

  // If a run is already in flight, flag that another pass is needed once it
  // finishes (rather than silently dropping this call — the DOM may have
  // changed again, e.g. the quiz advanced to the next question, mid-fetch).
  if (running) { rerunRequested = true; return }
  running = true
  try {
    loadSession(lang)

    const nodes = collectTextNodes(document.body)
    if (nodes.length) {
      const items = nodes.map(node => {
        const raw = node.nodeValue || ''
        const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/) as RegExpMatchArray
        return { node, raw, lead: m[1], core: m[2], trail: m[3] }
      })

      // Fetch only cores we don't already have cached.
      const need = Array.from(new Set(items.map(i => i.core).filter(c => !cache.has(key(lang, c)))))

      // Chunk to keep request URLs within a safe length.
      const chunks: string[][] = []
      let cur: string[] = []
      let len = 0
      for (const core of need) {
        if (len + core.length > MAX_CHUNK && cur.length) { chunks.push(cur); cur = []; len = 0 }
        cur.push(core)
        len += core.length + 1
      }
      if (cur.length) chunks.push(cur)

      for (const chunk of chunks) {
        let tr = await fetchBatch(chunk, lang)
        if (!tr) tr = await Promise.all(chunk.map(c => fetchOne(c, lang)))
        chunk.forEach((core, i) => cache.set(key(lang, core), tr![i] ?? core))
      }

      // Apply every node from cache — but only if its content still matches
      // what we captured before fetching. If React swapped in newer text
      // while the request was in flight (e.g. the quiz advanced to the next
      // question), applying now would clobber the fresh English with a
      // translation of the OLD question. Skip it; the mutation that changed
      // it already triggered (or will trigger) another pass to catch it.
      for (const it of items) {
        if (it.node.nodeValue !== it.raw) continue
        const t = cache.get(key(lang, it.core))
        if (t == null) continue
        const output = it.lead + t + it.trail
        it.node.nodeValue = output
        appliedText.set(it.node, output)
      }

      saveSession(lang)
    }
  } finally {
    running = false
    if (rerunRequested) {
      rerunRequested = false
      void translatePage(lang)
    }
  }
}
