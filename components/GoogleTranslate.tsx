'use client'

import { useEffect } from 'react'

/**
 * Loads the Google Website Translator once, client-side. The actual language
 * choice is driven by the `googtrans` cookie (see lib/language-context), which
 * this widget reads on load. The visible Google banner/toolbar is hidden via
 * CSS in globals.css — the app's own navbar dropdown is the control surface.
 */

/**
 * Google Translate rewrites text nodes directly in the DOM, which can make
 * React throw "Failed to execute 'removeChild'/'insertBefore'" during later
 * re-renders. These guards make those operations no-ops instead of crashing —
 * a widely-used fix for the React + Google Translate combination.
 */
function patchDomForGoogleTranslate() {
  if (typeof Node !== 'function' || !Node.prototype) return
  if ((Node.prototype as any).__gtPatched) return
  ;(Node.prototype as any).__gtPatched = true

  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) return child
    return originalRemoveChild.call(this, child) as T
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) return newNode
    return originalInsertBefore.call(this, newNode, referenceNode) as T
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    patchDomForGoogleTranslate()

    // Avoid injecting the script twice (fast refresh / re-mount).
    if (document.getElementById('google-translate-script')) return

    ;(window as any).googleTranslateElementInit = function () {
      const g = (window as any).google
      if (!g?.translate?.TranslateElement) return
      new g.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element',
      )
    }

    const s = document.createElement('script')
    s.id = 'google-translate-script'
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    s.async = true
    document.body.appendChild(s)
  }, [])

  return <div id="google_translate_element" style={{ display: 'none' }} />
}
