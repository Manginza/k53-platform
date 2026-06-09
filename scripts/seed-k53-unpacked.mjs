// seed-k53-unpacked.mjs — Seeds the "K53 Unpacked" manual:
//   chapters, pages, quizzes, questions, options for the ku_* tables.
//
// Requires migration scripts/migrations/15_k53_unpacked_schema.sql to have been run first.
//
// Run (PowerShell):
//   $env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"; node scripts/seed-k53-unpacked.mjs
// Run (bash):
//   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> node scripts/seed-k53-unpacked.mjs
// If SUPABASE_SERVICE_ROLE_KEY is not set in the env, the script falls back to
// reading it (and the URL) from .env.local.

import { readFileSync } from 'fs'

let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
let KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback: read from .env.local
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  const get = k => (env.match(new RegExp(k + '=(.*)')) || [])[1]?.replace(/[\r\s]+$/, '')
  SUPABASE_URL ||= get('NEXT_PUBLIC_SUPABASE_URL')
  if (!KEY || !KEY.startsWith('eyJ')) {
    const fromFile = get('SUPABASE_SERVICE_ROLE_KEY')
    if (fromFile && fromFile.startsWith('eyJ')) KEY = fromFile
  }
} catch {}

if (!SUPABASE_URL) { console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL not found'); process.exit(1) }
if (!KEY || !KEY.startsWith('eyJ')) {
  console.error('ERROR: A real SUPABASE_SERVICE_ROLE_KEY is required (set the env var or put it in .env.local)')
  process.exit(1)
}

const H = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` }

const post = async (table, body) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`POST ${table} ${r.status}: ${await r.text()}`)
  return r.json()
}

const del = async (table, filter) => {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, { method: 'DELETE', headers: H }).catch(() => {})
}

// ─── CHAPTERS (page_* = storage image numbers in "resources/K53 Unpacked/") ───

const CHAPTERS = [
  { chapter_number: null, title: 'Contents',                              description: 'Table of contents',                                                                          section_reference: null,        page_start: 4,  page_end: 5,   is_front_matter: true,  display_order: 0  },
  { chapter_number: 1,  title: "Overview — The Learner's Licence Test",   description: "What a learner's licence is, age & health requirements, validity, how the test works and pass marks", section_reference: 'Section 1',  page_start: 6,  page_end: 8,   is_front_matter: false, display_order: 1  },
  { chapter_number: 2,  title: 'Controls of the Vehicle',                 description: 'Motor-vehicle and motorcycle controls and what each one is used for',                          section_reference: 'Section 2',  page_start: 9,  page_end: 10,  is_front_matter: false, display_order: 2  },
  { chapter_number: 3,  title: 'Defensive Driving — the K53 Way',         description: 'The Search–Identify–Predict–Decide–Execute system, following distance, mirrors and blind spots', section_reference: 'Section 3',  page_start: 11, page_end: 13,  is_front_matter: false, display_order: 3  },
  { chapter_number: 4,  title: 'Road Signs Overview',                     description: 'The purpose of signs, the sign groups, temporary signs and symbols',                          section_reference: 'Section 4',  page_start: 14, page_end: 15,  is_front_matter: false, display_order: 4  },
  { chapter_number: 5,  title: 'Regulatory Signs',                        description: 'Control signs, command signs, prohibition signs and reservation signs',                        section_reference: 'Section 5',  page_start: 16, page_end: 27,  is_front_matter: false, display_order: 5  },
  { chapter_number: 6,  title: 'Warning Signs',                           description: 'Road-layout, direction-of-movement, symbolic and hazard warning signs',                       section_reference: 'Section 6',  page_start: 28, page_end: 36,  is_front_matter: false, display_order: 6  },
  { chapter_number: 7,  title: 'Information Signs',                        description: 'Signs that inform you about the road layout and facilities ahead',                            section_reference: 'Section 7',  page_start: 37, page_end: 39,  is_front_matter: false, display_order: 7  },
  { chapter_number: 8,  title: 'Guidance Signs',                          description: 'Route markers, direction and tourism signs, and freeway guidance signs',                      section_reference: 'Section 8',  page_start: 40, page_end: 46,  is_front_matter: false, display_order: 8  },
  { chapter_number: 9,  title: 'Road Surface Markings',                   description: 'Lines, painted symbols and word markings on the road surface',                                section_reference: 'Section 9',  page_start: 47, page_end: 53,  is_front_matter: false, display_order: 9  },
  { chapter_number: 10, title: 'Rules of the Road',                       description: 'Speed limits, following distance, overtaking, lanes, traffic circles, parking and lights',     section_reference: 'Section 10', page_start: 54, page_end: 69,  is_front_matter: false, display_order: 10 },
  { chapter_number: 11, title: "Learner's Licence Mock Test",            description: "Exam-standard mock questions drawn from the manual's own practice tests",                     section_reference: 'Section 11', page_start: 70, page_end: 81,  is_front_matter: false, display_order: 11 },
  { chapter_number: 12, title: 'K53 Driving Test — Overview',            description: 'What the K53 driving test involves and how it is marked',                                      section_reference: 'Section 12', page_start: 82, page_end: 84,  is_front_matter: false, display_order: 12 },
  { chapter_number: 13, title: 'Use of the Vehicle Controls',            description: 'Correct, marked use of each vehicle control during the driving test',                         section_reference: 'Section 13', page_start: 85, page_end: 92,  is_front_matter: false, display_order: 13 },
  { chapter_number: 14, title: 'The K53 Actions Explained',              description: 'Observation, signalling and the standard K53 action sequences',                               section_reference: 'Section 14', page_start: 93, page_end: 94,  is_front_matter: false, display_order: 14 },
  { chapter_number: 15, title: 'The Motor Vehicle Driving Test',         description: 'Pre-trip inspection, the yard test and the road test',                                        section_reference: 'Section 15', page_start: 95, page_end: 129, is_front_matter: false, display_order: 15 },
]

// ─── QUIZ DATA  ──────────────────────────────────────────────────────────────
// Format per question: { text, a, b, c, [d], correct:'A'|'B'|'C'|'D', exp, page }
// `page` = storage image number the answer can be confirmed on.

const QUIZ_DATA = {
  // 1 — Overview
  1: [
    { text: 'What is the minimum age to apply for a learner’s licence for a light motor vehicle not heavier than 3 500 kg?', a: '16 years', b: '17 years', c: '18 years', d: '21 years', correct: 'B', exp: 'A learner’s licence for a light motor vehicle (≤ 3 500 kg) may be obtained from 17 years of age. Motorcycles under 125 cc: 16; all vehicles including motorcycles over 125 cc: 18.', page: 6 },
    { text: 'How long is a learner’s licence valid for?', a: '12 months', b: '18 months', c: '24 months', d: 'Until you pass your driving test', correct: 'C', exp: 'A learner’s licence is valid for 24 months from the date of issue.', page: 7 },
    { text: 'While driving on a learner’s licence you must be accompanied by a licensed driver who is seated…', a: 'Anywhere in the vehicle', b: 'Next to you (or, if not possible, directly behind you)', c: 'In the back seat only', d: 'You do not need to be accompanied', correct: 'B', exp: 'A learner driver must be accompanied by the holder of a valid driving licence seated next to you, or directly behind you if that is not possible.', page: 7 },
    { text: 'A person with a motorcycle learner’s licence may…', a: 'Carry one passenger', b: 'Carry passengers only during the day', c: 'Not carry a passenger', d: 'Carry passengers on freeways only', correct: 'C', exp: 'A motorcycle learner may not carry a passenger and must ride unaccompanied — there is no instructor seated with you.', page: 7 },
    { text: 'In the learner’s test, how many questions are set on the rules of the road and how many must you get right?', a: '28 questions, 22 correct', b: '28 questions, 25 correct', c: '30 questions, 23 correct', d: '20 questions, 15 correct', correct: 'A', exp: 'Rules of the road: 28 questions, pass mark 22 (74%). Road signs/signals/markings: 28 questions, pass mark 23. Controls of the vehicle: 8 questions, pass mark 6.', page: 8 },
    { text: 'Which of the following can disqualify you from obtaining a learner’s licence?', a: 'Wearing spectacles', b: 'Uncontrolled epilepsy or sudden attacks of giddiness or fainting', c: 'Being over 60 years of age', d: 'Driving an automatic vehicle', correct: 'B', exp: 'Conditions such as uncontrolled epilepsy, sudden attacks of giddiness/fainting, mental illness, muscular incoordination, uncontrolled diabetes or defective vision can disqualify an applicant.', page: 6 },
    { text: 'What is the pass mark for the “controls of the vehicle” section of the learner’s test?', a: '6 out of 8', b: '8 out of 8', c: '4 out of 8', d: '5 out of 8', correct: 'A', exp: 'The controls of the vehicle section has 8 questions and the pass mark is 6 (75%).', page: 8 },
    { text: 'What does a learner’s licence authorise you to do?', a: 'Drive alone anywhere', b: 'Drive on public roads (including freeways) provided you are accompanied by a licensed driver', c: 'Drive only in a parking lot', d: 'Drive a vehicle of any class', correct: 'B', exp: 'A learner may drive on public roads, including freeways, only while accompanied by the holder of a valid driving licence for that class of vehicle.', page: 7 },
    { text: 'The minimum age to apply for a learner’s licence for a motorcycle of 125 cc or less (without a sidecar) is…', a: '16 years', b: '17 years', c: '18 years', d: '15 years', correct: 'A', exp: 'A motorcycle of 125 cc or less (no sidecar) may be applied for from 16; over 125 cc the minimum age is 18.', page: 6 },
    { text: 'When applying for a learner’s licence you must, among other things, provide…', a: 'A blood test', b: 'Your identity document, a Traffic Register number and two passport-size photographs, and pass an eyesight test', c: 'A criminal record', d: 'Proof of vehicle ownership', correct: 'B', exp: 'You must meet the age and health requirements, pass the eyesight test at the testing centre, present acceptable identification and provide two passport-size photographs.', page: 7 },
    { text: 'How is the learner’s licence test conducted?', a: 'As an oral interview', b: 'As a multiple-choice test, on a computer or on pen-and-paper', c: 'As a practical driving test', d: 'As an essay', correct: 'B', exp: 'The learner’s test is a multiple-choice test that may be written on a computer or on a pen-and-paper sheet.', page: 8 },
    { text: 'What is the pass mark for the road signs, signals and markings section of the learner’s test?', a: '22 out of 28', b: '23 out of 28', c: '6 out of 8', d: '20 out of 28', correct: 'B', exp: 'The road signs/signals/markings section has 28 questions and the pass mark is 23 (77%).', page: 8 },
  ],

  // 2 — Controls of the vehicle
  2: [
    { text: 'Which control would you use to check that it is safe to manoeuvre before turning?', a: 'The indicator', b: 'The mirrors', c: 'The hooter', d: 'The clutch', correct: 'B', exp: 'The rear-view and side mirrors are used to check that it is safe before you manoeuvre or change direction.', page: 9 },
    { text: 'Which control does an automatic motor vehicle NOT have?', a: 'A footbrake', b: 'An accelerator', c: 'A clutch', d: 'A parking brake', correct: 'C', exp: 'Automatic vehicles have no clutch — gear changes happen automatically.', page: 9 },
    { text: 'Which control is used to keep a parked vehicle stationary?', a: 'The footbrake', b: 'The clutch', c: 'The parking (hand) brake', d: 'The accelerator', correct: 'C', exp: 'The parking brake holds the vehicle stationary when it is parked.', page: 9 },
    { text: 'To select a gear in a manual vehicle, which two controls are used together?', a: 'Accelerator and footbrake', b: 'Clutch and gear lever', c: 'Steering wheel and indicator', d: 'Hooter and parking brake', correct: 'B', exp: 'You disengage the engine with the clutch and select the gear with the gear lever.', page: 9 },
    { text: 'Which control is used to stop or reduce speed suddenly?', a: 'The accelerator', b: 'The clutch', c: 'The footbrake', d: 'The parking brake', correct: 'C', exp: 'The footbrake is used to reduce speed or stop.', page: 9 },
    { text: 'On a motorcycle, which controls should NEVER be used at the same time?', a: 'The front brake and the handlebars', b: 'The clutch and the gear lever', c: 'The indicator and the mirror', d: 'The throttle and the rear brake', correct: 'A', exp: 'You must never use the front brake and the handlebars (steering) at the same time, as this can cause loss of control.', page: 10 },
    { text: 'Which control do you use to signal your intention to turn or change direction?', a: 'The hooter', b: 'The indicator', c: 'The clutch', d: 'The footbrake', correct: 'B', exp: 'The indicator is used to signal your intention to turn or change direction.', page: 9 },
    { text: 'What is the hooter used for?', a: 'To change gear', b: 'To give a warning signal', c: 'To increase speed', d: 'To check behind you', correct: 'B', exp: 'The hooter is used to give a warning signal to other road users.', page: 9 },
    { text: 'Which control do you use to turn or change the direction of the vehicle?', a: 'The accelerator', b: 'The steering wheel', c: 'The gear lever', d: 'The parking brake', correct: 'B', exp: 'The steering wheel is used to steer the vehicle in a particular direction.', page: 9 },
    { text: 'On a motorcycle, which control is used to increase your speed?', a: 'The front brake', b: 'The throttle (accelerator)', c: 'The clutch', d: 'The brake pedal', correct: 'B', exp: 'The throttle (accelerator) is used to increase or decrease the motorcycle’s speed.', page: 10 },
    { text: 'To make a sharp turn, you typically combine the use of several controls including the…', a: 'Hooter and wipers only', b: 'Mirrors, indicator, footbrake, clutch, gear lever, steering wheel and accelerator', c: 'Parking brake only', d: 'Radio and lights', correct: 'B', exp: 'A sharp turn combines observation (mirrors), signalling (indicator), slowing (footbrake), gear selection (clutch and gear lever), steering and then accelerating away.', page: 9 },
  ],

  // 3 — Defensive driving the K53 way
  3: [
    { text: 'The K53 defensive-driving system is made up of which five steps, in order?', a: 'Stop, Look, Listen, Decide, Go', b: 'Search, Identify, Predict, Decide, Execute', c: 'Observe, Indicate, Brake, Steer, Accelerate', d: 'Mirror, Signal, Manoeuvre, Check, Proceed', correct: 'B', exp: 'The K53 standard is a continuous cycle: Search, Identify, Predict, Decide, Execute.', page: 11 },
    { text: 'In the K53 system, “Search” means you should…', a: 'Look only straight ahead', b: 'Keep a constant lookout in all directions, near and far, using the mirrors', c: 'Search for the nearest parking', d: 'Check your fuel and oil', correct: 'B', exp: 'Search means keeping a constant lookout in all directions, near and far, using your mirrors as necessary.', page: 11 },
    { text: 'After you “Identify” a hazard, the next K53 step is to…', a: 'Execute', b: 'Predict what danger the hazard might pose', c: 'Hoot', d: 'Search again', correct: 'B', exp: 'Once a hazard is identified you Predict the danger it could pose before deciding and executing your action.', page: 11 },
    { text: 'When should you increase your following distance?', a: 'Only on freeways', b: 'When visibility is poor, in wet conditions, when heavily laden or on a loose surface', c: 'Only at night', d: 'Never — the distance stays the same', correct: 'B', exp: 'Increase your following distance when visibility is poor, in wet conditions, when travelling fast, carrying a heavy load or driving on a loose surface.', page: 11 },
    { text: 'Before changing lanes, the last thing you should do is…', a: 'Sound the hooter', b: 'Check the blind spot on the side you intend to move to', c: 'Switch on your headlights', d: 'Cancel your indicator', correct: 'B', exp: 'The last action before moving into the next lane is to check the blind spot on the side you intend to move to.', page: 12 },
    { text: 'The action “Execute” in the K53 system means you should…', a: 'Brake as hard as possible every time', b: 'Perform the action you have decided on in a calm, controlled and decisive manner', c: 'Always come to a complete stop', d: 'Hand over to your instructor', correct: 'B', exp: 'Execute means carrying out the decided action calmly, in a controlled and decisive manner.', page: 11 },
    { text: 'The K53 defensive-driving system should be done as a…', a: 'Once-off check at the start of a journey', b: 'Constant, continuous cycle throughout your driving', c: 'Step only used at intersections', d: 'Procedure only for the driving test', correct: 'B', exp: 'The system is a constant, continuous cycle that becomes second nature and is applied throughout your driving.', page: 11 },
    { text: 'To use the mirrors correctly you should…', a: 'Adjust them while driving along', b: 'Ensure they are correctly adjusted while stationary, then glance at them regularly without staring', c: 'Cover them to avoid distraction', d: 'Only use them when parking', correct: 'B', exp: 'Adjust the mirrors for a clear view while stationary, then check them regularly and briefly so you keep your attention on the road ahead.', page: 12 },
    { text: 'A vehicle’s “blind spots” are…', a: 'The areas directly in front of the vehicle', b: 'The areas to the side and rear that you cannot see in the mirrors — check them before changing direction', c: 'The dashboard instruments', d: 'The headlight beams', correct: 'B', exp: 'Blind spots are the areas not visible in the mirrors; always check them (by turning your head) before changing lanes or direction.', page: 12 },
    { text: 'When braking, you should…', a: 'Brake hard and late every time', b: 'Look in the mirrors first, then brake early and gently so it is safe to do so', c: 'Pump the brakes continuously', d: 'Brake only with the parking brake', correct: 'B', exp: 'Before braking, check the mirrors to make sure it is safe, then brake early and progressively; remember stopping distance increases when wet, laden or on a loose surface.', page: 13 },
  ],

  // 4 — Road signs overview
  4: [
    { text: 'What is the main purpose of road signs, signals and markings?', a: 'To advertise businesses', b: 'To regulate traffic, warn of conditions, provide information and give guidance', c: 'To decorate the road', d: 'To collect toll fees', correct: 'B', exp: 'Signs, signals and markings regulate traffic flow, warn of conditions ahead, provide information and give guidance about routes and destinations.', page: 14 },
    { text: 'Which group of signs must always be obeyed?', a: 'Guidance signs', b: 'Tourism signs', c: 'Regulatory signs', d: 'Information signs', correct: 'C', exp: 'Regulatory signs regulate traffic flow and must be obeyed; disobeying them is an offence.', page: 14 },
    { text: 'A temporary road sign usually has which background colour?', a: 'Blue', b: 'Green', c: 'Yellow', d: 'White', correct: 'C', exp: 'Temporary signs use yellow, red and black; the yellow colour draws attention to the temporary situation.', page: 15 },
    { text: 'When a temporary sign and a permanent sign give different instructions, which one applies?', a: 'The permanent sign', b: 'The temporary sign — it takes precedence', c: 'Whichever is larger', d: 'Neither applies', correct: 'B', exp: 'Temporary signs take precedence over permanent signs and must be obeyed.', page: 15 },
    { text: 'What is the purpose of warning signs?', a: 'To give directions to towns', b: 'To warn of potential hazards ahead so you can prepare', c: 'To reserve a lane', d: 'To indicate parking', correct: 'B', exp: 'Warning signs warn of potential hazards ahead and should be heeded so you can respond in time.', page: 14 },
    { text: 'What does the abbreviation “GVM” on a sign refer to?', a: 'General Vehicle Movement', b: 'Gross Vehicle Mass', c: 'Goods Vehicle Marking', d: 'Government Vehicle Marker', correct: 'B', exp: 'GVM stands for Gross Vehicle Mass.', page: 15 },
    { text: 'Road signs, signals and markings are presented in which three forms?', a: 'Only on poles', b: 'Signs on poles/overhead structures, markings painted on the road, and signals given by lights or people', c: 'Only painted on the road', d: 'Only as lights', correct: 'B', exp: 'Signs are presented as signs mounted on poles or overhead structures, markings painted on the road surface, and signals given by lights or by people.', page: 14 },
    { text: 'What is the purpose of a hazard marker plate?', a: 'To give the speed limit', b: 'To indicate the position of a hazard or obstruction', c: 'To reserve a lane', d: 'To advertise a business', correct: 'B', exp: 'Hazard marker plates indicate the exact position of a hazard or obstruction in or next to the road.', page: 14 },
    { text: 'Diagrammatic signs are used to…', a: 'Indicate the lane situation ahead', b: 'Show the speed limit', c: 'Mark a pedestrian crossing', d: 'Reserve parking', correct: 'A', exp: 'Diagrammatic signs indicate the lane situation ahead and carry the same meanings as their equivalent road signs.', page: 14 },
    { text: 'Tourism signs are used to…', a: 'Prohibit certain vehicles', b: 'Give directions and other information especially useful to travellers', c: 'Warn of hazards', d: 'Control traffic flow', correct: 'B', exp: 'Tourism signs (brown) give directions and other information especially useful to travellers.', page: 14 },
    { text: 'Which statement about guidance signs is correct?', a: 'They warn of hazards ahead', b: 'They give guidance about distances and directions to places', c: 'They must always be obeyed like a Stop sign', d: 'They reserve a lane for buses', correct: 'B', exp: 'Guidance signs give guidance about distances and directions to places and destinations.', page: 14 },
  ],

  // 5 — Regulatory signs
  5: [
    { text: 'At a STOP sign you must…', a: 'Slow down and proceed if clear', b: 'Come to a complete halt behind the stop line and remain stationary until it is safe to move off', c: 'Stop only if other vehicles are present', d: 'Yield to traffic from the left', correct: 'B', exp: 'A Stop sign requires a complete halt at the stop line; you may move off only when it is safe to do so.', page: 16 },
    { text: 'At a three-way or four-way stop, when may you move off?', a: 'Immediately after stopping', b: 'After all vehicles that stopped before you have moved off', c: 'When the vehicle on your left moves', d: 'After waiting exactly five seconds', correct: 'B', exp: 'At multi-way stops you may move off only after all the vehicles that stopped before you have moved off.', page: 16 },
    { text: 'A YIELD sign requires you to…', a: 'Always stop completely', b: 'Give way to all pedestrians and traffic close enough to be a hazard before you cross or join', c: 'Sound your hooter and proceed', d: 'Ignore pedestrians', correct: 'B', exp: 'At a Yield sign you give way to pedestrians and to traffic on the road you are crossing or joining if they are close enough to be a hazard; you stop only if necessary.', page: 16 },
    { text: 'A round sign with a red border and a vehicle symbol crossed out (or a red bar) generally indicates…', a: 'A command you must carry out', b: 'A prohibition — that action or vehicle is not allowed', c: 'Guidance to a destination', d: 'A warning of a hazard', correct: 'B', exp: 'Prohibition signs (red border/red bar) tell you what you may not do; disobeying them is an offence.', page: 16 },
    { text: 'A blue round sign with a white arrow or symbol is a…', a: 'Prohibition sign', b: 'Command sign telling you what you must do', c: 'Warning sign', d: 'Tourism sign', correct: 'B', exp: 'Command (mandatory) signs are blue and round and tell you what you must do, e.g. keep left, proceed straight.', page: 16 },
    { text: 'A “No entry” sign is usually found…', a: 'At the start of a freeway', b: 'At the end of a one-way street or an off-ramp', c: 'At every intersection', d: 'Only in parking areas', correct: 'B', exp: 'A No-entry sign is typically placed where you may not enter, such as the end of a one-way street or an off-ramp.', page: 16 },
    { text: 'A reservation sign (e.g. a bus or taxi lane) means…', a: 'Any vehicle may use that part of the road', b: 'Only the indicated class of vehicle may use that part of the road', c: 'The lane is closed to everyone', d: 'You may park there', correct: 'B', exp: 'Reservation signs reserve a portion of the road for a specific class of road user; other vehicles may not use it.', page: 17 },
    { text: 'At a manually-operated Stop/Go sign, when may you proceed?', a: 'When the STOP side is showing', b: 'When the GO side is shown to you', c: 'As soon as you have slowed down', d: 'Only after hooting', correct: 'B', exp: 'A Stop/Go sign is turned by an operator. You stop when STOP faces you and proceed only when GO is shown.', page: 16 },
    { text: 'A blue round command sign showing a number such as “50” means you must…', a: 'Not exceed 50 km/h', b: 'Not drive slower than 50 km/h (minimum speed)', c: 'Stop within 50 m', d: 'Keep 50 m following distance', correct: 'B', exp: 'A blue (command) speed sign sets a minimum speed — you must travel at the indicated speed or faster.', page: 17 },
    { text: 'A blue round sign showing headlamps instructs you to…', a: 'Switch off your headlamps', b: 'Switch on your headlamps now', c: 'Flash your headlamps', d: 'Use only your parking lights', correct: 'B', exp: 'This command sign requires you to switch your headlamps on immediately, e.g. before a tunnel or in poor visibility.', page: 17 },
    { text: 'A “No U-turn” prohibition sign means you may not…', a: 'Turn left', b: 'Turn the vehicle around to face the opposite direction', c: 'Reverse', d: 'Change lanes', correct: 'B', exp: 'A No-U-turn sign prohibits turning your vehicle around so that it faces the opposite direction.', page: 17 },
    { text: 'You see a “No stopping” sign. May you stop briefly to drop off a passenger?', a: 'Yes, if you are quick', b: 'No — no stopping is allowed except to obey a signal/officer or to avoid an accident', c: 'Yes, with hazards on', d: 'Only after 18:00', correct: 'B', exp: 'No stopping means you may not stop at all there, except to obey a traffic signal or officer, or to avoid a collision.', page: 17 },
    { text: 'A “No overtaking” prohibition sign that shows a distance (e.g. 500 m) means…', a: 'You may overtake after 500 m only', b: 'You may not overtake for the distance indicated', c: 'Overtaking is recommended', d: 'Goods vehicles may overtake', correct: 'B', exp: 'The sign prohibits overtaking for the distance shown; the restriction applies from the sign onward.', page: 17 },
    { text: 'A regulatory sign with a yellow background is…', a: 'A guidance sign', b: 'A temporary regulatory sign that must still be obeyed and takes precedence over the permanent sign', c: 'Out of order and can be ignored', d: 'Only advisory', correct: 'B', exp: 'Yellow = temporary. A temporary regulatory sign must be obeyed and overrides the equivalent permanent sign.', page: 16 },
    { text: 'At a pedestrian-priority sign, the maximum speed and who may drive there is…', a: '30 km/h, any vehicle', b: '15 km/h, and only delivery, maintenance or emergency vehicles', c: '40 km/h, buses only', d: '60 km/h, all vehicles', correct: 'B', exp: 'In a pedestrian-priority area you must yield to pedestrians, not exceed 15 km/h, and only delivery/maintenance/emergency vehicles may drive or park there.', page: 16 },
    { text: 'Which selective-restriction sign meaning is correct?', a: 'A sign showing days and times applies only during those days and times', b: 'A time sign applies all day every day', c: 'A “mini-buses only” sign applies to all vehicles', d: 'A night-time sign applies only in daytime', correct: 'A', exp: 'Selective-restriction (combination) signs apply the rule selectively — e.g. only during the days/times shown, only to a vehicle class, or only for the distance shown.', page: 20 },
    { text: 'Which statement about traffic signals is correct?', a: 'You may ignore a robot if no one is around', b: 'Traffic signals must be obeyed at all times, and a traffic officer’s signals overrule any other sign or signal', c: 'Road markings overrule a traffic officer', d: 'A flashing red light means speed up', correct: 'B', exp: 'Traffic signals must always be obeyed, and a traffic officer’s hand signals take precedence over all other road signs and signals.', page: 20 },
  ],

  // 6 — Warning signs
  6: [
    { text: 'What shape and colour is a standard (permanent) warning sign?', a: 'Round and blue', b: 'A triangle with a red border', c: 'A rectangle with a green background', d: 'An octagon', correct: 'B', exp: 'Permanent warning signs are triangular with a red border and a symbol showing the hazard ahead.', page: 28 },
    { text: 'A warning sign showing a series of bends tells you that…', a: 'The road ends ahead', b: 'There is a winding road or series of curves ahead — reduce speed', c: 'You may overtake freely', d: 'There is a parking area ahead', correct: 'B', exp: 'A winding-road warning indicates a series of curves; slow down because there may be more curves after the first.', page: 28 },
    { text: 'When you see a “pedestrians ahead” warning sign you should…', a: 'Speed up to clear the area', b: 'Be alert and ready to slow down or stop for pedestrians', c: 'Sound your hooter continuously', d: 'Overtake immediately', correct: 'B', exp: 'A pedestrian warning sign tells you pedestrians may be in or near the road; be ready to slow down or stop.', page: 28 },
    { text: 'A warning sign for a steep descent reminds you that…', a: 'You should increase speed', b: 'Your stopping distance is longer, especially when heavily laden — select a lower gear', c: 'Brakes are not needed', d: 'You may engage neutral', correct: 'B', exp: 'On a steep descent allow for a longer stopping distance and use a lower gear, particularly with a heavy load.', page: 28 },
    { text: 'A hazard marker plate (e.g. chevrons or stripes) is used to…', a: 'Give the speed limit', b: 'Indicate the position of a hazard or obstruction and the direction to pass it', c: 'Reserve a lane for buses', d: 'Mark a tourism route', correct: 'B', exp: 'Hazard marker plates indicate the exact position of a hazard or obstruction and which way to pass it.', page: 28 },
    { text: 'At a warning sign for a railway crossing with no stop line, if you must stop you should stop no closer than…', a: '1 metre from the nearest rail', b: '2 metres from the nearest rail', c: '3 metres from the nearest rail', d: 'Right next to the boom', correct: 'C', exp: 'Where there is no stop line, stop no closer than 3 m from the nearest rail and never on the track.', page: 29 },
    { text: 'A warning sign showing a T-junction (the road you are on ends ahead) means you must…', a: 'Continue straight', b: 'Turn sharply to the left or right, depending on the junction', c: 'Stop and reverse', d: 'Make a U-turn', correct: 'B', exp: 'A T-junction warning means your road ends ahead and you will have to turn left or right; look out for any Stop or Yield sign.', page: 32 },
    { text: 'A “Stop sign ahead” / “robot ahead” traffic-control warning sign tells you to…', a: 'Speed up to clear the junction', b: 'Slow down and be prepared to give way or stop', c: 'Ignore it on a clear day', d: 'Sound your hooter', correct: 'B', exp: 'Traffic-control warning signs warn that a regulatory control (Stop, Yield, robot, scholar patrol) is ahead — slow down and be prepared to give way or stop.', page: 29 },
    { text: 'A warning sign indicating the traffic signals (robots) ahead are out of order means you should…', a: 'Treat the intersection as a freeway', b: 'Approach the junction with extreme caution', c: 'Stop permanently', d: 'Reverse away', correct: 'B', exp: 'When warned that the traffic lights are out of order, approach the junction with extreme caution as it is uncontrolled.', page: 29 },
    { text: 'A warning sign for a traffic-calming hump (speed hump) in the road ahead means you should…', a: 'Maintain speed', b: 'Reduce speed considerably before passing over the hump, or your vehicle may be damaged', c: 'Accelerate over it', d: 'Stop on the hump', correct: 'B', exp: 'A speed-hump warning indicates the position of a calming hump; reduce speed considerably before crossing it.', page: 35 },
    { text: 'A warning sign for strong crosswinds means you should…', a: 'Switch off your engine', b: 'Be ready to adjust your steering, as the wind (and shielding by trucks or bridges) can push the vehicle', c: 'Stop and wait for the wind to drop', d: 'Drive faster through the section', correct: 'B', exp: 'Crosswind warnings tell you to anticipate steering adjustments, especially where trucks or structures shield and then expose the vehicle.', page: 29 },
    { text: 'A warning sign showing that a one-way roadway becomes a two-way road ahead means you should…', a: 'Overtake freely', b: 'Keep to the left of your half of the road and watch for oncoming traffic', c: 'Drive in the centre', d: 'Increase speed', correct: 'B', exp: 'When two-way traffic resumes, keep to the left of your half of the roadway and look out for oncoming vehicles that might be on the wrong side by mistake.', page: 35 },
    { text: 'A warning sign for a concealed driveway tells you that…', a: 'There is a parking area ahead', b: 'Hidden driveways enter the road where your view is limited — watch for emerging vehicles', c: 'The road is closed', d: 'A toll plaza is ahead', correct: 'B', exp: 'A concealed-driveway warning means one or more driveways enter the road where they are hard to see; be ready for vehicles emerging.', page: 29 },
  ],

  // 7 — Information signs
  7: [
    { text: 'What is the purpose of an information sign?', a: 'To prohibit an action', b: 'To inform you about the road layout, facilities or features ahead', c: 'To warn of a hazard', d: 'To reserve a lane', correct: 'B', exp: 'Information signs inform road users about the road layout ahead and useful facilities.', page: 37 },
    { text: 'Information signs are most commonly which colour?', a: 'Red', b: 'Blue (often with white symbols)', c: 'Yellow', d: 'Brown', correct: 'B', exp: 'Information signs are typically blue rectangles with white symbols or lettering.', page: 37 },
    { text: 'Count-down markers next to a freeway exit indicate…', a: 'The speed limit reducing', b: 'The distance remaining to the exit (e.g. 300 m, 200 m, 100 m)', c: 'The number of lanes', d: 'The toll fee', correct: 'B', exp: 'Count-down markers show the distance to the exit, usually 300 m, 200 m and 100 m.', page: 37 },
    { text: 'A “co-ordinated traffic signals” information sign tells drivers that…', a: 'The traffic lights are broken', b: 'Keeping to the indicated speed will let you catch the green lights (a “green wave”)', c: 'You must stop at every light', d: 'Only buses may proceed', correct: 'B', exp: 'Co-ordinated signals indicate that maintaining the shown speed will catch successive green lights; the speed is a recommendation, not a limit.', page: 38 },
    { text: 'An information sign indicating you have right of way at the intersection ahead means you should…', a: 'Stop and yield to all traffic', b: 'Proceed without unnecessary slowing, while still making sure others yield', c: 'Turn around', d: 'Sound your hooter', correct: 'B', exp: 'A right-of-way information sign confirms you have priority; proceed but ensure other road users actually yield.', page: 37 },
    { text: 'On a high-speed freeway exit count-down sign, each white bar represents…', a: '50 m to the exit', b: '100 m to the exit', c: '250 m to the exit', d: '500 m to the exit', correct: 'B', exp: 'Each bar on a freeway exit count-down sign represents 100 m, so three bars means the exit is 300 m ahead.', page: 37 },
    { text: 'An information sign with a red bar across a side road indicates…', a: 'A bus lane', b: 'A no-through-road — that road does not continue, so use an alternative route', c: 'A priority road', d: 'A speed limit', correct: 'B', exp: 'The red bar shows the road has no through route; if you need to go that way you must use an alternative route.', page: 39 },
    { text: 'A yellow diamond “priority road” information sign tells you that…', a: 'You must stop at the junction', b: 'The road you are on has priority at the junction ahead', c: 'You must yield to all traffic', d: 'Parking is allowed', correct: 'B', exp: 'The priority-road sign means the road you are travelling on has right of way at the junction ahead; stay alert for vehicles entering.', page: 37 },
    { text: 'A park-and-ride information sign indicates a place where you can…', a: 'Buy fuel', b: 'Park your vehicle and continue your journey by bus or train', c: 'Camp overnight', d: 'Wash your car', correct: 'B', exp: 'A park-and-ride point lets you park your car and take a bus or train for the next leg of the journey.', page: 37 },
    { text: 'A “multi-phase / 3-phase” signals information sign warns that the traffic lights…', a: 'Are out of order', b: 'Do not simply change red-to-green but have extra phases (e.g. to turn against oncoming traffic) — wait for your green', c: 'Only work at night', d: 'Are advisory only', correct: 'B', exp: 'Multi-phase signals have additional phases, so your light may stay red while another direction turns green; wait for your own green.', page: 37 },
    { text: 'A supplementary plate reading “Recommended speed 80 km/h” means…', a: 'You must not exceed 80 km/h', b: 'It is an advisory speed for the conditions, not an enforceable limit', c: 'You must not drive slower than 80 km/h', d: 'The road is closed above 80 km/h', correct: 'B', exp: 'A recommended-speed plate gives advisory guidance for the conditions ahead; it is not a legal speed limit.', page: 37 },
  ],

  // 8 — Guidance signs
  8: [
    { text: 'What do guidance signs tell you?', a: 'What you may not do', b: 'Guidance about distances, directions and places', c: 'The position of a hazard', d: 'The speed limit', correct: 'B', exp: 'Guidance signs give guidance about distances and directions to places and destinations.', page: 40 },
    { text: 'Guidance (direction) signs on freeways are usually which colour?', a: 'Red with white text', b: 'Blue or green with white text', c: 'Yellow with black text', d: 'Brown with white text', correct: 'B', exp: 'Freeway and major-route guidance signs use blue or green backgrounds with white lettering.', page: 40 },
    { text: 'A tourism sign is usually which colour, and what does it show?', a: 'Brown — places of interest to travellers', b: 'Red — prohibitions', c: 'Blue — speed limits', d: 'Yellow — temporary works', correct: 'A', exp: 'Tourism signs are brown and point to attractions and information especially useful to travellers.', page: 40 },
    { text: 'An advance direction sign is placed…', a: 'After the intersection', b: 'Before the intersection so you can choose the correct lane and route in time', c: 'Only at toll plazas', d: 'On the road surface only', correct: 'B', exp: 'Advance direction signs appear before an intersection or exit so drivers can position themselves correctly.', page: 40 },
    { text: 'A route marker confirms…', a: 'The speed limit on the route', b: 'The number and status of the route you are travelling on', c: 'The next fuel station', d: 'The toll fee', correct: 'B', exp: 'Route markers confirm the route number and status (e.g. national, provincial) of the road you are on.', page: 41 },
    { text: 'Guidance signs for roads OTHER than freeways (regional/other roads) appear on which colour board?', a: 'Blue', b: 'Green', c: 'Brown', d: 'Yellow', correct: 'B', exp: 'Freeway guidance signs are on a blue board; guidance signs for other roads are on a green board; tourist guidance is brown.', page: 40 },
    { text: 'Diagrammatic lane-guidance signs (showing the lane situation ahead) appear on a…', a: 'Blue board', b: 'White board (red and black)', c: 'Brown board', d: 'Green board', correct: 'B', exp: 'Diagrammatic lane-guidance signs use red and black on a white board to show the lane layout ahead.', page: 40 },
    { text: 'A local direction sign (black lettering on a white board) is used to direct you to…', a: 'A national freeway', b: 'A place or street within a town or city', c: 'A tourist attraction', d: 'A toll plaza', correct: 'B', exp: 'Local direction signs are black on white and point to places within a town or city.', page: 40 },
    { text: 'On a direction sign, a symbol such as an aircraft, an anchor or a train indicates…', a: 'A prohibition', b: 'The nature of the destination the sign points to (airport, harbour, railway station)', c: 'A warning of a hazard', d: 'A speed limit', correct: 'B', exp: 'Direction-sign symbols show the nature of the destination, e.g. an aircraft for an airport, an anchor for a harbour.', page: 40 },
    { text: 'A “detour direction” symbol on a guidance sign tells you to…', a: 'Stop and turn back', b: 'Follow a temporary alternative route, usually around road works', c: 'Park and ride', d: 'Reduce speed only', correct: 'B', exp: 'A detour symbol guides traffic along a temporary alternative route, typically around road works or an obstruction.', page: 40 },
    { text: 'A guidance sign for a tourist destination uses which board colour?', a: 'Brown', b: 'Blue', c: 'Green', d: 'Red', correct: 'A', exp: 'Tourist guidance signs use white/yellow lettering on a brown board.', page: 40 },
  ],

  // 9 — Road surface markings
  9: [
    { text: 'A solid white line in the centre of the road means…', a: 'You may cross it to overtake whenever you wish', b: 'You may not cross or straddle it except to enter a property or pass a stationary obstruction, when safe', c: 'It marks a parking bay', d: 'It is only a guide and can be ignored', correct: 'B', exp: 'A solid (no-crossing) line may not be crossed except to access a property or pass a stationary obstruction, and only when safe.', page: 49 },
    { text: 'A broken white line down the middle of the road means…', a: 'You may never cross it', b: 'You may cross it to overtake or turn when it is safe to do so', c: 'The road is one-way', d: 'No stopping at any time', correct: 'B', exp: 'A broken dividing line may be crossed to overtake or turn when it is safe.', page: 49 },
    { text: 'A yellow line marking the left edge of the road (the edge line) means…', a: 'You may drive on the shoulder at any time', b: 'It marks the edge of the roadway and you should not normally cross it to the left', c: 'Parking is reserved for buses', d: 'The road ahead is closed', correct: 'B', exp: 'The yellow edge line marks the left edge of the roadway; you generally may not drive to the left of it except under the road-shoulder exception.', page: 50 },
    { text: 'Painted island / chevron markings on the road surface should be…', a: 'Driven over to save time', b: 'Used for parking', c: 'Kept clear — do not drive on or straddle them', d: 'Treated as a pedestrian crossing', correct: 'C', exp: 'Painted islands separate or guide traffic and must not be driven on or straddled.', page: 49 },
    { text: 'A box junction (cross-hatched yellow lines) painted in an intersection means you must…', a: 'Stop inside the box and wait', b: 'Not enter the box unless your exit is clear so you will not block the intersection', c: 'Park inside the box', d: 'Yield to traffic from the left', correct: 'B', exp: 'You may only enter a yellow box junction if your exit is clear; you must never stop and block the intersection.', page: 52 },
    { text: 'A word or symbol painted on the road (e.g. “SLOW”, a bus or an arrow) is there to…', a: 'Be ignored', b: 'Give you additional information or an instruction — read it and act accordingly', c: 'Mark a tourism route', d: 'Indicate a toll plaza', correct: 'B', exp: 'Word and symbol markings supply additional information or instructions; read the message and respond to the indicated situation.', page: 53 },
    { text: 'A lane with a bus symbol painted in it (a reserved lane) means…', a: 'Buses must avoid the lane', b: 'Only buses may drive, stop or park in that lane — no other vehicle may use it', c: 'Any vehicle may use it off-peak', d: 'It is for parking only', correct: 'B', exp: 'A reserved-lane symbol (bus, taxi, bicycle, etc.) means only that class of vehicle may drive, stop or park in the lane.', page: 48 },
    { text: 'Zig-zag lines painted on the approach to a pedestrian crossing mean you may…', a: 'Overtake and stop freely', b: 'Not overtake or stop within the zig-zag zone, and you must give way to pedestrians on the crossing', c: 'Park there', d: 'Speed up across the crossing', correct: 'B', exp: 'Zig-zag lines mark the pedestrian-crossing approach; do not overtake or stop in that zone and give way to pedestrians.', page: 48 },
    { text: 'A mandatory direction arrow painted in your lane (for example, a left-only arrow) means you must…', a: 'Choose any direction', b: 'Travel only in the direction shown by the arrow', c: 'Stop at the arrow', d: 'Reverse', correct: 'B', exp: 'A mandatory direction arrow requires you to proceed only in the direction it indicates.', page: 48 },
    { text: 'A no-stopping red line (or a no-stopping line with an accompanying sign) painted at the edge of the road means…', a: 'You may stop any time', b: 'You may not stop there during the times indicated on the accompanying sign', c: 'Parking is reserved for buses', d: 'It is a pedestrian crossing', correct: 'B', exp: 'A no-stopping line restricts stopping; where it is broken, the restriction applies during the times shown on the accompanying road sign.', page: 48 },
    { text: 'Where lane markings show a reduction in the number of lanes (an angled arrow), you should…', a: 'Speed up and force your way across', b: 'Move into a suitable lane in good time, checking your blind spot', c: 'Stop in your lane', d: 'Straddle the markings', correct: 'B', exp: 'An angled lane-reduction arrow warns that lanes reduce ahead; change into a suitable lane in good time and check your blind spot.', page: 50 },
    { text: 'A mini-circle painted as a road marking requires you to…', a: 'Give way to any vehicle that will cross a Yield line before you', b: 'Always stop completely', c: 'Yield to traffic from the left', d: 'Drive anti-clockwise', correct: 'A', exp: 'At a painted mini-circle, give way to any vehicle that will cross its Yield line before you, then proceed clockwise.', page: 48 },
  ],

  // 10 — Rules of the road
  10: [
    { text: 'On a two-way road in South Africa you must normally drive…', a: 'On the right-hand side', b: 'On the left-hand side', c: 'In the centre of the road', d: 'On whichever side is clear', correct: 'B', exp: 'The “rule of the road” is to drive on the left-hand side of a two-way road.', page: 54 },
    { text: 'What is the general speed limit on a public road in an urban area, unless a sign says otherwise?', a: '40 km/h', b: '60 km/h', c: '80 km/h', d: '100 km/h', correct: 'B', exp: 'The general urban speed limit is 60 km/h; outside urban areas 100 km/h; on freeways 120 km/h.', page: 54 },
    { text: 'The general speed limit on a freeway (unless signposted otherwise) is…', a: '100 km/h', b: '110 km/h', c: '120 km/h', d: '140 km/h', correct: 'C', exp: 'The general freeway speed limit is 120 km/h. A goods vehicle over 9 000 kg is limited to 80 km/h and a bus/mini-bus carrying passengers to 100 km/h.', page: 54 },
    { text: 'If a road sign shows a speed limit different from the general limit, which applies?', a: 'The general limit always applies', b: 'The speed shown on the sign takes precedence', c: 'You may choose either', d: 'The lower of the two, always', correct: 'B', exp: 'A sign showing a different speed limit always takes precedence over and overrides the general speed limit.', page: 54 },
    { text: 'You may NOT overtake when…', a: 'The road ahead is clear and straight', b: 'Approaching a blind rise or curve where your view is limited and oncoming traffic is possible', c: 'A broken line is painted down the centre', d: 'The vehicle ahead is far away', correct: 'B', exp: 'Do not overtake on a blind rise, on a curve, or anywhere your view of oncoming traffic is limited, nor where a sign or marking prohibits it.', page: 55 },
    { text: 'When another vehicle is overtaking you, you should…', a: 'Accelerate to stop them passing', b: 'Move over to the left to let them pass and not accelerate', c: 'Move to the right', d: 'Brake hard immediately', correct: 'B', exp: 'When being overtaken, move over to the left to allow the other vehicle to pass and do not accelerate.', page: 55 },
    { text: 'At a roundabout (traffic circle) you must, unless a sign or officer directs otherwise…', a: 'Yield to traffic approaching from the left', b: 'Yield to traffic approaching from the right', c: 'Always stop before entering', d: 'Have right of way over all traffic', correct: 'B', exp: 'At a roundabout you give way to all traffic already in the circle and approaching from your right, unless a sign or traffic officer instructs otherwise.', page: 56 },
    { text: 'May you stop your vehicle anywhere you like on a public road?', a: 'Yes, at any time', b: 'No — only where instructed by a sign/officer, to avoid an accident, or for a cause beyond your control', c: 'Yes, as long as your hazards are on', d: 'Only on freeways', correct: 'B', exp: 'You may not stop on the road unless instructed by a traffic officer or road sign, to avoid an accident, or for a cause beyond your control.', page: 56 },
    { text: 'When turning left at an intersection you should…', a: 'Swing out to the right first', b: 'Indicate in good time and keep as close as possible to the left side of the road', c: 'Stop in the middle of the road', d: 'Move into the right lane', correct: 'B', exp: 'To turn left, indicate in good time and keep as close as is safe to the left side of the road, adjusting speed to merge safely.', page: 57 },
    { text: 'When turning right from a two-way road into another two-way road, you must…', a: 'Cut the corner to save time', b: 'Cross the centre line so that you turn into the left-hand side of the road you are entering, and yield to oncoming traffic', c: 'Turn into the right-hand lane of the new road', d: 'Ignore oncoming traffic', correct: 'B', exp: 'When turning right you yield to oncoming traffic and cross the centre line so you end up on the correct (left) side of the new road, without cutting the corner.', page: 57 },
    { text: 'On a freeway, hand signals…', a: 'Must always be used instead of indicators', b: 'May not be used, except in an emergency', c: 'Must be used at every off-ramp', d: 'Are compulsory for learner drivers', correct: 'B', exp: 'Hand signals may not be given on a freeway, except in an emergency; use your indicators.', page: 60 },
    { text: 'After completing a turn or lane change, you must…', a: 'Leave your indicator flashing', b: 'Make sure your indicator has cancelled so you do not mislead other road users', c: 'Sound your hooter', d: 'Brake firmly', correct: 'B', exp: 'Always ensure the indicator has cancelled after a manoeuvre, otherwise you give a false signal to others.', page: 57 },
    { text: 'For an ordinary (non-professional) driver, the blood-alcohol concentration must be LESS than…', a: '0.05 g per 100 ml of blood', b: '0.08 g per 100 ml of blood', c: '0.10 g per 100 ml of blood', d: 'There is no limit', correct: 'A', exp: 'An ordinary driver’s blood-alcohol level must be below 0.05 g per 100 ml; for a professional driver the limit is lower (0.02 g per 100 ml).', page: 63 },
    { text: 'Who is responsible for ensuring that all occupants of a vehicle wear their seat belts?', a: 'Each passenger individually', b: 'The driver', c: 'The traffic officer', d: 'No one — it is optional', correct: 'B', exp: 'The driver is responsible for ensuring that all occupants wear the seat belts fitted to the vehicle (exempted only while reversing).', page: 63 },
    { text: 'Which of the following is NOT allowed on a freeway?', a: 'A light motor car', b: 'A motorcycle with an engine of 50 cc or less, a pedal cycle or an animal-drawn vehicle', c: 'A bus carrying passengers', d: 'A goods vehicle', correct: 'B', exp: 'Freeways exclude small/slow vehicles such as motorcycles ≤50 cc, pedal cycles, animal-drawn vehicles, tractors (except for maintenance) and very light vehicles.', page: 60 },
  ],

  // 11 — Learner's licence mock test (self-contained questions from the manual's practice tests)
  11: [
    { text: 'May you drive on the right-hand side of a road where traffic moves in both directions?', a: 'Only if your emergency lights are switched on', b: 'If a traffic officer orders you to do so', c: 'Under no circumstances', d: 'Whenever the road ahead is clear', correct: 'B', exp: 'You may drive on the right-hand side of a two-way road only when a traffic officer orders you to do so.', page: 71 },
    { text: 'When may you stop on a freeway?', a: 'To pick up hitch-hikers', b: 'To rest during a long journey', c: 'To obey a road traffic sign or signal', d: 'To make a phone call', correct: 'C', exp: 'You may stop on a freeway only when required to do so by a road traffic sign or signal (or in an emergency), not for convenience.', page: 71 },
    { text: 'Where are you NOT allowed to stop?', a: 'Where parking is prohibited', b: 'On the opposite side of a vehicle where the roadway is 10 m wide', c: 'Closer than 6 m to a bridge', d: 'In a designated parking bay', correct: 'C', exp: 'You may not stop closer than 6 m to a bridge (and various other listed places).', page: 72 },
    { text: 'You are involved in an accident. You must…', a: 'Drive on if your vehicle still works', b: 'Stop immediately and check whether anyone is injured', c: 'Only stop if the other driver stops', d: 'Move your vehicle before checking anything', correct: 'B', exp: 'After an accident you must stop your vehicle immediately and check whether anyone has been injured.', page: 72 },
    { text: 'The distance it takes a vehicle to stop is longer when…', a: 'It is heavily loaded, moving faster, or the road is wet', b: 'Only when the road is wet', c: 'Only when it is heavily loaded', d: 'The stopping distance never changes', correct: 'A', exp: 'Stopping distance increases when the vehicle is heavily loaded, when it is moving faster, and when the road is wet — all of these.', page: 71 },
    { text: 'Under which condition are you NOT allowed to obtain a learner’s licence?', a: 'If you wear contact lenses', b: 'If your licence was temporarily suspended and that period has not yet expired', c: 'If you already hold a learner’s licence for a different class', d: 'If you are over 65', correct: 'B', exp: 'You may not obtain a learner’s licence while a suspension/disqualification period still applies, or if you already hold a valid licence for the same class of vehicle.', page: 71 },
    { text: 'Regarding a motor vehicle’s hooter, which statement is correct?', a: 'The tone or pitch may vary', b: 'It may be used only for safety reasons and its tone or pitch may not vary', c: 'It may be used to attract pedestrians’ attention', d: 'It may be used to greet other drivers', correct: 'B', exp: 'A hooter may be used only for safety reasons (as a warning), not unnecessarily, and its tone or pitch may not vary.', page: 60 },
    { text: 'When you want to change lanes, you must…', a: 'Change immediately whenever you wish', b: 'Indicate in time, check your mirrors and blind spot, and change only when it is safe to do so', c: 'Only check your mirrors', d: 'Sound your hooter and move across', correct: 'B', exp: 'Changing lanes safely requires indicating in time, checking mirrors and the blind spot, and moving only when it is safe.', page: 72 },
    { text: 'Where or when may you NOT overtake another vehicle?', a: 'On the approach to a curve, near the top of a hill, or where your view is limited (e.g. by mist or smoke)', b: 'Only on a curve', c: 'Only near the top of a hill', d: 'You may always overtake if you are quick', correct: 'A', exp: 'Overtaking is prohibited wherever your view of oncoming traffic is limited — on a curve, near a crest, or in poor visibility — as well as where a sign or marking forbids it.', page: 73 },
    { text: 'What is considered the single most important “rule of the road”?', a: 'Always be courteous and considerate', b: 'Never exceed the speed limit', c: 'Keep to the left-hand side of the road', d: 'Always use your indicators', correct: 'C', exp: 'The fundamental rule of the road in South Africa is to keep to the left-hand side of the road.', page: 75 },
    { text: 'On dipped (low) beam, your headlights may shine no further ahead than about…', a: '45 metres', b: '90 metres', c: '150 metres', d: '200 metres', correct: 'A', exp: 'Dipped-beam headlights must not illuminate the road further than about 45 m ahead, so as not to dazzle oncoming drivers.', page: 75 },
    { text: 'You have right of way at an intersection when…', a: 'You are already within a traffic circle, or you were first to reach the stop line at a four-way stop', b: 'You are the largest vehicle', c: 'You are in the biggest hurry', d: 'You are turning right across oncoming traffic', correct: 'A', exp: 'You have right of way when you are already in the traffic circle, or when you reached the stop line first at a four-way stop. When turning right you must yield to oncoming traffic.', page: 73 },
    { text: 'What must you do at a flashing red traffic light?', a: 'Drive through without stopping', b: 'Stop, then proceed when it is safe — treat it like a stop sign', c: 'Speed up to clear the intersection', d: 'Wait for it to turn green before moving', correct: 'B', exp: 'A flashing red traffic signal must be treated as a stop sign: come to a complete stop, then proceed when it is safe.', page: 73 },
  ],

  // 12 — K53 driving test overview
  12: [
    { text: 'The K53 driving test is divided into which two main parts?', a: 'A written test and an eye test', b: 'A pre-trip vehicle inspection plus the practical driving test (yard test and road test)', c: 'A theory test and a first-aid test', d: 'A parking test only', correct: 'B', exp: 'The K53 driving test consists of a pre-trip vehicle inspection followed by the practical driving — the yard (parking) test and the road test.', page: 82 },
    { text: 'During the driving test, marks are…', a: 'Added for good driving', b: 'Deducted (penalty points) each time you make a mistake', c: 'Given only at the end as a single grade', d: 'Not recorded', correct: 'B', exp: 'The K53 test works on penalty points — points are deducted for errors, and too many penalties result in a failure.', page: 82 },
    { text: 'Which of the following will cause an immediate failure of the driving test?', a: 'Stalling the engine once', b: 'A dangerous or illegal action such as mounting the kerb or rolling back excessively', c: 'Checking your mirrors too often', d: 'Indicating early', correct: 'B', exp: 'Certain serious or dangerous actions (e.g. mounting the kerb, a dangerous manoeuvre, excessive roll-back) cause an immediate failure regardless of other points.', page: 83 },
    { text: 'Before you may take the practical driving test you must hold…', a: 'A valid learner’s licence for that class of vehicle', b: 'A passport', c: 'A professional driving permit', d: 'Nothing — anyone may take it', correct: 'A', exp: 'You must hold a valid learner’s licence for the relevant class of vehicle to take the driving test.', page: 82 },
    { text: 'You may NOT take the driving test in a light motor vehicle that is…', a: 'Automatic', b: 'Less than 3 m in length', c: 'White in colour', d: 'More than 5 years old', correct: 'B', exp: 'The driving test may not be done in a light motor vehicle that is less than 3 m long.', page: 82 },
    { text: 'During the driving test you are NOT allowed to…', a: 'Use your mirrors', b: 'Smoke or use a cellular phone', c: 'Signal your intentions', d: 'Check your blind spot', correct: 'B', exp: 'Smoking and the use of cellular phones are not allowed during the test.', page: 82 },
    { text: 'The practical driving test for a light/heavy motor vehicle consists of which parts?', a: 'A pre-trip inspection, a yard test of manoeuvres, and a road test on public roads', b: 'Only a road test', c: 'A written test and an eye test', d: 'A parallel-parking test only', correct: 'A', exp: 'The test has three parts: a pre-trip roadworthiness inspection, a yard test of basic manoeuvres, and a road test in traffic.', page: 82 },
    { text: 'Which of the following is a yard-test manoeuvre?', a: 'Overtaking on a freeway', b: 'Alley docking (reversing into an alley and driving out) or parallel parking', c: 'Passing a pedestrian crossing', d: 'Entering a freeway', correct: 'B', exp: 'Yard-test manoeuvres include the three-point turn, alley docking, parallel parking, incline start and reversing in a straight line. Freeway and crossing items belong to the road test.', page: 82 },
    { text: 'For a motorcycle, the time limit to complete the practical test is…', a: '20 minutes', b: '45 minutes', c: 'There is no time limit', d: '10 minutes', correct: 'C', exp: 'There is no time limit for the motorcycle test; for light and heavy vehicles the yard test has a 20-minute limit (plus a short grace period).', page: 83 },
    { text: 'You will fail the yard test if you…', a: 'Check your mirrors too often', b: 'Exceed the allowed penalty points or commit an “immediate fail” item', c: 'Signal early once', d: 'Stall the engine a single time', correct: 'B', exp: 'You fail the yard test if you exceed the time limit, accumulate more than the allowed penalty points, or commit any immediate-failure item.', page: 83 },
  ],

  // 13 — Use of the vehicle controls (driving test)
  13: [
    { text: 'During the test, every time you intend to change direction or turn you must first…', a: 'Sound the hooter', b: 'Check your mirrors and, where required, your blind spot, and signal your intention', c: 'Change to a higher gear', d: 'Switch on your headlights', correct: 'B', exp: 'Each manoeuvre requires observation (mirrors and blind spot where needed) and a timely signal of your intention.', page: 85 },
    { text: 'When you are stopped and waiting in traffic for a short while, you should…', a: 'Keep your foot on the clutch the whole time', b: 'Select neutral and apply the brake / parking brake as appropriate', c: 'Rev the engine continuously', d: 'Switch off the engine and remove the key', correct: 'B', exp: 'Holding the clutch down for long periods is penalised; select neutral and secure the vehicle with the brake.', page: 85 },
    { text: 'Correct use of the accelerator during the test means…', a: 'Pressing it sharply to show power', b: 'Using it smoothly so the vehicle does not jerk, surge or over-rev', c: 'Never using it', d: 'Using it only in first gear', correct: 'B', exp: 'The accelerator should be used smoothly and progressively so the vehicle moves without jerking or excessive engine noise.', page: 85 },
    { text: 'You should use the steering wheel by…', a: 'Crossing your hands over the top', b: 'Keeping both hands on the wheel and feeding it through your hands (pull-push), except when changing gear or signalling', c: 'Steering with one finger', d: 'Letting it spin back freely on its own', correct: 'B', exp: 'Keep both hands on the wheel and use the pull-push method; never let the wheel spin back uncontrolled.', page: 85 },
    { text: 'When should you adjust your rear-view mirrors for the test?', a: 'While driving along', b: 'While the vehicle is stationary, for maximum rear vision', c: 'Only if a hazard appears', d: 'You do not need to adjust them', correct: 'B', exp: 'Adjust the mirrors for maximum rear vision while the vehicle is stationary; a quick adjustment while moving is penalised.', page: 85 },
    { text: 'During the test you are expected to check your mirrors…', a: 'Once at the start only', b: 'Roughly every 5 to 8 seconds and as you approach any potential hazard', c: 'Only when turning', d: 'Continuously, staring into them', correct: 'B', exp: 'Check the mirrors about every 5–8 seconds and on the approach to any hazard — but do not stare into them so long that you lose sight of the road ahead.', page: 85 },
    { text: 'In the K53 test, the action “Observe” means to…', a: 'Glance straight ahead only', b: 'Look in all directions (360°) — front, sides, mirrors and blind spots — for hazards', c: 'Close one eye', d: 'Look only in the rear-view mirror', correct: 'B', exp: 'Observe means a full 360° lookout: front, sides, mirrors and blind spots, including up and down crossroads and entrances.', page: 85 },
    { text: 'Which is correct about signalling during the test?', a: 'Signal as late as possible', b: 'Signal in good time but not too early, and make sure the signal cancels after the manoeuvre', c: 'Leave the indicator on after turning', d: 'Signal continuously throughout the test', correct: 'B', exp: 'Signal in good time and for a sufficient duration, but not so early that it confuses others; cancel the signal once the manoeuvre is complete.', page: 85 },
    { text: 'You should avoid giving a direction signal…', a: 'Before turning', b: 'Within an intersection, unless it is necessary', c: 'When changing lanes', d: 'When pulling off', correct: 'B', exp: 'Avoid signalling within an intersection unless necessary, as it can mislead other road users about your intentions.', page: 85 },
  ],

  // 14 — The K53 actions explained
  14: [
    { text: 'In the K53 test, an “observation” action usually means you must…', a: 'Glance once in the general direction', b: 'Check the relevant mirror(s) and, where required, look over your shoulder at the blind spot', c: 'Close your eyes briefly', d: 'Only look straight ahead', correct: 'B', exp: 'Observation means checking the appropriate mirrors and, when required, looking over your shoulder to clear the blind spot.', page: 93 },
    { text: 'When must you signal (indicate) during a manoeuvre?', a: 'Only after you have started turning', b: 'In good time before the manoeuvre, so other road users know your intention', c: 'Only if other vehicles are present', d: 'Signalling is optional in the test', correct: 'B', exp: 'You must signal in good time before the manoeuvre so that other road users are warned of your intention.', page: 93 },
    { text: 'A typical K53 action sequence to move off from a stop is best described as…', a: 'Accelerate, then look', b: 'Observe (mirrors and blind spot), signal, and move off only when safe', c: 'Hoot, then pull away', d: 'Move off, then indicate', correct: 'B', exp: 'The standard sequence is to observe (mirrors and blind spot), signal your intention, and move off only when it is safe.', page: 93 },
    { text: 'After completing a manoeuvre such as a turn, you should…', a: 'Leave the indicator on', b: 'Cancel the indicator if it has not cancelled itself', c: 'Sound the hooter', d: 'Stop in the road', correct: 'B', exp: 'Once the manoeuvre is complete you must cancel the indicator if it has not self-cancelled, to avoid misleading others.', page: 93 },
    { text: 'The K53 action “Observe 360°” requires you to…', a: 'Look only at the vehicle ahead', b: 'Look for hazards in all directions — front, sides, mirrors and blind spots', c: 'Check the fuel gauge', d: 'Watch only the speedometer', correct: 'B', exp: 'Observe 360° means looking for hazards in every direction, including the areas not visible in the mirrors.', page: 93 },
    { text: 'In the K53 actions, “check blind spot” means to…', a: 'Glance in the rear-view mirror', b: 'Check the areas that are not visible in the mirrors, by turning your head, before executing the manoeuvre', c: 'Switch on your hazards', d: 'Sound the hooter', correct: 'B', exp: 'A blind-spot check covers the areas the mirrors cannot show; turn your head to check them just before moving.', page: 93 },
    { text: 'The K53 action “select gear” means to…', a: 'Always use first gear', b: 'Select the gear appropriate to the speed of the vehicle', c: 'Put the vehicle in neutral', d: 'Leave it in the current gear', correct: 'B', exp: 'Selecting a gear means choosing the gear that suits the vehicle’s current speed for the manoeuvre.', page: 93 },
    { text: 'When you bring the vehicle to a stationary hold during a manoeuvre, the correct actions include…', a: 'Selecting neutral/park and applying the parking brake', b: 'Keeping it in gear with your foot on the clutch indefinitely', c: 'Switching off the engine', d: 'Releasing the steering wheel', correct: 'A', exp: 'When holding the vehicle stationary you select neutral or park and apply the parking brake, rather than slipping the clutch.', page: 93 },
  ],

  // 15 — The motor vehicle driving test
  15: [
    { text: 'The pre-trip inspection at the start of the driving test is to check that…', a: 'The radio works', b: 'The vehicle is roadworthy and safe — lights, tyres, mirrors, brakes, etc.', c: 'The fuel is full', d: 'The seats are clean', correct: 'B', exp: 'The pre-trip inspection confirms the vehicle is roadworthy: lights, indicators, tyres, mirrors, brakes and other safety items.', page: 95 },
    { text: 'When parking or doing yard manoeuvres, rolling the vehicle backwards too far (excessive roll-back) will…', a: 'Be ignored', b: 'Result in penalty points or a failure', c: 'Earn bonus marks', d: 'Only matter on a hill', correct: 'B', exp: 'Excessive roll-back is a marked error in the yard test and can cause penalty points or a failure.', page: 95 },
    { text: 'When leaving a freeway via an off-ramp, the correct K53 sequence requires you to…', a: 'Brake hard on the freeway before the ramp', b: 'Check mirrors, check the left blind spot, signal, then move into the off-ramp and slow down on the ramp', c: 'Overtake on the single-lane off-ramp', d: 'Stop at the start of the off-ramp', correct: 'B', exp: 'To leave a freeway you check mirrors and the left blind spot, signal, move onto the off-ramp and only then reduce speed — you do not slow excessively on the freeway itself or overtake on a single-lane off-ramp.', page: 129 },
    { text: 'During the road test, at every intersection and hazard you are expected to apply…', a: 'Maximum speed', b: 'The K53 search–identify–predict–decide–execute routine with the correct observations', c: 'The hooter', d: 'The parking brake', correct: 'B', exp: 'Throughout the road test you must apply the K53 defensive-driving routine with the correct observations, signals and actions at intersections and hazards.', page: 95 },
    { text: 'As part of the interior pre-trip inspection, the examiner will ask you to operate the…', a: 'Radio and air-conditioner', b: 'Lights (dipped and main beam), indicators, brake lights, wipers and horn', c: 'Boot and bonnet only', d: 'Seat adjusters', correct: 'B', exp: 'In the interior pre-trip you must show that the dipped/main-beam lights, indicators, brake lights, wipers and horn all work.', page: 96 },
    { text: 'If a pre-trip item such as a brake light does not work, the result is…', a: 'A single penalty point', b: 'The vehicle is regarded as unroadworthy and the test is discontinued (immediate failure)', c: 'No effect', d: 'A warning only', correct: 'B', exp: 'If an inspected item is not operating, the vehicle is unroadworthy, the failure is recorded and the test is discontinued immediately.', page: 96 },
    { text: 'The recommended safe following distance is…', a: '1 second for any vehicle', b: '3 seconds for a light motor vehicle and 6 seconds for a heavy vehicle', c: '10 seconds for all vehicles', d: 'Half a second', correct: 'B', exp: 'A safe following gap is about 3 seconds for a light vehicle and 6 seconds for a heavy one, and should be increased in poor conditions.', page: 110 },
    { text: 'The pre-trip exterior inspection includes checking that…', a: 'The radio is tuned', b: 'The tyres (tread, inflation, wheel nuts) are sound and the licence disc is valid', c: 'The seats are reclined', d: 'The boot is empty', correct: 'B', exp: 'The exterior pre-trip covers roadworthiness items such as tyres/wheels (tread, inflation, wheel nuts), fluid levels, body condition and a valid licence disc.', page: 96 },
    { text: 'During the road test the examiner will…', a: 'Drive the vehicle for you', b: 'Follow a pre-established route and give clear instructions one at a time, without telling you how to drive', c: 'Give you no information at all', d: 'Let you choose any route', correct: 'B', exp: 'The examiner follows a set route and gives clear, concise instructions one at a time; the examiner may not coach you on the actual driving.', page: 110 },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const labelToOpts = (q) =>
  ['A', 'B', 'C', 'D']
    .filter(lbl => q[lbl.toLowerCase()] !== undefined)
    .map(lbl => ({ option_label: lbl, option_text: q[lbl.toLowerCase()], is_correct: q.correct === lbl }))

// ─── SEED ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding "K53 Unpacked"…\n')

  // 1. Clear existing K53-Unpacked data (cascades clear pages/quizzes/questions/options)
  console.log('  Clearing existing K53-Unpacked data…')
  await del('ku_quiz_attempts',         'id=not.is.null')
  await del('ku_user_chapter_progress', 'id=not.is.null')
  await del('ku_chapters',              'manual_slug=eq.k53-unpacked')

  // 2. Chapters
  const chapters = await post('ku_chapters', CHAPTERS.map(c => ({ manual_slug: 'k53-unpacked', pass_threshold: 70, ...c })))
  console.log(`  ✓ ${chapters.length} chapters`)

  // 3. Pages
  const pageRows = []
  for (const ch of chapters) {
    for (let n = ch.page_start; n <= ch.page_end; n++) {
      pageRows.push({
        chapter_id:   ch.id,
        page_number:  n,
        storage_path: `K53 Unpacked/${n}.png`,
        alt_text:     ch.is_front_matter
          ? `K53 Unpacked — page ${n}`
          : `Chapter ${ch.chapter_number}: ${ch.title} — page ${n}`,
      })
    }
  }
  await post('ku_pages', pageRows)
  console.log(`  ✓ ${pageRows.length} pages`)

  // 4. Quizzes (study chapters only)
  const studyChapters = chapters.filter(c => !c.is_front_matter)
  const quizzes = await post('ku_quizzes', studyChapters.map(c => ({
    chapter_id:         c.id,
    title:              `Chapter ${c.chapter_number} Quiz — ${c.title}`,
    instructions:       'Choose the best answer for each question. You can review your answers at the end.',
    time_limit_seconds: null,
  })))
  console.log(`  ✓ ${quizzes.length} quizzes`)
  const quizMap = Object.fromEntries(quizzes.map(q => [q.chapter_id, q.id]))

  // 5. Questions + options
  let totalQ = 0, totalOpt = 0
  for (const ch of studyChapters) {
    const qData = QUIZ_DATA[ch.chapter_number]
    if (!qData) { console.warn(`  ⚠ No quiz data for chapter ${ch.chapter_number}`); continue }
    const quizId = quizMap[ch.id]

    const inserted = await post('ku_questions', qData.map((q, i) => ({
      quiz_id:         quizId,
      question_number: i + 1,
      question_text:   q.text,
      question_type:   'single_choice',
      explanation:     q.exp,
      source_page:     q.page,
      difficulty:      'medium',
    })))
    totalQ += inserted.length

    const optionRows = []
    for (let i = 0; i < inserted.length; i++) {
      for (const opt of labelToOpts(qData[i])) optionRows.push({ question_id: inserted[i].id, ...opt })
    }
    await post('ku_question_options', optionRows)
    totalOpt += optionRows.length
    process.stdout.write(`  ✓ Ch ${ch.chapter_number}: ${inserted.length} questions, ${optionRows.length} options\n`)
  }

  console.log(`\n✅ Done.  Chapters: ${chapters.length}  Pages: ${pageRows.length}  Quizzes: ${quizzes.length}  Questions: ${totalQ}  Options: ${totalOpt}`)
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1) })
