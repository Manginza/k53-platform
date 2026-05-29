// Seed Code 10 Test 2 — correct answers verified from Word doc memo
const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY env var')
  process.exit(1)
}

const img = (name) => ({ image_url: `/images/code10/test2/${name}.png`, image_ref: `${name}.png` })
const noImg = { image_url: null, image_ref: null }

const questions = [
  // Q1
  { ...img('2c10.1.img'), question: 'What does this road sign indicate?', option_a: 'That you have the right of way at the next intersection.', option_b: 'That there is danger ahead.', option_c: 'That you do not have the right of way at the next intersection.', correct_answer: 'A' },
  // Q2
  { ...noImg, question: 'If you want to change lanes, you must...', option_a: 'Give the necessary signal and, after looking for other traffic, change lanes.', option_b: 'Switch on your indicator and change lanes.', option_c: 'Apply the brakes lightly and then change lanes.', correct_answer: 'A' },
  // Q3
  { ...noImg, question: 'You may cross or enter a public road...', option_a: 'If the road is clear of traffic for a short distance.', option_b: 'If the road is clear of traffic for a long distance and it can be done without obstructing traffic.', option_c: 'In any manner as long as you use your indicators in time.', correct_answer: 'B' },
  // Q4
  { ...img('2c10.2.img'), question: 'Does this road marking have the same purpose as a stop sign?', option_a: 'True.', option_b: 'False.', option_c: null, correct_answer: 'A' },
  // Q5 — doc says C (only (i) is correct)
  { ...img('2c10.2.1.img'), question: 'This road sign prohibits all ... to drive there: (i) vehicles conveying dangerous goods, (ii) goods vehicles, (iii) abnormal vehicles, (iv) heavy vehicles. SELECT THE CORRECT COMBINATION', option_a: 'Only (iii) and (iv) are correct', option_b: 'All of the above are correct', option_c: 'Only (i) is correct', correct_answer: 'C' },
  // Q6
  { ...noImg, question: 'If you want to turn left with your vehicle, you must...', option_a: 'Slow down completely, stop and then turn.', option_b: 'First move to the right to enable you to turn left easily.', option_c: 'Give the necessary signal in good time.', correct_answer: 'C' },
  // Q7
  { ...noImg, question: 'When you drive...', option_a: 'You must have both hands on the steering wheel.', option_b: 'You must wear shoes with rubber soles.', option_c: 'Your vision of the road and the traffic must be unobstructed.', correct_answer: 'C' },
  // Q8
  { ...noImg, question: 'What is the duty of a driver when driving on a public road that has been divided into two or more roadways?', option_a: 'You are allowed to drive on any part of the roadway after sunset, or when there is no other traffic on the road.', option_b: 'Drive on the left-hand roadway unless directed or shown to do so by a traffic officer or traffic sign.', option_c: 'You may drive on any part of the roadway.', correct_answer: 'B' },
  // Q9
  { ...noImg, question: 'A heavy motor vehicle must be equipped with an efficient exhaust silencer, which...', option_a: 'must be so maintained that the exhaust gas or smoke does not leak into the driving cab or passenger compartment of the vehicle.', option_b: 'must be so maintained that it does not cause a vibration in the cab.', option_c: 'does not have to be maintained, as long as it does not make noise.', correct_answer: 'A' },
  // Q10 — doc says A (one-way road to left), not C
  { ...img('2c10.3.img'), question: 'What does this control sign indicate?', option_a: 'The road turning to the left is a one-way road to the left.', option_b: 'Turning left is prohibited.', option_c: 'You should turn left.', correct_answer: 'A' },
  // Q11
  { ...img('2c10.4.img'), question: 'When control number 9 is used, the distance it takes the vehicle to stop is: (i) longer on a wet road than on a dry road, (ii) longer if the vehicle is travelling at a higher speed, (iii) longer if the vehicle is loaded. SELECT THE CORRECT COMBINATION', option_a: 'None of the above are correct', option_b: 'Only (i) is correct', option_c: 'All of the above are correct', correct_answer: 'C' },
  // Q12
  { ...img('2c10.5.img'), question: 'This road sign shows that…', option_a: 'goods vehicles are not allowed to use this road.', option_b: 'goods vehicles are not allowed in the right-hand lane.', option_c: 'only goods vehicles must use the right-hand lane.', correct_answer: 'B' },
  // Q13
  { ...noImg, question: 'You must stop your vehicle: (i) On a public road at the signal of a person herding sheep, (ii) On a freeway when directed to do so by a traffic officer, (iii) On any road to avoid an accident. SELECT THE CORRECT COMBINATION', option_a: 'Only (ii) and (iii) are correct', option_b: 'Only (iii) is correct', option_c: 'All of the above are correct', correct_answer: 'C' },
  // Q14
  { ...noImg, question: 'What should the driver of a vehicle do when following another vehicle at night?', option_a: 'Flash the main beam occasionally', option_b: 'Dip the main beam', option_c: 'Make sure the main beam is on', correct_answer: 'B' },
  // Q15 — doc says A (All of the above)
  { ...noImg, question: 'When you are involved in an accident, you: (i) Must immediately stop your vehicle, (ii) Must determine the damage to the vehicles, (iii) May refuse to give your name and address to anyone except the police. SELECT THE CORRECT COMBINATION', option_a: 'All of the above are correct', option_b: '(i) and (ii) only are correct', option_c: '(ii) only is correct', correct_answer: 'A' },
  // Q16 — doc says B (lane reserved for vehicle of specific company)
  { ...img('2c10.7.img'), question: 'What does this road sign inform road users of?', option_a: 'A pick-up OR drop-off area reserved for a bus belonging to a specific company or organisation.', option_b: 'A lane reserved for a vehicle belonging to a specific company or organisation.', option_c: 'A parking spot reserved for buses.', correct_answer: 'B' },
  // Q17
  { ...img('2c10.8.img'), question: 'The appropriate reaction to this sign would be to…', option_a: 'turn right at the next intersection.', option_b: 'keep left.', option_c: 'be on the lookout for vehicles doing lane changes, especially from the left.', correct_answer: 'C' },
  // Q18
  { ...noImg, question: 'While the vehicle is in motion, a driver may...', option_a: 'type an SMS.', option_b: 'hold a cell phone provided the driver keeps at least one hand on the steering wheel.', option_c: 'not hold a cell phone with any other part of the body.', correct_answer: 'C' },
  // Q19
  { ...noImg, question: 'A temporary sign...', option_a: 'has the same legal significance as a permanent sign.', option_b: 'need not be taken seriously at all times of the day.', option_c: 'is of less consequence to road users than a permanent sign.', correct_answer: 'A' },
  // Q20 — doc says C (option C shows turn right sign)
  { ...img('2c10.9.img'), question: 'Which one of these signs says you must turn right?', option_a: 'Sign B', option_b: 'Sign A', option_c: 'Sign C', correct_answer: 'C' },
  // Q21
  { ...img('2c10.10.img'), question: 'When the traffic light is red and the green arrow flashes to the right, it shows you that:', option_a: 'Only pedestrians may walk.', option_b: 'If you want to turn right, you may go.', option_c: 'All traffic must turn right there.', correct_answer: 'B' },
  // Q22
  { ...noImg, question: 'When do you have the right of way? (i) When you are within a traffic circle, (ii) When you have stopped first at a four-way stop, (iii) When you want to turn right at an intersection in a two-way road. SELECT THE CORRECT COMBINATION', option_a: '(i) and (ii) only are correct', option_b: 'All of the above are correct', option_c: '(i) only is correct', correct_answer: 'A' },
  // Q23
  { ...noImg, question: 'What type of brakes must be fitted on a heavy motor vehicle?', option_a: 'Parking brakes only.', option_b: 'Service brakes, parking brakes and emergency brakes.', option_c: 'Service brakes only.', correct_answer: 'B' },
  // Q24
  { ...noImg, question: 'You may not: (i) Leave the engine running unattended, (ii) Use your vehicle without a cap on the fuel tank, (iii) Spin the wheels of your vehicle when pulling off. SELECT THE CORRECT COMBINATION', option_a: '(ii) only is correct', option_b: '(i) only is correct', option_c: 'All of the above are correct', correct_answer: 'C' },
  // Q25
  { ...noImg, question: 'A safe following distance means that if the vehicle in front of you suddenly stops, you can...', option_a: 'Stop without swerving', option_b: 'Swerve and stop next to it', option_c: 'Swerve and pass', correct_answer: 'A' },
  // Q26
  { ...noImg, question: 'If travelling in a goods vehicle towing a trailer, how many emergency warning signs (triangles) must you carry?', option_a: 'A minimum of two warning signs (triangles).', option_b: 'Only one.', option_c: 'Warning triangles are not compulsory.', correct_answer: 'A' },
  // Q27
  { ...noImg, question: 'When flags are used to indicate load projections...', option_a: 'They must be any sized red flag.', option_b: 'They may be any colour as long as they are visible.', option_c: 'They must be red, and at least 300 mm x 300 mm.', correct_answer: 'C' },
  // Q28
  { ...img('2c10.11.img'), question: 'This road sign shows that…', option_a: 'all heavy vehicles may drive here during the times shown on the sign', option_b: 'vehicles carrying hazardous products may only use the road during the times shown on the sign', option_c: 'tankers must use this road during the times shown on the sign', correct_answer: 'B' },
  // Q29
  { ...noImg, question: 'If you come across an emergency vehicle on the road sounding a siren, you must…', option_a: 'Give right of way to the emergency vehicle', option_b: 'Flash your headlights to warn other traffic', option_c: "Switch on your vehicle's emergency lights and blow your hooter", correct_answer: 'A' },
  // Q30
  { ...noImg, question: 'The background of temporary signs is usually...', option_a: 'white.', option_b: 'black.', option_c: 'yellow.', correct_answer: 'C' },
  // Q31
  { ...noImg, question: 'You may not drive into an intersection when...', option_a: 'The traffic light is yellow and you are already in the intersection.', option_b: 'There is not enough space in the intersection to turn right without blocking other traffic.', option_c: 'The vehicle in front of you wants to turn right and the road is wide enough to pass on the left side.', correct_answer: 'B' },
  // Q32
  { ...img('2c10.11.1.img'), question: 'This road marking shows you a lane that…', option_a: 'you may follow if you want to go to an airport', option_b: 'is reserved for aeroplanes', option_c: 'is reserved for faulty aeroplanes', correct_answer: 'A' },
  // Q33
  { ...img('2c10.12.img'), question: 'This road sign shows that… (GVM restriction)', option_a: 'heavy motor vehicles with a GVM less than 5 tons are not allowed to turn left ahead.', option_b: 'heavy motor vehicles with a GVM of 5 tons or more are not allowed to turn left ahead.', option_c: 'all heavy motor vehicles are not allowed to turn left ahead.', correct_answer: 'B' },
  // Q34
  { ...noImg, question: 'Where may you legally stop with your vehicle?', option_a: '5 m from a pedestrian crossing', option_b: '4 m from a tunnel', option_c: '6 m from a railway crossing', correct_answer: 'C' },
  // Q35
  { ...img('2c10.12.img'), question: 'This road sign shows you that… (length restriction)', option_a: 'Vehicles longer than 15 m may not drive past this sign.', option_b: 'No vehicles with trailers may drive past this sign.', option_c: 'The road is only 15 m wide past this sign.', correct_answer: 'A' },
  // Q36
  { ...img('2c10.13.img'), question: 'When you encounter this road marking, the correct reaction would be to…', option_a: 'yield only to traffic from the right.', option_b: 'stop over the line and then proceed when it is safe to do so.', option_c: 'yield right of way to any vehicle which crosses any yield line before you.', correct_answer: 'C' },
  // Q37
  { ...noImg, question: 'If you come to a traffic light and the red light flashes, you must…', option_a: 'Stop and wait for the light to change to green before you go.', option_b: 'Look out for a roadblock as the light shows you a police stop.', option_c: 'Stop and go only if it is safe to do so.', correct_answer: 'C' },
  // Q38
  { ...img('2c10.14.img'), question: 'What is the purpose of this information sign?', option_a: 'To count down the distance to the next exit on a freeway.', option_b: 'To count down the distance to the next on-ramp to a freeway.', option_c: 'To count down the distance to the next town.', correct_answer: 'A' },
  // Q39
  { ...img('2c10.15.img'), question: 'When may you stop in front of this sign?', option_a: 'Never.', option_b: 'Only when picking up passengers.', option_c: 'Only when you want to look at the scenery.', correct_answer: 'A' },
  // Q40
  { ...img('2c10.16.img'), question: 'What does this road sign inform drivers of?', option_a: 'An exit ahead on a freeway in good time.', option_b: 'To turn left to enter a freeway.', option_c: 'An on-ramp to a freeway in good time.', correct_answer: 'A' },
  // Q41
  { ...img('2c10.17.img'), question: 'What is this road sign called?', option_a: 'An advance trailblazer', option_b: 'An alternative route marker', option_c: 'A map-type trailblazer', correct_answer: 'A' },
  // Q42 — doc says C (side road junction from right), not B
  { ...img('2c10.17.1.img'), question: 'This sign warns a driver that…', option_a: 'a T-junction is ahead.', option_b: 'a skew T-junction is ahead.', option_c: 'a side road junction from the right is ahead.', correct_answer: 'C' },
  // Q43
  { ...noImg, question: 'When may a driver disobey a rule of the road?', option_a: 'Under no circumstances', option_b: 'Only when directed to do so by a traffic officer.', option_c: 'If you are driving in an emergency situation.', correct_answer: 'B' },
  // Q44
  { ...noImg, question: 'What are the requirements for a vehicle being used with excessive noise?', option_a: 'Excessive noise is acceptable during festive periods, Christmas, and New Year.', option_b: 'No person shall operate a vehicle on a public road that causes any excessive noise.', option_c: 'There are no requirements with regards to excessive noise on a vehicle.', correct_answer: 'B' },
  // Q45 — doc says B (road ends ahead)
  { ...img('2c10.18.img'), question: 'This sign shows you that…', option_a: 'only cars may enter.', option_b: 'the road ends ahead.', option_c: 'there is a one-way road ahead.', correct_answer: 'B' },
  // Q46
  { ...img('2c10.19.img'), question: 'When seeing this sign you should know that…', option_a: 'there is a public phone ahead.', option_b: 'there is no cell phone reception for the next 500 m.', option_c: 'there is an emergency phone 500 m ahead on the road.', correct_answer: 'C' },
  // Q47
  { ...noImg, question: 'The use of a temporary sign implies that for some reason...', option_a: 'the rules of the road do not apply.', option_b: 'circumstances on the roadway are not normal.', option_c: 'traffic has to move slowly.', correct_answer: 'B' },
  // Q48
  { ...noImg, question: 'The only instance where you may stop on a freeway is...', option_a: 'For a rest during a tiring journey', option_b: 'To obey a road traffic sign', option_c: 'To pick up hitch-hikers', correct_answer: 'B' },
  // Q49
  { ...img('2c10.20.img'), question: 'Where do you find this direction sign?', option_a: 'On any freeway, indicating dedicated exit lanes.', option_b: 'Only in towns or suburbs.', option_c: 'On any public road indicating single exit lanes.', correct_answer: 'A' },
  // Q50
  { ...img('2c10.21.img'), question: 'What is this road worker signaling drivers to do?', option_a: 'To proceed with caution.', option_b: 'To stop.', option_c: 'To turn back.', correct_answer: 'B' },
  // Q51 — doc says C (not stop between certain periods)
  { ...img('2c10.22.img'), question: 'The road marking next to the black arrow tells you that…', option_a: 'you may stop adjacent to the red line.', option_b: 'you may not stop there at all times.', option_c: 'you may not stop there between certain periods indicated by another appropriate road sign.', correct_answer: 'C' },
  // Q52
  { ...noImg, question: 'An accident in which no one has been injured must be reported within ... hours', option_a: '36', option_b: '48', option_c: '24', correct_answer: 'C' },
  // Q53
  { ...noImg, question: 'What colour and size must flags be to indicate load projections on a vehicle on a public road?', option_a: 'They can be any size as long as they are red.', option_b: 'They must be red and at least 300 mm x 300 mm.', option_c: 'They may be any colour as long as they are visible.', correct_answer: 'B' },
  // Q54
  { ...noImg, question: 'When are you allowed to drive your vehicle on the right-hand side of a road with traffic moving in both directions?', option_a: 'Under no circumstances', option_b: 'When a traffic officer shows you to do so', option_c: 'When you switch the emergency lights of your vehicle on', correct_answer: 'B' },
]

// Attach course/test metadata
const payload = questions.map(q => ({
  course_id: 3,
  test_number: 2,
  question: q.question,
  option_a: q.option_a,
  option_b: q.option_b,
  option_c: q.option_c || null,
  correct_answer: q.correct_answer,
  image_url: q.image_url,
  image_ref: q.image_ref,
}))

console.log(`Seeding ${payload.length} questions for Code 10 Test 2...`)

// Clear existing
const del = await fetch(`${SUPABASE_URL}/rest/v1/quiz_questions?course_id=eq.3&test_number=eq.2`, {
  method: 'DELETE',
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
})
if (!del.ok) console.warn('Warning: delete failed', del.status)

// Insert
const ins = await fetch(`${SUPABASE_URL}/rest/v1/quiz_questions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    Prefer: 'return=minimal',
  },
  body: JSON.stringify(payload),
})

if (ins.ok) {
  console.log(`✓ Seeded ${payload.length} questions (status ${ins.status})`)
} else {
  const text = await ins.text()
  console.error(`✗ Seed failed (${ins.status}):`, text)
}
