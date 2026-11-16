/**
 * lib/k53-sample-questions.ts — free, public K53 practice questions.
 *
 * Rendered statically on /k53-questions-and-answers and its printable twin
 * /k53-questions-and-answers-pdf. Taken from the app's own question bank
 * (questions_dump.json, `sourceId` = quiz_questions.id), lightly copy-edited,
 * and checked against the K53 manual / NRTA. Only questions that make sense
 * without a picture, or whose picture is served publicly from /public/images,
 * are used. These are practice questions, NOT the official test questions.
 */

export type SectionId = 'vehicle-controls' | 'road-signs' | 'rules-of-the-road'
export type Letter = 'A' | 'B' | 'C'

export interface SampleQuestion {
  /** quiz_questions.id this question was taken from. */
  sourceId: number
  question: string
  options: Record<Letter, string>
  answer: Letter
  /** One-line reason the answer is correct. */
  reason: string
  /** Public image path, if the question needs a picture. */
  image?: string
  imageAlt?: string
}

export interface SampleSection {
  id: SectionId
  title: string
  /** How this section is marked in the real K53 learner's test. */
  testFormat: string
  intro: string
  /** Shared diagram shown once at the top of the section. */
  diagram?: { src: string; alt: string; caption: string; width: number; height: number }
  questions: SampleQuestion[]
}

const SIGNS = '/images/code8/test2'

export const CONTROLS_DIAGRAM = {
  src: `${SIGNS}/2c8.3.img.png`,
  alt: 'K53 light motor vehicle controls diagram, numbered 1 to 11: 1 rear-view mirror, 2 windscreen wipers, 3 side mirrors, 4 steering wheel, 5 indicator lever, 6 gear lever, 7 parking brake, 8 clutch, 9 brake, 10 accelerator, 11 hooter',
  caption: '1 Rear-view mirror · 2 Wipers · 3 Side mirrors · 4 Steering wheel · 5 Indicator · 6 Gear lever · 7 Parking brake · 8 Clutch · 9 Brake · 10 Accelerator · 11 Hooter',
  width: 600,
  height: 439,
}

export const SAMPLE_SECTIONS: SampleSection[] = [
  {
    id: 'vehicle-controls',
    title: 'Vehicle controls',
    testFormat: '8 questions in the real test; you need 6 to pass.',
    intro: 'Vehicle-control questions use a numbered diagram of a car’s controls. Learn what each number does, and when you would use it.',
    diagram: CONTROLS_DIAGRAM,
    questions: [
      { sourceId: 28, question: 'Which control is used to stop the vehicle stalling just before it comes to a complete standstill?', options: { A: '7', B: '8', C: '10' }, answer: 'B', reason: 'Pressing the clutch (8) disconnects the engine from the wheels, so the engine does not stall as you stop.' },
      { sourceId: 29, question: 'Which control is used to select a gear?', options: { A: '6', B: '5', C: '8' }, answer: 'A', reason: 'Number 6 is the gear lever.' },
      { sourceId: 30, question: 'If your car is an automatic, you will not have control number…', options: { A: '8', B: '2', C: '4' }, answer: 'A', reason: 'Automatic cars have no clutch pedal (8); every car has wipers (2) and a steering wheel (4).' },
      { sourceId: 32, question: 'Which number is used to show that you want to turn right or left?', options: { A: '5', B: '2', C: '1' }, answer: 'A', reason: 'Number 5 is the indicator lever.' },
      { sourceId: 33, question: 'Which number is used to steer the vehicle?', options: { A: '10', B: '4', C: '3' }, answer: 'B', reason: 'Number 4 is the steering wheel.' },
      { sourceId: 34, question: 'Which numbers are used to see behind you?', options: { A: '1 and 3', B: '7 and 8', C: '2 and 3' }, answer: 'A', reason: 'The rear-view mirror (1) and the side mirrors (3) show the traffic behind you.' },
      { sourceId: 35, question: 'Which number is used to stop the vehicle?', options: { A: '9', B: '7', C: '8' }, answer: 'A', reason: 'Number 9 is the foot (service) brake, used to slow down and stop.' },
      { sourceId: 36, question: 'Which number makes the vehicle accelerate?', options: { A: '2', B: '3', C: '10' }, answer: 'C', reason: 'Number 10 is the accelerator pedal.' },
      { sourceId: 99, question: 'To make sure your parked vehicle does not move, you use number…', options: { A: '8', B: '7', C: '9' }, answer: 'B', reason: 'Number 7 is the parking (hand) brake, which holds a parked vehicle still.' },
      { sourceId: 122, question: 'Which control must you use when it is raining?', options: { A: '2', B: '5', C: '1' }, answer: 'A', reason: 'Number 2 is the windscreen wipers, which keep your view clear in the rain.' },
      { sourceId: 82, question: 'What is the function of a clutch?', options: { A: 'To disconnect the engine from the transmission', B: 'To freewheel down a hill', C: 'To reduce the speed of the vehicle' }, answer: 'A', reason: 'The clutch disconnects the engine from the gearbox so you can change gears or stop without stalling; freewheeling is unsafe.' },
      { sourceId: 81, question: 'When a motor vehicle is standing still, what must the driver do to make sure it does not move?', options: { A: 'Apply the parking brake', B: 'Put the gear lever in neutral', C: 'Hold the service brake' }, answer: 'A', reason: 'The parking brake is designed to hold a stationary vehicle; neutral lets it roll.' },
    ],
  },
  {
    id: 'road-signs',
    title: 'Road signs and markings',
    testFormat: '28 questions in the real test; you need 23 to pass.',
    intro: 'Road-sign questions show a sign, signal or road marking and ask what it means or what you must do. Colour and shape tell you the type of sign.',
    questions: [
      { sourceId: 95, image: `${SIGNS}/2c8.1.img.png`, imageAlt: 'Road worker in orange overalls holding a red flag straight out to the side', question: 'What is this road worker signalling drivers to do?', options: { A: 'Proceed with caution', B: 'Stop', C: 'Turn back' }, answer: 'B', reason: 'A flagman holding the red flag out horizontally is telling traffic to stop.' },
      { sourceId: 98, image: `${SIGNS}/2c8.4.img.png`, imageAlt: 'Red-bordered triangular warning sign showing a truck on a steep downward slope', question: 'This road sign warns you of…', options: { A: 'Heavy vehicles that may be moving slowly on a downhill slope ahead', B: 'A stationary heavy vehicle ahead', C: 'An accident ahead involving a light and a heavy vehicle' }, answer: 'A', reason: 'This warning sign shows a steep descent where slow-moving heavy vehicles can be expected.' },
      { sourceId: 101, image: `${SIGNS}/2c8.7.png`, imageAlt: 'Pedestrian traffic signal with a red man above a green man', question: 'Which statement about this pedestrian signal is correct?', options: { A: 'When the red man shows, pedestrians have priority', B: 'When the green man shows pedestrians may cross; when the red man shows they may not', C: 'When the green man shows, pedestrians should run across as fast as they can' }, answer: 'B', reason: 'Green man means pedestrians may start crossing; red man means they may not start crossing.' },
      { sourceId: 103, image: `${SIGNS}/2c8.9.img.png`, imageAlt: 'Blue rectangular sign with three white diagonal bars', question: 'What is the purpose of this information sign?', options: { A: 'To count down the distance to the next town', B: 'To count down the distance to the next exit on a freeway', C: 'To count down the distance to the next on-ramp' }, answer: 'B', reason: 'Countdown markers (three, two, one bars) show you are approaching a freeway exit.' },
      { sourceId: 105, image: `${SIGNS}/2c8.11.img.png`, imageAlt: 'Blue freeway sign: Sandton, N1, M9 Rivonia Rd 1 km, with an exit arrow', question: 'What does this road sign tell drivers?', options: { A: 'There is an exit ahead on the freeway, shown in good time', B: 'There is an on-ramp to a freeway ahead', C: 'Turn left to enter a freeway' }, answer: 'A', reason: 'This blue freeway direction sign announces an exit 1 km ahead so you can get into the correct lane early.' },
      { sourceId: 108, image: `${SIGNS}/2c8.14.img.png`, imageAlt: 'Traffic light with a red light and a flashing green arrow pointing right', question: 'When the traffic light is red and the green arrow to the right is flashing, it means…', options: { A: 'If you want to turn right, you may do so', B: 'Only pedestrians may walk', C: 'All traffic must turn right' }, answer: 'A', reason: 'A flashing green arrow lets traffic turn in the direction of the arrow, even while the main light is red.' },
      { sourceId: 111, image: `${SIGNS}/2c8.17.img.png`, imageAlt: 'Road marking with the word STOP painted in front of a solid stop line', question: 'Does this road marking have the same purpose as a stop sign?', options: { A: 'True', B: 'False', C: 'Only at night or in poor visibility' }, answer: 'A', reason: 'A painted STOP with a stop line carries the same instruction as a stop sign: stop completely behind the line.' },
      { sourceId: 113, image: `${SIGNS}/2c8.19.img.png`, imageAlt: 'Red circle with two cars side by side, crossed out, above a plate reading For 2 km', question: 'This road sign shows you that…', options: { A: 'The road is a one-way road', B: 'Overtaking is prohibited for the next 2 km', C: 'The road is too narrow for two cars side by side' }, answer: 'B', reason: 'This is the no-overtaking sign; the plate below limits it to the next 2 km.' },
      { sourceId: 114, image: `${SIGNS}/2c8.20.img.png`, imageAlt: 'Warning sign with a stop sign inside a red triangle, a flashing light, and a 200 m plate', question: 'When you approach this sign, you must…', options: { A: 'Yield and carry on when it is safe', B: 'Know that you are being warned of a stop sign ahead', C: 'Stop behind the stop line and give way to vehicles from the right' }, answer: 'B', reason: 'It is a warning sign: there is a stop sign 200 m ahead, so prepare to stop there.' },
      { sourceId: 115, image: `${SIGNS}/2c8.21.img.png`, imageAlt: 'Blue sign with N17 toll symbol, freeway symbol and an arrow turning right', question: 'This sign shows…', options: { A: 'The direction to a freeway', B: 'That there is a bridge', C: 'That all traffic must turn right' }, answer: 'A', reason: 'The freeway symbol and route number on a blue direction sign show the way to the freeway.' },
      { sourceId: 117, image: `${SIGNS}/2c8.23.img.png`, imageAlt: 'Road marking showing a white aeroplane painted in a lane', question: 'This road marking shows a lane that…', options: { A: 'Is reserved for aeroplanes', B: 'You may follow if you want to go to an airport', C: 'Is reserved for aircraft in an emergency' }, answer: 'B', reason: 'An aeroplane symbol painted in a lane is a guidance marking for traffic heading to the airport.' },
      { sourceId: 119, image: `${SIGNS}/2c8.24.1.img.png`, imageAlt: 'Green sign with a white T shape topped by a red bar', question: 'This sign shows you that…', options: { A: 'The road ends ahead', B: 'Only cars may enter', C: 'There is a one-way road ahead' }, answer: 'A', reason: 'This is the "no through road" sign: the road is a dead end.' },
      { sourceId: 120, image: `${SIGNS}/2c8.25.img.png`, imageAlt: 'No right turn sign above a plate showing a car', question: 'This road sign prohibits…', options: { A: 'Cars from turning right at this point', B: 'Cars from turning right ahead', C: 'All vehicles from turning right' }, answer: 'B', reason: 'The car plate limits the no-right-turn rule to cars, and it applies at the junction ahead.' },
      { sourceId: 121, image: `${SIGNS}/2c8.26.img.png`, imageAlt: 'Yellow diamond with a white and black border', question: 'What does this road sign tell you?', options: { A: 'You do not have right of way at the next intersection', B: 'There is danger ahead', C: 'You have right of way at the next intersection' }, answer: 'C', reason: 'The yellow diamond marks a priority road, so you have right of way at the next intersection.' },
      { sourceId: 123, image: `${SIGNS}/2c8.28.img.png`, imageAlt: 'Blue sign: N3 toll route to Harrismith 105 km and R103 alternative route to Harrismith 121 km', question: 'This sign confirms…', options: { A: 'How much toll you will pay', B: 'Which way all vehicles must go', C: 'A toll road and an alternative route that avoids the toll' }, answer: 'C', reason: 'The T marks the toll route and the A marks the alternative, toll-free route to the same place.' },
      { sourceId: 253, question: 'A temporary sign…', options: { A: 'Has the same legal meaning as a permanent sign', B: 'Need not be taken seriously at all times of the day', C: 'Matters less to road users than a permanent sign' }, answer: 'A', reason: 'Temporary (roadworks) signs must be obeyed exactly like the permanent signs they replace.' },
      { sourceId: 264, question: 'The background of temporary signs is usually…', options: { A: 'White', B: 'Black', C: 'Yellow' }, answer: 'C', reason: 'Temporary signs at roadworks use a yellow background so they stand out from permanent signs.' },
    ],
  },
  {
    id: 'rules-of-the-road',
    title: 'Rules of the road',
    testFormat: '28 questions in the real test; you need 22 to pass.',
    intro: 'Rules-of-the-road questions test the traffic laws: speed limits, following distances, parking, right of way and what to do after a crash.',
    questions: [
      { sourceId: 60, question: 'Which is the most important rule of the road in South Africa?', options: { A: 'Keep to the left side of the road as far as is safe', B: 'Do not exceed the speed limit', C: 'Always be courteous to other road users' }, answer: 'A', reason: 'Keeping left as far as is safe is the basic rule every other rule builds on.' },
      { sourceId: 49, question: 'Unless a sign shows otherwise, the general speed limit in an urban area is… km/h', options: { A: '80', B: '100', C: '60' }, answer: 'C', reason: 'The general limits are 60 km/h in urban areas, 100 km/h on public roads outside towns and 120 km/h on freeways.' },
      { sourceId: 38, question: 'When your licence disc expires, you have a grace period of ___ to renew it without a penalty.', options: { A: '21 days', B: '90 days', C: '12 months' }, answer: 'A', reason: 'A licence disc is valid for 12 months, with a 21-day grace period to renew after it expires.' },
      { sourceId: 50, question: 'What is the longest time a vehicle may be parked in one place on a public road in an urban area?', options: { A: '48 hours', B: '24 hours', C: '7 days' }, answer: 'C', reason: 'In an urban area you may not leave a vehicle parked in the same place for more than 7 days.' },
      { sourceId: 59, question: 'What is the longest time a vehicle may be parked in one place on a public road outside an urban area?', options: { A: '48 hours', B: '7 days', C: '24 hours' }, answer: 'C', reason: 'Outside an urban area the limit is 24 hours.' },
      { sourceId: 160, question: 'How far from either side of a fire hydrant must you park?', options: { A: '1.5 metres', B: '1 metre', C: '750 mm' }, answer: 'A', reason: 'You may not park within 1.5 m of a fire hydrant, so it stays reachable for emergency services.' },
      { sourceId: 72, question: 'If your vehicle breaks down, how far behind it must you place the warning triangle?', options: { A: 'At least 45 m', B: 'At least 10 m', C: 'At least 100 m' }, answer: 'A', reason: 'The warning triangle must be at least 45 m behind the vehicle so approaching drivers see it in time.' },
      { sourceId: 74, question: 'If the red traffic light is flashing, you must…', options: { A: 'Stop, and go only when it is safe', B: 'Look out for a roadblock', C: 'Stop and wait for the light to turn green' }, answer: 'A', reason: 'A flashing red light works like a stop sign: stop completely, then go when it is safe.' },
      { sourceId: 78, question: 'A safe following distance means that if the vehicle in front suddenly stops, you can…', options: { A: 'Swerve and pass', B: 'Stop without swerving', C: 'Swerve and stop next to it' }, answer: 'B', reason: 'A safe gap lets you stop in a straight line behind the vehicle without swerving.' },
      { sourceId: 84, question: 'What is the minimum safe following distance behind another vehicle?', options: { A: 'Five metres at 100 km/h', B: 'A distance worked out with the two-second rule', C: 'As close as possible so overtaking is easier' }, answer: 'B', reason: 'Stay at least two seconds behind the vehicle in front, and more in rain or poor visibility.' },
      { sourceId: 147, question: 'When may you drive in the right-hand lane of a freeway?', options: { A: 'Any time, as long as you don’t stop in it', B: 'When you are driving faster than other traffic', C: 'Only when overtaking another vehicle' }, answer: 'C', reason: 'On a freeway you keep left and use the right-hand lane only to overtake, then move back.' },
      { sourceId: 67, question: 'When may you drive on the right-hand side of a two-way road?', options: { A: 'When a traffic officer tells you to', B: 'When your hazard lights are on', C: 'Never' }, answer: 'A', reason: 'You may break a rule of the road only when a traffic officer directs you to.' },
      { sourceId: 83, question: 'When may a driver disobey a rule of the road?', options: { A: 'Only when a traffic officer directs them to', B: 'In an emergency', C: 'Never' }, answer: 'A', reason: 'An instruction from a traffic officer is the only thing that overrides the rules of the road.' },
      { sourceId: 263, question: 'If an emergency vehicle comes towards you with its siren on, you must…', options: { A: 'Give way to the emergency vehicle', B: 'Flash your headlights to warn other traffic', C: 'Switch on your hazard lights and hoot' }, answer: 'A', reason: 'Emergency vehicles with sirens on have right of way: move left and let them pass.' },
      { sourceId: 88, question: 'While the vehicle is moving, a driver may…', options: { A: 'Hold a cell phone if one hand stays on the steering wheel', B: 'Type an SMS', C: 'Not hold a cell phone with any part of the body' }, answer: 'C', reason: 'You may not hold a phone with any part of your body while driving; hands-free use only.' },
      { sourceId: 162, question: 'Which statement about alcohol is correct?', options: { A: 'You may drive if you only drank one bottle of wine', B: 'A driver may not drive while under the influence of alcohol', C: 'You may drive if you only drank beer' }, answer: 'B', reason: 'Driving under the influence of alcohol is illegal, whatever you drank.' },
      { sourceId: 79, question: 'What colour and size must flags be to mark a load sticking out of a vehicle on a public road?', options: { A: 'Any colour, as long as they are visible', B: 'Red and at least 300 mm × 300 mm', C: 'Any size, as long as they are red' }, answer: 'B', reason: 'Projecting loads must be marked with red flags of at least 300 mm × 300 mm.' },
      { sourceId: 286, question: 'A crash in which nobody was injured must be reported to the police within… hours', options: { A: '36', B: '48', C: '24' }, answer: 'C', reason: 'If no one is injured, report the crash at a police station within 24 hours.' },
    ],
  },
]

export const SAMPLE_QUESTION_COUNT = SAMPLE_SECTIONS.reduce((n, s) => n + s.questions.length, 0)

export const QUESTIONS_PATH = '/k53-questions-and-answers'
export const QUESTIONS_PDF_PATH = '/k53-questions-and-answers-pdf'
/** CTA at the end of every section. */
export const FULL_TEST_URL = '/register?trial=1'

/** FAQPage JSON-LD: each sample question with its correct answer and reason. */
export function questionsFaqSchema(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: pageUrl,
    mainEntity: SAMPLE_SECTIONS.flatMap(section =>
      section.questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${q.answer}: ${q.options[q.answer]}. ${q.reason}`,
        },
      })),
    ),
  }
}
