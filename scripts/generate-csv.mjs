import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const questions = [
  // ── ROAD SIGNS (unique images) ──────────────────────────────────────────
  { ref: 'C81.q1.img',  q: 'When seeing this sign the driver knows that he/she must...', a: 'keep in the left lane only', b: 'pass to the left of the obstacle on which the sign has been placed', c: 'Proceed on the left side of the road', ans: 'B' },
  { ref: 'C81.q2.img',  q: 'When this signal is illuminated it shows you that...', a: 'there is an unguarded railway crossing ahead', b: 'it is a traffic lane that vehicles may not enter', c: 'there is no throughway there', ans: 'B' },
  { ref: 'C81.q3.img',  q: 'When travelling on this secondary crossroad you...', a: 'only have to stop if traffic from the left or right is approaching', b: 'do not have right of way and you have to stop', c: 'have right of way', ans: 'B' },
  { ref: 'C81.q4.img',  q: 'This sign indicates to a driver that there is a freeway exit in ... ahead', a: '100 meters', b: '1 km', c: '10 meters', ans: 'A' },
  { ref: 'C81.q6.img',  q: 'Where can you find this direction sign', a: 'On the left-hand side of a freeway next to the off-ramp', b: 'On any freeway with multiple traffic lanes', c: 'On any ordinary road with more than one traffic lane', ans: 'C' },
  { ref: 'C81.q7.img',  q: 'This sign shows you that...', a: 'vehicles may overtake on the left side from there on', b: 'the people driving on the left side of the road must turn left', c: 'a lane is added to the left of a two-way roadway', ans: 'C' },
  { ref: 'C81.q8.img',  q: 'Where do you find this direction sign', a: 'On any public road indicating single exit lanes', b: 'Only in towns or suburbs', c: 'On any freeway indicating dedicated exit lanes', ans: 'C' },
  { ref: 'C81.q9.img',  q: 'What is this road sign used for', a: 'To indicate distances in km to the next town or suburb', b: 'To indicate exits that are close together in good time all leading to the same town', c: 'To indicate payable toll-pay fees on each route', ans: 'B' },
  { ref: 'C81.q10.img', q: 'This road marking...', a: 'divides the road into two lanes', b: 'shows that overtaking is not allowed', c: 'it is only found in a parking area', ans: 'A' },
  { ref: 'C81.q11.img', q: 'This signal indicates that...', a: 'this lane is for slow moving traffic only', b: 'you may drive there', c: 'this lane is for fast moving traffic only', ans: 'B' },
  { ref: 'C81.q12.img', q: 'This road marking indicates to drivers that...', a: 'this lane is for the exclusive uses of buses', b: 'you may use this lane if you want to pickup people', c: 'any vehicle dropping or picking up passengers may use this lane', ans: 'A' },
  { ref: 'C81.q14.img', q: 'This sign indicates to the driver that there...', a: 'are obstructions to the road for 1 km', b: 'are obstructions to the road 1 km ahead that affect the traffic movement', c: 'are road works within 1 km', ans: 'B' },
  { ref: 'C81.q16.img', q: 'This sign indicates to the driver of a vehicle that...', a: 'the minimum speed limit in the right-hand lane is temporarily 80km per hour', b: 'the minimum speed limit in the right-hand lane is 80km per hour', c: 'the maximum speed limit in the right-hand lane is 80km per hour', ans: 'A' },
  { ref: 'C81.q18.img', q: 'Where can you come across this sign', a: 'Usually on the left-hand side of an ordinary road opposite an on-ramp to a freeway', b: 'Usually on the left-hand side of a freeway before an off-ramp', c: 'Usually on the left-hand side of an ordinary road a couple of metres before an on-ramp to a freeway', ans: 'A' },
  { ref: 'C81.q19.img', q: 'This road marking warns the road user that...', a: 'overtaking is not allowed', b: 'the road will split', c: 'the right lane may be used by vehicles moving in opposite directions at different times', ans: 'C' },
  { ref: 'C81.q20.img', q: 'This sign shows the driver of the vehicle that...', a: 'there is an alternative route at the next intersection to the right', b: 'the road turns to the right only', c: 'at the next intersection the driver must turn right', ans: 'A' },
  { ref: 'C81.q21.img', q: 'This road sign shows you that...', a: 'there is a parking for motor cars there', b: 'you must drive there', c: 'the lane is reserved for motor cars', ans: 'A' },
  { ref: 'C81.q22.img', q: 'This road marking tells you that...', a: 'you may never park next to the road indicated by the black arrow', b: 'the road is under construction', c: 'you may not stop next to the road over there', ans: 'A' },
  { ref: 'C81.q23.img', q: 'This road sign shows you that...', a: 'the area is for motor car taxis only', b: 'you can drive there if you wish', c: 'you must drive there', ans: 'C' },
  { ref: 'C81.q25.img', q: 'The appropriate reaction to this sign is to...', a: 'stop as the road is closed', b: 'turn around as the road ends', c: 'slow down and prepare to stop if necessary', ans: 'C' },
  { ref: 'C81.q27.img', q: 'When a vehicle is travelling in the right-hand lane as shown in this sign a driver must...', a: 'Drive faster than or drive 50km/h', b: 'Drive slower than 50km/h', c: 'Overtake vehicles in the right hand lane that are travelling slower than 50km/h', ans: 'A' },
  { ref: 'C81.q28.img', q: 'The road marking next to the black arrow tells you that...', a: 'you may not stop there between certain periods indicated by another appropriate road sign', b: 'you may stop adjacent to the red line', c: 'you may not stop there at all times', ans: 'A' },
  { ref: 'C81.q29.img', q: 'This road marking indicates to the road user...', a: 'that he/she may stop there to drop off passengers', b: 'not to stop on the marking or cross it when overtaking', c: 'that the lines may be crossed in order to overtake another vehicle', ans: 'A' },
  { ref: 'C81.q30.img', q: 'When the robot is red and the red arrow flashes to the left it shows you that...', a: 'you must stop behind the stop line and only proceed left if it is safe to do so even if the red light is on', b: 'you don\'t have to stop and you may just turn left', c: 'you must slow down and then turn left without yielding to other traffic', ans: 'A' },
  { ref: 'C81.q31.img', q: 'This group of signs is known as...', a: 'an information sign', b: 'a warning sign', c: 'a regulatory sign', ans: 'A' },
  { ref: 'C81.q32.img', q: 'This sign shows you that...', a: 'taking photographs is not permitted', b: 'there is a photographic studio ahead', c: 'there is a speed camera monitoring the intersection of the traffic light', ans: 'C' },
  { ref: 'C81.q33.img', q: 'This sign shows to drivers of vehicles that...', a: 'this is a parking for police vehicles', b: 'parking is available free of charge', c: 'parking is available only upon paying the fee indicated at such a parking area', ans: 'C' },

  // ── VEHICLE CONTROLS (shared diagram image) ─────────────────────────────
  { ref: 'controls-diagram', q: 'Which control is used to avoid the vehicle stalling just before coming to a complete standstill', a: '7', b: '8', c: '10', ans: 'B' },
  { ref: 'controls-diagram', q: 'Which control is used to select a gear', a: '6', b: '5', c: '8', ans: 'A' },
  { ref: 'controls-diagram', q: 'If your car is automatic you will not have control number...', a: '8', b: '2', c: '4', ans: 'A' },
  { ref: 'controls-diagram', q: 'Which control is used to avoid the vehicle stalling just before coming to a complete standstill', a: '10', b: '7', c: '8', ans: 'C' },
  { ref: 'controls-diagram', q: 'Which number is used to indicate that you wish to turn right or left', a: '5', b: '2', c: '1', ans: 'A' },
  { ref: 'controls-diagram', q: 'Which number is used to steer the vehicle', a: '10', b: '4', c: '3', ans: 'B' },
  { ref: 'controls-diagram', q: 'Which numbers are used to see behind you', a: '1 and 3', b: '7 and 8', c: '2 and 3', ans: 'A' },
  { ref: 'controls-diagram', q: 'Which number is used to stop the vehicle', a: '9', b: '7', c: '8', ans: 'A' },
  { ref: 'controls-diagram', q: 'Which number makes the vehicle accelerate', a: '2', b: '3', c: '10', ans: 'C' },

  // ── RULES OF THE ROAD (no image) ────────────────────────────────────────
  { ref: '', q: 'Which is ALLOWED when towing another vehicle? (i) a motor car tows another motor car with a rope and drives 40 km/h (ii) you tow another vehicle with a tow-bar (iii) a tractor tows a trailer with 10 passengers on it at a speed of 30 km/h SELECT THE CORRECT COMBINATION', a: 'All of the above are correct', b: '(ii) and (iii) are only correct', c: '(i) only is correct', ans: 'B' },
  { ref: '', q: 'When your licence disc has expired you are given a grace period of _____ to renew it without any penalty', a: '21 days', b: '90 days', c: '12 months', ans: 'A' },
  { ref: '', q: 'You are not allowed to stop...', a: 'With the front of your vehicle facing on-coming traffic', b: 'Next to any obstruction in the road', c: 'On the pavement', ans: 'C' },
  { ref: '', q: 'You may overtake another vehicle on the left-hand side... (i) When that vehicle is going to turn right and the road is wide enough (ii) Where the road has 2 lanes for traffic moving in the same direction (iii) If a police officer instructs you to do so SELECT THE CORRECT COMBINATION', a: '(ii) and (iii) only are correct', b: 'All of the above are correct', c: '(iii) only is correct', ans: 'B' },
  { ref: '', q: 'It is illegal when you drive and a passenger...', a: 'sits directly behind you when you only have a learners licence', b: 'fiddles with the motor radios volume knob', c: 'rides on the bumper of your vehicle', ans: 'C' },
  { ref: '', q: 'You may...', a: 'Drive your vehicle on the sidewalk at night', b: 'Leave the engine of your vehicle idling when you put petrol in it', c: 'Reverse your vehicle only if it is safe to do so', ans: 'C' },
  { ref: '', q: 'What is true with regard to seatbelts? (i) if your vehicle has seatbelts in the rear it must be worn (ii) you need not wear a seatbelt when reversing (iii) children younger than 14 years need not wear seatbelts (iv) if the front seat has a seatbelt your only passenger may not sit at the back where there is no seatbelt SELECT THE CORRECT COMBINATION', a: '(i) (ii) and (iv) are correct', b: 'Only (i) is correct', c: 'All of the above are correct', ans: 'B' },
  { ref: '', q: 'If you see that someone wants to overtake you you must... (i) Not drive faster (ii) Keep to the left as far as is safe (iii) Give hand signals to allow the person to pass safely SELECT THE CORRECT COMBINATION', a: '(ii) is only correct', b: 'Only (i) and (ii) are correct', c: 'All of the above are correct', ans: 'B' },
  { ref: '', q: 'At an intersection...', a: 'You can pass another vehicle waiting to turn right on its left side by going off the road', b: 'You can stop in it to offload passengers', c: 'Pedestrians who are already crossing the road when the red man signal starts showing have right of way', ans: 'C' },
  { ref: '', q: 'The tread pattern of your vehicles tyres may not be less than...', a: '0.75mm', b: '1.5mm', c: '1mm', ans: 'C' },
  { ref: '', q: 'You are not allowed to stop...', a: 'Where you are also prohibited to park', b: 'Opposite a vehicle where the road-way is 10m wide', c: '5m from a bridge', ans: 'A' },
  { ref: '', q: 'When you want to change lanes you must... (i) Only do it when it is safe to do so (ii) Switch on your indicators in time (iii) Use the mirrors of your vehicle SELECT THE CORRECT COMBINATION', a: 'Only (i) and (ii) are correct', b: 'Only (ii) and (iii) are correct', c: 'All of the above are correct', ans: 'C' },
  { ref: '', q: 'Unless otherwise shown by a sign the general speed limit in an urban area is...km/h', a: '80', b: '100', c: '60', ans: 'C' },
  { ref: '', q: 'What is the longest period that a vehicle may be parked on one place on a public road in urban areas', a: '48 hours', b: '24 hours', c: '7 days', ans: 'B' },
  { ref: '', q: 'When are you allowed to drive on the shoulder of a road? (i) Any time if you want to let another vehicle pass you (ii) In daytime when you want to allow another vehicle pass you and its safe (iii) When on a freeway with 4 lanes in both directions you want to drive slower than 120 km/h (iv) When you have a flat tyre and you want to park there to change it SELECT THE CORRECT COMBINATION', a: '(ii) and (iv) only are correct', b: 'All of the above are correct', c: '(i) (iii) and (iv) only are correct', ans: 'A' },
  { ref: '', q: 'The legal speed limit which you may drive...', a: 'Is always 120km/h outside an urban area', b: 'Can be determined by yourself if you look at the number of lanes the road has', c: 'Is shown to you by signs next to the road', ans: 'C' },
  { ref: '', q: 'The maximum distance between two vehicles which are been towed is...m', a: '2.5', b: '3.5', c: '1.8', ans: 'A' },
  { ref: '', q: 'The following vehicles are not allowed on a freeway', a: 'A tractor except when it is used in connection with construction or maintenance of the freeway', b: 'A vehicle driven by a learner driver', c: 'A vehicle used for the conveyance of school children', ans: 'A' },
  { ref: '', q: 'The lights of your vehicle parked on a public road between sunset and sunrise need not be kept lighted when the vehicle is parked... (i) 10m from a lighted street lamp (ii) next to the roadway of the road (iii) in a demarcated parking area SELECT THE CORRECT COMBINATION', a: 'Only (i) and (iii) are correct', b: 'Only (ii) and (iii) are correct', c: 'All of the above are correct', ans: 'A' },
  { ref: '', q: 'The furthest distance that your vehicle\'s dim light may shine in front of you is...m', a: '100', b: '150', c: '45', ans: 'A' },
  { ref: '', q: 'When may you not overtake another vehicle? (i) Are nearing the top of hill (ii) Are nearing a curve (iii) Can only see 100m in front of you because of dust over the road SELECT THE CORRECT COMBINATION', a: '(i) and (ii) only are correct', b: '(i) only is correct', c: 'All of the above is correct', ans: 'C' },
  { ref: '', q: 'The licence disc of your vehicle is valid for...', a: '21 days', b: '90 days', c: '12 months', ans: 'C' },
  { ref: '', q: 'What is the longest period that a vehicle may be parked on one place on a public road outside urban areas', a: '48 hours', b: '7 days', c: '24 hours', ans: 'C' },
  { ref: '', q: 'Which rule is considered the most important RULE OF THE ROAD in South Africa', a: 'Keep to the left side of the road far as is safe', b: 'Do not exceed the speed limit', c: 'Always be courteous and considerate towards fellow road users', ans: 'A' },
  { ref: '', q: 'You may pass another vehicle on the left-hand side if it... (i) Indicates that it is going to turn right (ii) Drives on the right-hand side of a road with a shoulder were you can pass (iii) Drives in a town in the right hand lane with 2 lanes in the same direction SELECT THE CORRECT COMBINATION', a: 'All of the above are correct', b: '(i) and (iii) only are correct', c: '(i) only is correct', ans: 'B' },
  { ref: '', q: 'If you only have a learners licence for a light motor vehicle... (i) there must be someone with you in the vehicle with the same driving licence (ii) you are not allowed to drive on a freeway (iii) no passengers are allowed with you in the vehicle SELECT THE CORRECT COMBINATION', a: 'Only (i) is correct', b: 'All of the above are correct', c: 'Only (i) and (iii) are correct', ans: 'A' },
]

function csvEscape(val) {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function toRow(courseId, testNumber, q) {
  return [
    csvEscape(courseId),
    csvEscape(testNumber),
    csvEscape(q.q),
    csvEscape(q.a),
    csvEscape(q.b),
    csvEscape(q.c),
    csvEscape(q.ans),
    '', // image_url — fill in manually after uploading
    csvEscape(q.ref),
  ].join(',')
}

const header = 'course_id,test_number,question,option_a,option_b,option_c,correct_answer,image_url,image_ref'
const rows = questions.map(q => toRow(1, 1, q))
const csv = [header, ...rows].join('\r\n')

const outPath = join(__dirname, '..', 'code8-test1-questions.csv')
writeFileSync(outPath, csv, 'utf8')

console.log(`\n✓ CSV written to: ${outPath}`)
console.log(`  Total questions: ${questions.length}`)
console.log(`  Road sign questions:    ${questions.filter(q => q.ref.includes('.img')).length}`)
console.log(`  Controls questions:     ${questions.filter(q => q.ref === 'controls-diagram').length}`)
console.log(`  Rules of the road:      ${questions.filter(q => q.ref === '').length}`)
