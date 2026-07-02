'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { translatePage } from '@/lib/translate'
import { STORAGE_KEY } from '@/lib/language-context'

/**
 * Google Translate rewrites text nodes directly, which can make React throw
 * "Failed to execute 'removeChild'/'insertBefore'" during later re-renders.
 * These guards turn those into no-ops instead of crashing — the widely-used
 * fix for the React + live-translation combination.
 */
function patchDom() {
  if (typeof Node !== 'function' || !Node.prototype) return
  if ((Node.prototype as unknown as { __gtPatched?: boolean }).__gtPatched) return
  ;(Node.prototype as unknown as { __gtPatched?: boolean }).__gtPatched = true

  const origRemove = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) return child
    return origRemove.call(this, child) as T
  }
  const origInsert = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return newNode
    return origInsert.call(this, newNode, ref) as T
  }
}

function currentLang(): string {
  try { return localStorage.getItem(STORAGE_KEY) || 'en' } catch { return 'en' }
}

export default function TranslationManager() {
  const pathname = usePathname()

  useEffect(() => { patchDom() }, [])

  useEffect(() => {
    const lang = currentLang()
    if (lang === 'en') return

    // Translate shortly after React paints this route.
    const first = setTimeout(() => { void translatePage(lang) }, 150)

    // Re-translate content React adds later (popups, async data, quiz items).
    let debounce: ReturnType<typeof setTimeout> | undefined
    const observer = new MutationObserver(() => {
      clearTimeout(debounce)
      debounce = setTimeout(() => { void translatePage(lang) }, 500)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(first)
      clearTimeout(debounce)
      observer.disconnect()
    }
  }, [pathname])

  return null
}
