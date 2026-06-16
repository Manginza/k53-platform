/**
 * Seed script — Driving Schools
 * Run AFTER migration 16: node scripts/seed-driving-schools.mjs
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY env var
 * Coordinates are suburb-level approximations — sufficient for proximity ranking.
 *
 * Format: [name, province, suburb, address, phone, email, licence_codes[], hours, lat, lng]
 */

const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var first.')
  process.exit(1)
}

const SCHOOLS = [
  // ─── GAUTENG ──────────────────────────────────────────────────────────────
  ['SADES Driving School',         'Gauteng', 'Johannesburg', 'Johannesburg Central & Greater Soweto Servicing Areas', null, null,                              ['Code 8', 'Code 10', 'Code 14'],            'Mon–Fri: 07:00–18:00, Sat: 08:00–15:00',                            -26.2041, 28.0473],
  ['RITO Driving School',          'Gauteng', 'Soweto',       'Orlando & Freedom Park Locations, Soweto',              '0766992609', null,                      ['Code 8', 'Code 10'],                       'Mon–Fri: 07:00–18:00, Sat: 08:00–16:00',                            -26.2676, 27.8585],
  ['Kingdom Driving School',       'Gauteng', 'Tembisa',      '2845 Kingdom Street, Phomolong, Tembisa',               '061 452 2798', null,                    ['Code 8', 'Code 10', 'Code 14'],            'Mon–Sun: 07:00–18:00',                                              -25.9970, 28.2285],
  ['Group Stage Driving School',   'Gauteng', 'Tembisa',      '61 Nakuru Street, Ehlanzeni, Tembisa',                  '+27 79 293 3810', null,                 ['Code 8'],                                  'Mon–Fri: 07:00–17:00, Sat–Sun: 07:00–13:00',                        -25.9970, 28.2285],
  ['Abuti Driving School',         'Gauteng', 'Tembisa',      '3 Pom-Pon St, Tembisa',                                 '+27 61 451 4118', null,                 ['Code 8', 'Code 10'],                       'Mon–Sat: 08:00–17:00, Sun: 08:00–16:00',                            -25.9989, 28.0884],
  ['Confidence Driving School',    'Gauteng', 'Tembisa',      '411 Phadima St, Xubene, Tembisa',                       '+27 72 311 4797', null,                 ['Code 8'],                                  'Mon–Thu: 08:00–17:00, Fri: 08:00–15:00, Sat: 08:00–13:00',         -25.9970, 28.2285],
  ['Malinga Driving Academy',      'Gauteng', 'Tembisa',      'Corner Mall, Pv373 Kaalfontein, Tembisa',               '+27 72 261 7709', null,                 ['Code 8', 'Code 10'],                       'Mon–Sat: 08:00–17:00, Sun: 09:00–12:00',                            -25.9970, 28.2285],
  ['CSC Driving School',           'Gauteng', 'Tembisa',      '4165 Cameroun St, Tembisa',                             null, null,                              ['Code 8'],                                  'Mon–Sat: 08:00–17:00',                                              -25.9970, 28.2285],
  ['Seasana Driving School',       'Gauteng', 'Tembisa',      'Winnie Mandela Section, Tembisa',                       '081 234 5622', null,                    ['Code 8'],                                  'Mon–Sat: 08:00–17:00',                                              -25.9970, 28.2285],
  ['SA Top Driving School',        'Gauteng', 'Tembisa',      'Tlamatlama Section, Tembisa',                           '079 123 4832', null,                    ['Code 8', 'Code 10'],                       'Mon–Sat: 08:00–17:00',                                              -25.9970, 28.2285],
  ['All-In-One Driving Academy',   'Gauteng', 'Tembisa',      'Mayibuye Section, Tembisa',                             null, null,                              ['Code 8'],                                  'Mon–Sat: 08:00–17:00',                                              -25.9970, 28.2285],
  ['My Driving School',            'Gauteng', 'Centurion',    'Centurion Office (Servicing Waltloo/Centurion DLTC)',   '082 895 6503', 'ben@mydrivingschool.co.za', ['Code 8', 'Code 10'],                   'Mon–Sat: 08:00–20:00',                                              -25.8616, 28.1887],
  ['DriveTech Driving School',     'Gauteng', 'Pretoria',     'Pretoria & Centurion Doorstep Delivery',                null, null,                              ['Code 8', 'Code 10', 'Motorcycles'],        'Mon–Sat: 07:00–19:00',                                              -25.7479, 28.1878],
  ['Olympic Academy of Driving',   'Gauteng', 'Pretoria',     'Pretoria/Centurion Operational Servicing',              '082 906 0250', 'admin@olympicdriving.co.za', ['Code 8', 'Code 10'],                 'Mon–Sat: 07:00–18:00',                                              -25.7479, 28.1878],

  // ─── WESTERN CAPE ─────────────────────────────────────────────────────────
  ['He and She Driving School',    'Western Cape', 'Cape Town',      'Cape Town Head Office (TETA Accredited, 56 yrs exp)',   null, null,                       ['Code 8', 'Code 10', 'Code 14'],            'Mon–Fri: 07:00–18:00, Sat: 08:00–15:00',                            -33.9249, 18.4241],
  ['Moeneebs Driving Academy',     'Western Cape', 'Mitchells Plain','15 Chelsea Ave, Colorado Park, Mitchells Plain',        '+27 73 339 7364', 'info@moeneebsdrivingacademy.co.za', ['Code 8'],           'Mon–Sat: 07:00–18:00',                                              -34.0410, 18.6212],
  ['One Stop Driving School',      'Western Cape', 'Retreat',        '5c Military Rd, Retreat, Cape Town',                   '+27 21 701 7242', null,            ['Code 8'],                                  'Mon–Fri: 07:00–19:00, Sat: 07:00–13:00',                            -34.0050, 18.5010],
  ['NWDRIVE K53 Driving School',   'Western Cape', 'Tableview',      '20 Beaconsfield Road, Tableview, Bloubergstrand',       '+27 61 198 3342', null,            ['Code 8'],                                  'Mon–Fri: 05:00–20:00, Sat: 06:00–18:00, Sun: 07:30–14:00',         -33.8240, 18.4890],
  ['Gold Class Driving School',    'Western Cape', 'Milnerton',      'Centre Point Shopping Centre, 1 Loxton Rd, Milnerton',  '+27 78 573 0647', null,            ['Code 8', 'Code 10', 'Code 14'],            'Mon–Sun: 06:00–20:00',                                              -33.8690, 18.4980],
  ['Cowboy Driving School',        'Western Cape', 'Bellville',      '21 Robert Sobukwe Rd, Belrail, Cape Town',              '+27 74 757 5785', null,            ['Code 8'],                                  'Mon–Thu: 06:30–19:00, Fri: 06:30–24:00, Sat: 24hrs',               -33.9065, 18.6303],
  ['Modern Driving School ZA',     'Western Cape', 'Milnerton',      'Millvale House, 6 Millvale Rd, Milnerton',              '+27 84 844 9247', null,            ['Code 8', 'Code 10'],                       'Mon–Sun: 08:00–20:00',                                              -33.8690, 18.4980],
  ['Honeybee Driving School',      'Western Cape', 'Kenilworth',     'Doncaster Road, Kenilworth, Cape Town',                 '+27 72 493 4906', null,            ['Code 8'],                                  'Mon–Sun: 07:00–21:00',                                              -34.0020, 18.5050],
  ['Torque Driving Academy',       'Western Cape', 'Athlone',        '90 Comet Rd, Athlone, Cape Town',                      '+27 82 992 2827', null,            ['Code 8'],                                  'Mon–Fri: 08:00–18:00, Sat: 08:00–17:00',                            -33.9615, 18.5270],
  ['Driving Cape Town PTY LTD',    'Western Cape', 'Cape Town',      '12 Upper Liesbeek Rd, Cape Town',                      '+27 74 743 6339', null,            ['Code 8'],                                  'Mon–Sun: 06:00–20:00',                                              -33.9249, 18.4241],
  ["Sam's Driving Academy",        'Western Cape', 'Cape Town',      '93 Canterbury St, District Six, Cape Town',             '+27 81 078 3572', null,            ['Code 8'],                                  'Mon–Fri: 07:00–19:00, Sat: 08:00–18:00, Sun: 09:00–16:00',         -33.9249, 18.4241],
  ['Youngs Driving School',        'Western Cape', 'Cape Town',      'Madeira Dr, Costa Da Gama, Cape Town',                 '+27 63 960 8852', null,            ['Code 8'],                                  'Mon–Fri: 08:00–18:00, Sat: 09:00–18:00',                            -34.0100, 18.4850],
  ['BSI Driving Academy',          'Western Cape', 'Athlone',        '75 Koodoo St, Athlone, Cape Town',                     '+27 74 133 0069', null,            ['Code 8'],                                  'Mon–Sun: 07:00–19:00',                                              -33.9615, 18.5270],
  ['Frontline Driving Academy',    'Western Cape', 'Cape Town',      '34A Selbourne Rd, University Estate',                  '+27 72 381 4909', null,            ['Code 8'],                                  'Mon–Sat: 06:00–18:30',                                              -33.9249, 18.4241],
  ['DriveSA Driving Academy',      'Western Cape', 'Cape Town',      'Roeland St, Gardens, Cape Town',                       '+27 84 896 9952', null,            ['Code 8'],                                  'Mon–Sun: 07:00–20:00',                                              -33.9249, 18.4241],
  ["Lana's Driving School",        'Western Cape', 'Cape Town',      'Mobile pickups — suburb-wide service',                  null, null,                        ['Code 8', 'Code 10'],                       'Mon–Sat: 08:00–18:00',                                              -33.9249, 18.4241],

  // ─── KWAZULU-NATAL ────────────────────────────────────────────────────────
  ['Apex Driving School',          'KwaZulu-Natal', 'Umlazi',         'Serving Umlazi, Chatsworth, Amanzimtoti & South Durban',  '063 639 2501', null,           ['Code 8', 'Code 10'],                       'Mon–Sat: 06:00–18:00',                                              -29.9700, 30.8800],
  ['Amachunu Driving Solutions',   'KwaZulu-Natal', 'Durban',         'Unit 13, Lancers Centre, Lancers Rd, Durban Central',     '071 317 2196', null,           ['Code 8', 'Code 10', 'Code 14', 'Motorcycles'], 'Mon–Sat: 08:00–17:00',                                          -29.8587, 31.0218],
  ['Mabanga Driving School',       'KwaZulu-Natal', 'KwaMashu',       'Unit 68 Ntuzuma Rd, KwaMashu, Durban',                    '+27 82 769 2975', null,         ['Code 8', 'Code 10'],                       'Mon–Thu: 06:00–17:00, Fri: 06:00–15:00, Sat: 07:00–13:00',         -29.7500, 30.9300],
  ['Chettys Driving School',       'KwaZulu-Natal', 'Amanzimtoti',    '3 Mayville Terrace, Amanzimtoti',                         '072 212 8367', null,           ['Code 8', 'Code 10', 'Code 14', 'Motorcycles'], 'Mon–Fri: 06:00–19:00, Sat: 07:00–14:00, Sun: 07:00–12:00',     -30.0547, 30.8754],
  ['On-Track Driving School',      'KwaZulu-Natal', 'Durban',         '135 Musgrave Rd, Musgrave, Durban',                       '+27 83 475 1399', null,         ['Code 8'],                                  'Mon–Fri: 06:00–18:00, Sat: 06:00–16:00, Sun: 06:00–14:00',         -29.8587, 31.0218],
  ['Safety First Driving Academy', 'KwaZulu-Natal', 'Kloof',          '5 Sailor Rd, Kloof, Durban',                              '+27 73 450 3324', null,         ['Code 8'],                                  'Mon–Thu: 07:00–17:00, Fri: 07:00–15:00, Sat: 07:00–13:00',         -29.8213, 30.8549],
  ['Nazareth Biking School',       'KwaZulu-Natal', 'Durban',         'Playfair Rd, North Beach, Durban',                        '+27 83 441 8152', null,         ['Motorcycles'],                             'Mon–Fri: 08:00–16:00, Sat: 08:00–13:00',                            -29.8587, 31.0218],
  ['Eugenes Driving School',       'KwaZulu-Natal', 'Pinetown',       'Arbour House, 67 Crompton St, Pinetown',                  '+27 31 836 4182', null,         ['Code 8', 'Code 10'],                       'Mon–Sat: 07:00–17:00',                                              -29.8213, 30.8549],
  ['R J Driving School',           'KwaZulu-Natal', 'Durban',         '65 Ettrick Rd, Bluff, Durban',                            '+27 79 811 0267', null,         ['Code 8'],                                  'Mon–Fri: 07:00–17:00, Sat–Sun: 07:00–12:00',                        -29.9500, 30.9700],
  ['Sakhi Driving School',         'KwaZulu-Natal', 'Durban',         '577 Mahatma Gandhi Rd, South Beach, Durban',              '+27 73 097 2723', null,         ['Code 8'],                                  'Mon–Fri: 06:00–18:00, Sat: 07:00–12:00',                            -29.8587, 31.0218],
  ['CY Driving School',            'KwaZulu-Natal', 'Durban',         'Sangro House, Office 521, 417 Anton Lembede St',          '+27 73 168 2769', null,         ['Code 8', 'Code 10'],                       'Mon–Fri: 06:00–18:00, Sat: 08:00–17:00',                            -29.8587, 31.0218],
  ["Helina's Driving School",      'KwaZulu-Natal', 'Durban',         '10th Floor, West Towers, 331 West St, Durban',            '+27 62 319 2940', null,         ['Code 8'],                                  'Mon–Fri: 07:00–17:00, Sat: 07:00–14:00',                            -29.8587, 31.0218],
  ['SA Driver Training Centre',    'KwaZulu-Natal', 'Durban',         '182 Kenilworth Rd, Overport, Durban',                     '+27 83 727 0672', null,         ['Code 8', 'Code 10'],                       'Mon–Fri: 07:00–18:00, Sat–Sun: 08:00–16:00',                        -29.8587, 31.0218],
  ['Dalais Academy of Driving',    'KwaZulu-Natal', 'Durban',         '17 Haddock Ave, Newlands East',                           '+27 78 218 5213', null,         ['Code 8'],                                  'Mon–Fri: 05:30–19:30, Sat: 05:00–14:00, Sun: 05:00–13:00',         -29.8587, 31.0218],
  ['Express Driver Training',      'KwaZulu-Natal', 'Durban',         'Shop 10 C, Aquarius Centre, 555 Mountbatten Dr',          '+27 71 768 1920', null,         ['Code 8'],                                  'Mon–Fri: 07:00–17:00, Sat: 08:00–15:00, Sun: 08:00–13:00',         -29.8587, 31.0218],
  ['StreetSmart Driving Academy',  'KwaZulu-Natal', 'Durban',         '89 Andorra Rd, Bluff',                                    '+27 72 443 0996', null,         ['Code 8'],                                  'Mon–Sat: 07:00–17:00',                                              -29.9500, 30.9700],
  ['Nastec Security & Training',   'KwaZulu-Natal', 'Durban',         '88 Blake Rd, KwaKhangela, Durban',                        '+27 31 301 0220', null,         ['Code 10', 'Code 14'],                      'Mon–Tue: 09:00–16:00',                                              -29.8587, 31.0218],
]

async function seed() {
  const rows = SCHOOLS.map(([name, province, suburb, address, phone, email, licence_codes, hours, lat, lng]) => ({
    name, province, suburb, address, phone, email, licence_codes, hours, lat, lng, is_verified: false,
  }))

  const res = await fetch(`${SUPABASE_URL}/rest/v1/driving_schools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Prefer': 'resolution=ignore-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  })

  const body = await res.json()
  if (!res.ok) {
    console.error('Seed failed:', JSON.stringify(body, null, 2))
    process.exit(1)
  }

  console.log(`✓ Seeded ${Array.isArray(body) ? body.length : '?'} driving schools.`)
}

seed()
