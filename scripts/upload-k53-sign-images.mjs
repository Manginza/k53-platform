// upload-k53-sign-images.mjs — generates the SVG sign/signal/hand-signal images
// used by the K53 Unpacked quizzes and uploads them to
// storage: resources/K53 Unpacked/signs/<name>.svg  (public bucket)
//
// Run: SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-k53-sign-images.mjs

import { readFileSync } from 'fs'

let SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL
let KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  const get = k => (env.match(new RegExp(k + '=(.*)')) || [])[1]?.replace(/[\r\s]+$/, '')
  SUPA ||= get('NEXT_PUBLIC_SUPABASE_URL')
  if (!KEY || !KEY.startsWith('eyJ')) { const f = get('SUPABASE_SERVICE_ROLE_KEY'); if (f?.startsWith('eyJ')) KEY = f }
} catch {}
if (!SUPA || !KEY?.startsWith('eyJ')) { console.error('Need NEXT_PUBLIC_SUPABASE_URL + real SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const W = (body, vb = '0 0 200 200') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`

// ── Regulatory / warning signs ───────────────────────────────────────────────

const RED = '#c8102e', BLUE = '#0057a8', AMBER = '#f5a800', GREEN = '#1faa3c'

const octagon = (() => {
  const pts = []
  for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; pts.push(`${100 + 92 * Math.cos(a)},${100 + 92 * Math.sin(a)}`) }
  return pts.join(' ')
})()

const car = (x, y, fill) =>
  `<g fill="${fill}"><rect x="${x}" y="${y}" width="34" height="46" rx="8"/><rect x="${x + 6}" y="${y + 8}" width="22" height="12" rx="3" fill="#fff" opacity="0.85"/></g>`

const SIGNS = {
  // STOP — red octagon
  'sign-stop': W(`<polygon points="${octagon}" fill="${RED}" stroke="#fff" stroke-width="7"/>
    <text x="100" y="116" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="46" font-weight="bold" fill="#fff">STOP</text>`),

  // YIELD — inverted triangle, red border
  'sign-yield': W(`<polygon points="100,188 8,28 192,28" fill="${RED}"/>
    <polygon points="100,158 36,46 164,46" fill="#fff"/>`),

  // NO ENTRY — red disc, white bar
  'sign-no-entry': W(`<circle cx="100" cy="100" r="92" fill="${RED}"/>
    <rect x="30" y="86" width="140" height="28" rx="6" fill="#fff"/>`),

  // MINIMUM SPEED — blue disc, white number
  'sign-min-speed': W(`<circle cx="100" cy="100" r="92" fill="${BLUE}"/>
    <text x="100" y="128" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="78" font-weight="bold" fill="#fff">50</text>`),

  // SPEED LIMIT — white disc, red ring, black number
  'sign-speed-60': W(`<circle cx="100" cy="100" r="92" fill="#fff" stroke="${RED}" stroke-width="18"/>
    <text x="100" y="128" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="78" font-weight="bold" fill="#111">60</text>`),

  // SWITCH HEADLAMPS ON — blue disc, white lamp + beams
  'sign-headlamps': W(`<circle cx="100" cy="100" r="92" fill="${BLUE}"/>
    <path d="M58 78 q30 -16 30 22 q0 38 -30 22 z" fill="#fff"/>
    <g stroke="#fff" stroke-width="9" stroke-linecap="round">
      <line x1="100" y1="78" x2="148" y2="66"/><line x1="102" y1="100" x2="152" y2="100"/><line x1="100" y1="122" x2="148" y2="134"/>
    </g>`),

  // NO U-TURN — white disc, red ring, black U arrow, red slash
  'sign-no-uturn': W(`<circle cx="100" cy="100" r="92" fill="#fff" stroke="${RED}" stroke-width="16"/>
    <path d="M70 142 V96 a30 30 0 0 1 60 0 v20" fill="none" stroke="#111" stroke-width="14"/>
    <polygon points="130,116 112,116 121,140" fill="#111"/>
    <line x1="40" y1="160" x2="160" y2="40" stroke="${RED}" stroke-width="16"/>`),

  // NO STOPPING — blue disc, red ring, red X
  'sign-no-stopping': W(`<circle cx="100" cy="100" r="92" fill="${BLUE}" stroke="${RED}" stroke-width="16"/>
    <g stroke="${RED}" stroke-width="16" stroke-linecap="round">
      <line x1="44" y1="44" x2="156" y2="156"/><line x1="156" y1="44" x2="44" y2="156"/>
    </g>`),

  // NO OVERTAKING — white disc, red ring, black car left + red car right
  'sign-no-overtaking': W(`<circle cx="100" cy="100" r="92" fill="#fff" stroke="${RED}" stroke-width="16"/>
    ${car(56, 76, '#111')}${car(110, 76, RED)}`),

  // STOP/GO paddle — pole + red STOP disc
  'sign-stop-go': W(`<rect x="96" y="96" width="8" height="96" fill="#666"/>
    <circle cx="100" cy="62" r="56" fill="${RED}" stroke="#fff" stroke-width="5"/>
    <text x="100" y="74" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="bold" fill="#fff">STOP</text>`),

  // T-JUNCTION warning — red-bordered triangle, black T
  'sign-t-junction': W(`<polygon points="100,12 192,172 8,172" fill="${RED}"/>
    <polygon points="100,36 172,160 28,160" fill="#fff"/>
    <g stroke="#111" stroke-width="14" stroke-linecap="round"><line x1="64" y1="92" x2="136" y2="92"/><line x1="100" y1="92" x2="100" y2="152"/></g>`),

  // RAILWAY CROSSING — white cross-buck with red border
  'sign-railway': W(`<g transform="rotate(45 100 100)">
      <rect x="14" y="78" width="172" height="44" rx="8" fill="#fff" stroke="${RED}" stroke-width="8"/>
      <rect x="78" y="14" width="44" height="172" rx="8" fill="#fff" stroke="${RED}" stroke-width="8"/>
      <rect x="78" y="78" width="44" height="44" fill="#fff"/>
    </g>`),

  // Solid no-overtaking centre line — road with solid white line
  'marking-solid-line': W(`<rect x="0" y="0" width="200" height="200" fill="#555"/>
    <rect x="0" y="0" width="10" height="200" fill="#e9c46a"/><rect x="190" y="0" width="10" height="200" fill="#e9c46a"/>
    <rect x="96" y="0" width="8" height="200" fill="#fff"/>`),

  // Box junction — yellow cross-hatch
  'marking-box-junction': W(`<rect x="0" y="0" width="200" height="200" fill="#555"/>
    <rect x="20" y="20" width="160" height="160" fill="none" stroke="#f2c014" stroke-width="8"/>
    <g stroke="#f2c014" stroke-width="6">
      <line x1="20" y1="20" x2="180" y2="180"/><line x1="180" y1="20" x2="20" y2="180"/>
      <line x1="100" y1="20" x2="20" y2="100"/><line x1="180" y1="100" x2="100" y2="180"/>
      <line x1="100" y1="20" x2="180" y2="100"/><line x1="20" y1="100" x2="100" y2="180"/>
    </g>`),

  // Emergency warning triangle (hollow red)
  'sign-triangle-warning': W(`<polygon points="100,16 192,176 8,176" fill="${RED}"/>
    <polygon points="100,52 162,164 38,164" fill="#fff"/>
    <rect x="58" y="176" width="20" height="12" fill="#999"/><rect x="122" y="176" width="20" height="12" fill="#999"/>`),
}

// ── Traffic signals ──────────────────────────────────────────────────────────

const robot = (lit, { arrow = null, flashing = false } = {}) => {
  const lens = (cy, color, on, content = '') =>
    `<circle cx="60" cy="${cy}" r="26" fill="${on ? color : '#222'}" stroke="#000" stroke-width="3"/>${content}`
  const arrowShape = (cy, color) =>
    `<g transform="translate(60 ${cy})" fill="${color}"><polygon points="-16,4 4,4 4,14 20,0 4,-14 4,-4 -16,-4"/></g>`
  const rays = (cy, color) => {
    let out = ''
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4
      out += `<line x1="${60 + 34 * Math.cos(a)}" y1="${cy + 34 * Math.sin(a)}" x2="${60 + 46 * Math.cos(a)}" y2="${cy + 46 * Math.sin(a)}" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`
    }
    return out
  }
  const Y = { red: 52, amber: 116, green: 180 }
  const colors = { red: '#e53935', amber: AMBER, green: GREEN }
  let body = `<rect x="18" y="14" width="84" height="204" rx="16" fill="#1d1d1d" stroke="#000" stroke-width="3"/>`
  for (const k of ['red', 'amber', 'green']) {
    const on = k === lit
    const content = on && arrow ? arrowShape(Y[k], '#111') : ''
    body += lens(Y[k], colors[k], on, content)
    if (on && flashing) body += rays(Y[k], colors[k])
  }
  return W(body, '-10 0 140 232')
}

const ROBOTS = {
  'robot-red': robot('red'),
  'robot-green': robot('green'),
  'robot-amber': robot('amber'),
  'robot-green-arrow': robot('green', { arrow: true }),
  'robot-red-arrow': robot('red', { arrow: true }),
  'robot-flashing-red': robot('red', { flashing: true }),
  'robot-flashing-amber': robot('amber', { flashing: true }),
}

// ── Hand signals (driver's right arm out of the window, SA right-hand drive) ─

const carRear = `
  <rect x="20" y="70" width="120" height="86" rx="14" fill="#2b6cb0"/>
  <rect x="34" y="82" width="92" height="34" rx="6" fill="#bcdcf5"/>
  <circle cx="48" cy="160" r="14" fill="#222"/><circle cx="112" cy="160" r="14" fill="#222"/>
  <circle cx="92" cy="99" r="9" fill="#8a5a2b"/>`

const HANDS = {
  // Slowing down — arm out, palm down, moving up & down
  'hand-slow': W(`${carRear}
    <line x1="128" y1="100" x2="186" y2="112" stroke="#8a5a2b" stroke-width="11" stroke-linecap="round"/>
    <rect x="180" y="106" width="22" height="9" rx="4" fill="#8a5a2b"/>
    <g stroke="#111" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M196 88 v-18 m0 0 l-7 8 m7 -8 l7 8"/>
      <path d="M196 132 v18 m0 0 l-7 -8 m7 8 l7 -8"/>
    </g>`, '0 0 230 200'),

  // Turning right — arm straight out, horizontal, held still
  'hand-right': W(`${carRear}
    <line x1="128" y1="98" x2="204" y2="98" stroke="#8a5a2b" stroke-width="11" stroke-linecap="round"/>
    <rect x="200" y="92" width="20" height="12" rx="5" fill="#8a5a2b"/>`, '0 0 230 200'),

  // Turning left — arm out, rotating anti-clockwise circles
  'hand-left': W(`${carRear}
    <line x1="128" y1="100" x2="178" y2="100" stroke="#8a5a2b" stroke-width="11" stroke-linecap="round"/>
    <circle cx="196" cy="100" r="8" fill="#8a5a2b"/>
    <path d="M226 100 a30 30 0 1 1 -14 -26" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round"/>
    <polygon points="212,66 226,72 212,82" fill="#111"/>`, '0 0 240 200'),
}

// ── Upload ───────────────────────────────────────────────────────────────────

const ALL = { ...SIGNS, ...ROBOTS, ...HANDS }

const upload = async (name, svg) => {
  const path = encodeURIComponent('K53 Unpacked') + '/signs/' + name + '.svg'
  const r = await fetch(`${SUPA}/storage/v1/object/resources/${path}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'image/svg+xml', 'x-upsert': 'true' },
    body: svg,
  })
  if (!r.ok) throw new Error(`${name}: ${r.status} ${await r.text()}`)
}

console.log(`Uploading ${Object.keys(ALL).length} images to resources/K53 Unpacked/signs/ …`)
for (const [name, svg] of Object.entries(ALL)) {
  await upload(name, svg)
  console.log('  ✓', name + '.svg')
}
console.log('Done.')
