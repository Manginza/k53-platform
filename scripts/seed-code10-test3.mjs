// seed-code10-test3.mjs
// Seeds all 45 Code 10 Test 3 questions with Supabase-hosted images.
// Image bucket: resources / code10 / Test 3 /
// Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-code10-test3.mjs

const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) { console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const COURSE_ID   = 3   // Code 10 — Heavy Motor Vehicle
const TEST_NUMBER = 3
const IMG_BASE    = `${SUPABASE_URL}/storage/v1/object/public/resources/code10/Test%203`

const img = (file) => ({ image_url: `${IMG_BASE}/${file}`, image_ref: file })
const noImg = { image_url: null, image_ref: null }

// ─── 45 Questions — correct answers per the official Code 10 Memo 3 ──────────
// Grammar and spelling corrected throughout.
const QUESTIONS = [
  // 1
  { ...img('3c10.1.img.png'),
    question: 'This sign warns you that ...',
    option_a: 'There is a robot (traffic signal) ahead.',
    option_b: 'There is a compulsory police stop ahead.',
    option_c: 'You are now entering an urban area.',
    correct_answer: 'A' },

  // 2
  { ...img('3c10.2.img.png'),
    question: 'What is the purpose of these information arrows?',
    option_a: 'To indicate a lane that should not be used by light motor vehicles.',
    option_b: 'To indicate a reserved lane for specific motor vehicles.',
    option_c: 'To indicate the direction of traffic flow in a specific lane.',
    correct_answer: 'C' },

  // 3
  { ...noImg,
    question: 'How much breath sample is used to measure the alcohol level in your body?',
    option_a: '100 ml',
    option_b: '10 ml',
    option_c: '1 000 ml',
    correct_answer: 'C' },

  // 4
  { ...noImg,
    question: 'Which of the following statements is correct? A silencer ...',
    option_a: 'Need not be fitted only on heavy vehicles.',
    option_b: 'One with a small hole in it is acceptable.',
    option_c: 'Must be fitted to a vehicle to restrict engine noise to a suitable level.',
    correct_answer: 'C' },

  // 5
  { ...noImg,
    question: 'What is the duty of a driver when refilling the fuel tank of a motor vehicle?',
    option_a: 'The driver is allowed to start the vehicle while fuel is being pumped, to check if the tank is full.',
    option_b: 'The driver must check if they are filling the tank with diesel instead of petrol.',
    option_c: 'The driver may not allow the engine to run while flammable fuel is being transferred to the fuel tank.',
    correct_answer: 'C' },

  // 6
  { ...noImg,
    question: 'The main beam (bright light) of your vehicle must be able to show objects that are at least ... away.',
    option_a: '45 m',
    option_b: '100 m',
    option_c: '150 m',
    correct_answer: 'B' },

  // 7
  { ...noImg,
    question: "If you have a driver's licence and you are driving a vehicle, where should the licence document be?",
    option_a: 'In a safe place at home.',
    option_b: 'With you in the vehicle.',
    option_c: 'In a safe place at home, provided you have a copy with you.',
    correct_answer: 'B' },

  // 8
  { ...noImg,
    question: "Which of the following is the correct statement? A driver may stop their vehicle on the roadway of a public road ...",
    option_a: 'In an intersection.',
    option_b: 'In contravention of any road traffic sign.',
    option_c: 'When directed by a traffic officer.',
    correct_answer: 'C' },

  // 9
  { ...noImg,
    question: 'Which statement is correct about alcohol?',
    option_a: 'A driver is not allowed to drive a motor vehicle whilst under the influence of alcohol.',
    option_b: 'You may drive as long as you only drank beer.',
    option_c: 'You may drive a vehicle if you have only drunk one bottle of wine.',
    correct_answer: 'A' },

  // 10
  { ...noImg,
    question: 'When driving a vehicle alone, what documents must you carry with you?',
    option_a: "Any person's valid driver's licence, if you only have a learner's licence.",
    option_b: "A certified copy of your driver's licence and ID document.",
    option_c: "Your original valid driver's licence.",
    correct_answer: 'C' },

  // 11
  { ...noImg,
    question: 'When are you allowed to drive in the right lane of a freeway?',
    option_a: "At any time, as long as you don't stop in the right-hand lane.",
    option_b: 'Only when overtaking another vehicle.',
    option_c: 'When you are driving at a higher speed than other vehicles.',
    correct_answer: 'B' },

  // 12
  { ...noImg,
    question: 'How much blood sample is used to measure your alcohol level?',
    option_a: '10 ml',
    option_b: '1 000 ml',
    option_c: '100 ml',
    correct_answer: 'C' },

  // 13
  { ...noImg,
    question: 'Any load carried on a vehicle must ...',
    option_a: 'Be covered with sheeting.',
    option_b: 'Have red flags or triangles tied to it.',
    option_c: "Not obstruct the driver's view of the road.",
    correct_answer: 'C' },

  // 14
  { ...img('3c10.3.img.png'),
    question: 'This road sign does not allow ...',
    option_a: 'Unauthorised light motor vehicles to enter there.',
    option_b: 'All vehicles to enter there.',
    option_c: 'Motor vehicles to park outside.',
    correct_answer: 'A' },

  // 15
  { ...img('3c10.4.img.png'),
    question: 'This sign indicates to the driver of a vehicle that ...',
    option_a: 'There is a T-junction ahead.',
    option_b: 'Only residents may turn left.',
    option_c: 'The roadway to the left is not a through road.',
    correct_answer: 'C' },

  // 16
  { ...noImg,
    question: 'Which of the following vehicles may not be used on a freeway?',
    option_a: 'An animal-drawn vehicle.',
    option_b: 'An articulated motor vehicle.',
    option_c: 'An abnormally loaded motor vehicle.',
    correct_answer: 'A' },

  // 17
  { ...noImg,
    question: 'Which one of the following statements is wrong?',
    option_a: "It is not the driver's responsibility to ensure a child is in a child restraint.",
    option_b: 'The driver of a motor vehicle shall ensure that a child seated in a car wears a seatbelt, and uses an appropriate child restraint where available.',
    option_c: 'If a seat not equipped with a seatbelt is available, the driver shall ensure that a child aged 14 years or younger is seated in the rear seat.',
    correct_answer: 'A' },

  // 18
  { ...img('3c10.5.img.png'),
    question: 'What action should be taken when you come across this road marking?',
    option_a: 'Slow down if other traffic is approaching the intersection and stop if necessary.',
    option_b: 'Only follow this arrestor bed marking ahead if your brakes have failed.',
    option_c: 'Ensure not to cross the prohibition line that follows the sign.',
    correct_answer: 'A' },

  // 19
  { ...img('3c10.6.img.png'),
    question: 'What is the purpose of these road markings?',
    option_a: 'To warn you in good time that the number of lanes is going to reduce, and point out which lane(s) will end.',
    option_b: 'To warn you that there is a no-overtaking or no-crossing line ahead. If you are driving in the lane for oncoming traffic, return to your lane.',
    option_c: 'To warn you of mandatory direction arrows ahead, so that if you are in a lane that does not go where you want, you can change it in good time.',
    correct_answer: 'B' },

  // 20
  { ...noImg,
    question: 'Which statement is false? A vehicle may be used on a public road if ...',
    option_a: 'The fuel tank is defective.',
    option_b: 'The fuel cap is effective and closed.',
    option_c: 'The battery and electrical wiring are properly installed.',
    correct_answer: 'A' },

  // 21
  { ...noImg,
    question: 'What is the duty of a driver regarding pedestrians crossing a roadway within a pedestrian crossing?',
    option_a: 'A driver must yield right of way to a pedestrian crossing a roadway within a pedestrian crossing.',
    option_b: 'A driver must yield to all pedestrians wishing to cross or enter a public roadway.',
    option_c: 'A driver must only stop for a pedestrian wishing to enter the roadway at a pedestrian signal.',
    correct_answer: 'A' },

  // 22
  { ...noImg,
    question: 'How long must an indicator be displayed?',
    option_a: 'For about 3 minutes.',
    option_b: 'For long enough to indicate your intentions to vehicles or persons approaching you.',
    option_c: 'For about 2 minutes.',
    correct_answer: 'B' },

  // 23
  { ...img('3c10.7.img.png'),
    question: 'What is the purpose of these road markings?',
    option_a: 'To warn you of the mandatory direction arrows ahead, so that if you are travelling in a lane that is not going to where you want, you can change lanes in good time.',
    option_b: 'To warn you that there is a no-overtaking or no-crossing line ahead. If you are driving in the lane for oncoming traffic, return to your lane.',
    option_c: 'To warn you in good time that the number of lanes is going to reduce, and point out which lane(s) will end.',
    correct_answer: 'A' },

  // 24
  { ...img('3c10.8.img.png'),
    question: 'Which of these chevron signs indicates a T-junction?',
    option_a: 'Top sign.',
    option_b: 'None of them.',
    option_c: 'Bottom sign.',
    correct_answer: 'A' },

  // 25
  { ...img('3c10.9.img.png'),
    question: 'This road marking shows that ...',
    option_a: 'The road surface is uneven.',
    option_b: 'Traffic may not overtake or cross it on either side.',
    option_c: 'It is a lane reserved for buses only.',
    correct_answer: 'B' },

  // 26
  { ...img('3c10.10.img.png'),
    question: 'This sign shows you that there is a ...',
    option_a: 'Curve to the left.',
    option_b: 'Temporary obstruction on the left of the road.',
    option_c: 'Temporary detour to the left.',
    correct_answer: 'B' },

  // 27
  { ...img('3c11.11.img.png'),
    question: 'This sign shows you that you ...',
    option_a: 'Can expect a sharp bend to the right.',
    option_b: 'Must turn right at the next road.',
    option_c: 'Must turn right immediately.',
    correct_answer: 'B' },

  // 28
  { ...noImg,
    question: 'How far must you park from either side of a fire hydrant?',
    option_a: '1.5 metres',
    option_b: '750 mm',
    option_c: '1 metre',
    correct_answer: 'A' },

  // 29
  { ...img('3c11.12.img.png'),
    question: 'This sign shows you that there is a ...',
    option_a: 'Sharp curve to the left ahead.',
    option_b: 'Obstruction on the left of the road.',
    option_c: 'Detour to the left.',
    correct_answer: 'A' },

  // 30
  { ...img('3c11.13.img.png'),
    question: 'What does this road sign indicate in advance to road users?',
    option_a: 'A toll route.',
    option_b: 'An airport route.',
    option_c: 'An alternative route to the same city as the toll route.',
    correct_answer: 'A' },

  // 31
  { ...noImg,
    question: 'If a person was injured or killed during an accident and the vehicles involved are blocking the road, no vehicle may be moved from the position it stopped until ...',
    option_a: 'Its position has been clearly marked on the road surface by the person moving the vehicle, or such removal was authorised by a traffic officer.',
    option_b: 'A certified tow-truck arrives on the scene and removes it from the roadway.',
    option_c: 'The driver authorises such removal.',
    correct_answer: 'A' },

  // 32
  { ...noImg,
    question: 'What is the minimum distance at which stop lamps must be visible to a person with normal eyesight in sunlight?',
    option_a: '10 m',
    option_b: '20 m',
    option_c: '30 m',
    correct_answer: 'C' },

  // 33
  { ...img('3c11.15.img.png'),
    question: 'What is the purpose of these road markings?',
    option_a: 'To indicate the area of the road where stopping is permitted.',
    option_b: 'To indicate the area of the road where overtaking is not permitted.',
    option_c: 'To indicate the area of the road where stopping is not permitted.',
    correct_answer: 'C' },

  // 34
  { ...noImg,
    question: 'How far may you park from the left edge of a roadway outside an urban area?',
    option_a: 'Not more than 450 mm from the edge of the roadway.',
    option_b: 'Not more than 1 m from the edge of the roadway.',
    option_c: 'A vehicle may not park on a public road unless in a parking bay.',
    correct_answer: 'B' },

  // 35
  { ...noImg,
    question: 'What is the minimum distance at which a number plate must be readable to a person with normal eyesight in sunlight?',
    option_a: '20 m',
    option_b: '30 m',
    option_c: '10 m',
    correct_answer: 'A' },

  // 36
  { ...img('3c11.16.img.png'),
    question: 'What is the purpose of these road markings?',
    option_a: 'To inform you in good time that the number of lanes is going to increase, and point out which lane(s) will be added.',
    option_b: 'To warn you in good time that the number of lanes is going to reduce, and point out which lane(s) will end.',
    option_c: 'To warn you of mandatory direction arrows ahead, so that if you are in a lane that does not go where you want, you can change it in good time.',
    correct_answer: 'A' },

  // 37
  { ...img('3c11.17.img.png'),
    question: 'What is this traffic controller signalling drivers to do?',
    option_a: 'To proceed right, if they are approaching from the front.',
    option_b: 'To stop, if they are approaching from the front.',
    option_c: 'To stop, if they are approaching from either the back or front.',
    correct_answer: 'C' },

  // 38
  { ...noImg,
    question: 'Any load carried on a vehicle must ...',
    option_a: 'Have red flags or triangles tied to it.',
    option_b: 'Be covered with sheeting.',
    option_c: 'Not touch the surface of the road.',
    correct_answer: 'C' },

  // 39
  { ...img('3c11.18.img.png'),
    question: 'This warning sign shows that ...',
    option_a: 'The road on which you are travelling is going to change to a gravel road.',
    option_b: 'The road is ending ahead.',
    option_c: 'Potholes are to be found on the road ahead.',
    correct_answer: 'A' },

  // 40
  { ...img('3c11.19.img.png'),
    question: 'What is the purpose of these road markings?',
    option_a: 'To warn you that there is a no-overtaking or no-crossing line ahead. If you are driving in the lane for oncoming traffic, return to your lane.',
    option_b: 'To warn you in good time that the number of lanes is going to reduce, and point out which lane(s) will end.',
    option_c: 'To warn you of mandatory direction arrows ahead, so that if you are in a lane that does not go where you want, you can change it in good time.',
    correct_answer: 'B' },

  // 41
  { ...img('3c11.20.img.png'),
    question: 'This sign shows you that you must ...',
    option_a: 'Stop and then turn left or drive straight on.',
    option_b: 'Turn left at the stop sign.',
    option_c: 'Stop, but if you want to turn left, you may use it as a yield sign.',
    correct_answer: 'C' },

  // 42
  { ...img('3c11.21.img.png'),
    question: 'To increase or decrease the speed of the vehicle you need to use the ...',
    option_a: 'Brakes.',
    option_b: 'Clutch.',
    option_c: 'Accelerator.',
    correct_answer: 'C' },

  // 43
  { ...noImg,
    question: 'Before you reach the exit of a freeway, in which lane should you position yourself?',
    option_a: 'In the middle lane.',
    option_b: 'In the left-hand lane.',
    option_c: 'On the shoulder of the road.',
    correct_answer: 'B' },

  // 44
  { ...img('3c11.22.img.png'),
    question: 'Which of these chevron signs indicates a dead-end road?',
    option_a: 'Top sign.',
    option_b: 'Bottom sign.',
    option_c: 'None of them.',
    correct_answer: 'B' },

  // 45
  { ...img('3c11.23.img.png'),
    question: 'What does this road marking indicate?',
    option_a: 'An area of the road that must be kept clear at all times at an intersection.',
    option_b: 'A pick-up/drop-off point for motor vehicles.',
    option_c: 'An area of the road where disabled people should park.',
    correct_answer: 'A' },
]

// ─── SEED ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding Code 10 Test 3...\n')

  // Clear any existing test 3 questions
  const del = await fetch(
    `${SUPABASE_URL}/rest/v1/quiz_questions?course_id=eq.${COURSE_ID}&test_number=eq.${TEST_NUMBER}`,
    { method: 'DELETE', headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  )
  if (!del.ok) console.warn('  Warning: clear step returned', del.status)
  else console.log('  Cleared existing Test 3 rows.')

  // Build payload
  const payload = QUESTIONS.map(q => ({
    course_id:      COURSE_ID,
    test_number:    TEST_NUMBER,
    question:       q.question,
    option_a:       q.option_a,
    option_b:       q.option_b,
    option_c:       q.option_c,
    correct_answer: q.correct_answer,
    image_url:      q.image_url ?? null,
    image_ref:      q.image_ref ?? null,
  }))

  const ins = await fetch(`${SUPABASE_URL}/rest/v1/quiz_questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey:          KEY,
      Authorization:  `Bearer ${KEY}`,
      Prefer:         'return=minimal',
    },
    body: JSON.stringify(payload),
  })

  if (ins.ok) {
    console.log(`\n✅ Seeded ${payload.length} questions for Code 10 Test 3 (status ${ins.status})`)
    console.log(`   Image questions : ${payload.filter(q => q.image_url).length}`)
    console.log(`   Text-only       : ${payload.filter(q => !q.image_url).length}`)
  } else {
    const text = await ins.text()
    console.error(`✗ Seed failed (${ins.status}):`, text)
    process.exit(1)
  }
}

seed().catch(e => { console.error('Seed error:', e.message); process.exit(1) })
