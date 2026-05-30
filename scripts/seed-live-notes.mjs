// seed-live-notes.mjs — Seeds Live Notes: chapters, pages, quizzes, questions, options
// Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-live-notes.mjs
// Requires the 03_live_notes_schema.sql migration to have been run first.

const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!KEY) { console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

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
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'DELETE', headers: H,
  }).catch(() => {})
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  { chapter_number: null, title: 'Cover & Title Page', description: null, section_reference: null, page_start: 1, page_end: 2, is_front_matter: true, display_order: 0 },
  { chapter_number: 1,  title: 'Introduction to Road Traffic Signs',           description: 'Six sign groups, exceptions, temporary signs, sign interpretation system',                                          section_reference: 'Introduction',    page_start: 3,  page_end: 4,  is_front_matter: false, display_order: 1  },
  { chapter_number: 2,  title: 'Regulatory Signs — Control Signs',              description: 'Stop, Yield, 3/4-way stops, Stop/Go, No entry, One-way, Pedestrian priority, Yield to oncoming',                  section_reference: 'Section 3.1',     page_start: 5,  page_end: 6,  is_front_matter: false, display_order: 2  },
  { chapter_number: 3,  title: 'Regulatory Signs — Command Signs',              description: 'Minimum speed, mass, keep left/right, directions, vehicle-class signs, headlamps, roundabout',                     section_reference: 'Section 3.2',     page_start: 7,  page_end: 11, is_front_matter: false, display_order: 3  },
  { chapter_number: 4,  title: 'Regulatory Signs — Prohibition Signs',          description: 'Speed limit, mass/axle/height/length limits, no turn, no U-turn, no overtaking, no parking/stopping',             section_reference: 'Section 3.3',     page_start: 12, page_end: 16, is_front_matter: false, display_order: 4  },
  { chapter_number: 5,  title: 'Regulatory Signs — Reservation Signs',          description: 'Bus/taxi/disabled/diplomatic reservations, bus stops, Woonerf, freeway begins',                                    section_reference: 'Sections 3.4–3.5',page_start: 17, page_end: 20, is_front_matter: false, display_order: 5  },
  { chapter_number: 6,  title: 'Regulatory Signs — Restriction, Combination & De-restriction', description: 'Time periods, day/night, operator identity, pay-and-display, combination signs, R600 de-restriction', section_reference: 'Sections 3.6–3.8',page_start: 21, page_end: 23, is_front_matter: false, display_order: 6  },
  { chapter_number: 7,  title: 'Warning Signs — Road Layout',                   description: 'Crossroads, T-junctions, staggered junctions, sharp junctions, Y-junction, dual roadway begins/ends',             section_reference: 'Section 4.1',     page_start: 24, page_end: 25, is_front_matter: false, display_order: 7  },
  { chapter_number: 8,  title: 'Warning Signs — Direction of Movement',         description: 'Traffic circle ahead, curves, winding road, two-way traffic, lane ends, traffic signals ahead',                    section_reference: 'Section 4.2',     page_start: 26, page_end: 27, is_front_matter: false, display_order: 8  },
  { chapter_number: 9,  title: 'Warning Signs — Symbolic Signs (Part 1)',       description: 'Traffic control, scholar patrol, pedestrians, cyclists, animals, railway, tunnel, steep roads, gravel',            section_reference: 'Section 4.3',     page_start: 28, page_end: 30, is_front_matter: false, display_order: 9  },
  { chapter_number: 10, title: 'Warning Signs — Symbolic Signs (Part 2)',       description: 'Speed humps, slippery road, road works, collision, drift, crosswinds, congestion, temporary signs',                section_reference: 'Section 4.3 cont.',page_start: 31, page_end: 35,is_front_matter: false, display_order: 10 },
  { chapter_number: 11, title: 'Warning Signs — Combination Signs',             description: 'Permanent and temporary combination signs, limit-limit, action-limit, action-object examples',                     section_reference: 'Section 4.4',     page_start: 36, page_end: 38, is_front_matter: false, display_order: 11 },
  { chapter_number: 12, title: 'Guidance Signs — Route Markers',                description: 'Location signs, destination signs, tourist signs, trail blazers, route markers, bicycle route, direction signs',   section_reference: 'Sections 5–5.1',  page_start: 39, page_end: 42, is_front_matter: false, display_order: 12 },
  { chapter_number: 13, title: 'Guidance Signs — Freeway Direction Signs',      description: 'Pre-advance exit, advance exit, supplementary, exit direction, gore, terminal, confirmation, exit sequence',       section_reference: 'Section 5.2',     page_start: 43, page_end: 44, is_front_matter: false, display_order: 13 },
  { chapter_number: 14, title: 'Guidance Signs — Diagrammatic & Overhead',      description: 'Lane obstructions, additional lane, lane-use control, merge/converge, arrestor bed, overhead signs',               section_reference: 'Sections 5.3–5.4',page_start: 45, page_end: 46, is_front_matter: false, display_order: 14 },
  { chapter_number: 15, title: 'Information Signs',                              description: 'Count-down signs, cul-de-sac, right-of-way, park-and-ride, supplementary plates, co-ordinated signals',           section_reference: 'Chapter 6',       page_start: 47, page_end: 48, is_front_matter: false, display_order: 15 },
  { chapter_number: 16, title: 'Road Markings — Regulatory',                    description: 'Stop line, yield line, pedestrian crossing, no overtaking lines, parking bays, box junction, no stopping',         section_reference: 'Section 7.1',     page_start: 49, page_end: 52, is_front_matter: false, display_order: 16 },
  { chapter_number: 17, title: 'Road Markings — Warning & Guidance',            description: 'Traffic circle arrows, railway crossing, continuity lines, reversible lane, arrestor bed, guide lines',            section_reference: 'Sections 7.2–7.3',page_start: 53, page_end: 56, is_front_matter: false, display_order: 17 },
  { chapter_number: 18, title: 'Traffic Signals',                                description: 'All light signal sequences, overhead lane direction control, traffic officer and flag signals',                     section_reference: 'Chapter 8 & 8.1', page_start: 57, page_end: 58, is_front_matter: false, display_order: 18 },
]

// Chapter number → quiz questions
// Format: { text, a, b, c, d, correct:'A'|'B'|'C'|'D', exp, page }
const QUIZ_DATA = {
  1: [
    { text: 'Road traffic signs are divided into how many main groups?', a: 'Four', b: 'Five', c: 'Six', d: 'Seven', correct: 'C', exp: 'The manual identifies six groups: regulatory, warning, guidance, information, road markings, and traffic signals.', page: 3 },
    { text: 'What is the shape of regulatory signs (with exceptions)?', a: 'Triangular', b: 'Rectangular', c: 'Round', d: 'Diamond', correct: 'C', exp: 'Regulatory signs are generally round. Exceptions are the octagonal STOP sign, triangular YIELD sign, and diamond-shaped pedestrian priority signs.', page: 3 },
    { text: 'A sign with a yellow background means:', a: 'It is a warning sign', b: 'It is a freeway sign', c: 'It is a temporary sign', d: 'It is a guidance sign', correct: 'C', exp: 'Yellow background = temporary. Sign numbers prefixed with "T" (e.g., TR201) confirm this.', page: 4 },
    { text: 'Failure to obey a regulatory sign is:', a: 'A minor traffic offence', b: 'Only a fine', c: 'An offence punishable by a fine, imprisonment, or both', d: 'A warning, not an offence', correct: 'C', exp: 'The manual explicitly states regulatory signs must be obeyed and disobedience is punishable by a fine, imprisonment, or both.', page: 3 },
    { text: 'Temporary signs are typically used in all the following situations EXCEPT:', a: 'Road works and construction', b: 'Collision scenes', c: 'Routine freeway navigation', d: 'School grounds and scholar patrols', correct: 'C', exp: 'Temporary signs are used for road works, collision scenes, and scholar patrols — not for routine permanent freeway navigation.', page: 4 },
  ],
  2: [
    { text: 'At a 4-way stop, when may you move off?', a: 'Immediately after stopping', b: 'When the road looks clear', c: 'Only after all vehicles that stopped before you have moved off', d: 'After waiting 5 seconds', correct: 'C', exp: 'At 3-way or 4-way stops, you may not move off until all vehicles that stopped before you have moved off.', page: 5 },
    { text: 'What is the maximum speed in a Woonerf (pedestrian priority) area?', a: '10 km/h', b: '15 km/h', c: '30 km/h', d: '50 km/h', correct: 'B', exp: 'Sign R5 limits drivers in pedestrian priority areas to 15 km/h.', page: 6 },
    { text: 'At a Stop/Yield sign (R1.2), what action is required if turning left?', a: 'Stop completely', b: 'Yield to traffic close enough to pose a hazard', c: 'Sound your horn', d: 'Reduce to walking pace', correct: 'B', exp: 'R1.2 lets vehicles turn left without stopping if they can do so without interfering with cross traffic. They must still yield to close traffic.', page: 5 },
    { text: 'A Yield to pedestrians sign (R2.1) is found at:', a: 'Freeways only', b: 'Railway crossings', c: 'Intersections and pedestrian crossings', d: 'Toll plazas', correct: 'C', exp: 'R2.1 is placed at intersections and pedestrian crossings to give priority to pedestrians crossing or wanting to cross.', page: 6 },
    { text: 'At a mini traffic circle with sign R2.2, who proceeds first?', a: 'The largest vehicle', b: 'Vehicles from the right always', c: 'The driver who reaches the yield line first', d: 'Vehicles from the main road', correct: 'C', exp: 'At a mini-circle, the driver who reaches their yield line first may proceed first.', page: 6 },
    { text: 'A No Entry sign (R3) is usually found at:', a: 'The end of a one-way street or off-ramp', b: 'Freeway entrances', c: 'School zones', d: 'Hospital areas', correct: 'A', exp: 'R3 is typically at the end of a one-way street, end of an off-ramp, or where two-way roads change to one-way.', page: 6 },
  ],
  3: [
    { text: 'A minimum speed sign (R101) means:', a: 'Do not exceed the indicated speed', b: 'Do not drive slower than the indicated speed', c: 'Recommended cruising speed', d: 'Average speed for traffic flow', correct: 'B', exp: 'R101 sets a minimum — you must not drive slower than the km/h shown.', page: 7 },
    { text: 'Sign R133 instructs you to:', a: 'Switch off engine', b: 'Reduce speed', c: 'Switch on headlamps in dip position', d: 'Sound your horn', correct: 'C', exp: 'R133 — Switch headlamps on — found especially before tunnels. Use the dip (low-beam) position.', page: 11 },
    { text: 'At a roundabout sign (R137), you must:', a: 'Drive anti-clockwise', b: 'Stop before entering', c: 'Move clockwise and yield to traffic from the right inside the circle', d: 'Yield to the left', correct: 'C', exp: 'R137 requires clockwise movement and yielding to vehicles already in the circle approaching from your right.', page: 11 },
    { text: 'Sign R102 (Vehicles exceeding mass only) requires drivers of certain heavy vehicles to:', a: 'Use only the indicated portion of the road', b: 'Stop and weigh in', c: 'Reduce speed by 20 km/h', d: 'Use hazard lights', correct: 'A', exp: 'Heavy vehicles with GVM/GCM above the indicated mass must use only the part of the road indicated by the sign.', page: 7 },
    { text: 'The signs R105, R106, R107 indicate:', a: 'Stop, yield, give way', b: 'Speed limits', c: 'Proceed left only, right only, or straight only', d: 'Lane closures', correct: 'C', exp: 'These are mandatory direction signs — drive only in the direction shown by the arrow.', page: 7 },
    { text: 'A Keep Left sign (R103) is typically displayed at:', a: 'Obstructions such as traffic islands', b: 'Pedestrian crossings', c: 'School zones', d: 'Tunnel entrances', correct: 'A', exp: 'R103/R104 are displayed at obstructions like traffic islands to indicate which side to pass.', page: 7 },
    { text: 'Sign R132 (Pay toll) gives you:', a: 'A choice to refuse to pay', b: 'A reminder to slow down', c: 'A last opportunity to follow an alternative route', d: 'Permission to enter without paying during off-peak', correct: 'C', exp: 'R132 gives drivers a last chance to take an alternative route before committing to pay the toll.', page: 10 },
  ],
  4: [
    { text: 'A speed limit sign (R201) means:', a: 'Recommended speed for the road', b: 'Average speed of traffic', c: 'Maximum speed — do not exceed', d: 'Minimum speed', correct: 'C', exp: 'R201 sets the maximum lawful speed. The restriction applies from the sign onward.', page: 12 },
    { text: 'Sign R207 (Hitch-hiking prohibited) prohibits picking up passengers for what distance?', a: '100 metres', b: '250 metres', c: '500 metres', d: '1 kilometre', correct: 'C', exp: 'A driver may not pick up passengers for the next 500 m after passing R207.', page: 12 },
    { text: 'Sign R206 (Excessive noise prohibited) is typically found near:', a: 'Schools and playgrounds', b: 'Hospitals, churches, and homes for the aged', c: 'Industrial parks', d: 'Highways', correct: 'B', exp: 'R206 prohibits excessive noise near hospitals, churches, and homes for the aged. The hooter may not be used for 100 m after the sign.', page: 12 },
    { text: 'Sign R213 prohibits:', a: 'Left turns', b: 'U-turns', c: 'Right turns', d: 'Overtaking', correct: 'B', exp: 'R213 is the "U-turn prohibited" sign. You may not turn your vehicle around so it faces the opposite direction.', page: 13 },
    { text: 'Sign R214 (No overtaking) applies for what distance?', a: '100 m', b: '250 m', c: '500 m', d: 'Until the next intersection', correct: 'C', exp: 'R214/TR214 prohibits overtaking for the next 500 m.', page: 13 },
    { text: 'Sign R217 (No stopping) permits stopping for which reason?', a: 'To answer your phone', b: 'To buy food', c: 'To obey a traffic light, traffic officer, or avoid a collision', d: 'For a passenger to take a photo', correct: 'C', exp: 'No stopping permits stopping only for traffic signals, officer instructions, or to avoid a collision.', page: 13 },
    { text: 'If sign R204 indicates a height limit and your loaded vehicle exceeds it, you must:', a: 'Drive slowly under it', b: 'Sound your horn', c: 'Find an alternative route', d: 'Stop and remove some load', correct: 'C', exp: 'If your vehicle or load exceeds the indicated height, use an alternative route.', page: 12 },
    { text: 'Sign R211 (Left turn prohibited at this intersection) means you may:', a: 'Only turn right', b: 'Only proceed straight', c: 'Proceed straight or turn right', d: 'Make a U-turn instead', correct: 'C', exp: 'Where left turn is prohibited, you may proceed straight or turn right.', page: 13 },
  ],
  5: [
    { text: 'A bus lane reservation sign (R302) means:', a: 'No other class of vehicle may use that part of the road', b: 'Buses must use only that lane', c: 'Cars may use it during off-peak', d: 'Taxis may share it', correct: 'A', exp: 'R302 indicates the lane is reserved — no other vehicle class may use it.', page: 17 },
    { text: 'Sign R305-P indicates:', a: 'Free unlimited parking', b: 'Paid parking for vehicles under 3 500 kg with no time limit', c: 'Disabled parking only', d: 'Reserved for taxis', correct: 'B', exp: 'R305-P is a paid parking area for vehicles with GVM under 3 500 kg, no time limit, but a fee is required.', page: 17 },
    { text: 'A dual-carriageway freeway begins at sign:', a: 'R301', b: 'R201', c: 'R401', d: 'R403', correct: 'C', exp: 'R401 marks the start of a dual-carriageway freeway and the application of freeway rules.', page: 20 },
    { text: 'Sign R403 (Woonerf) prohibits vehicles with:', a: 'More than 4 wheels', b: 'Mass exceeding 3 500 kg or more than 10 seats (except local access)', c: 'Diesel engines', d: 'Trailers', correct: 'B', exp: 'Woonerf prohibits vehicles over 3 500 kg or with more than 10 seats, except for local access or delivery, and limits speed to 30 km/h.', page: 20 },
    { text: 'Sign R325 (Bus Stop Reservation) is for use by:', a: 'Any bus', b: 'Minibuses displaying an appropriate emblem or logo', c: 'School buses only', d: 'Tour buses only', correct: 'B', exp: 'R325 allows minibuses with the correct emblem/logo to take up and drop passengers.', page: 20 },
    { text: 'The "P" suffix in signs like R301-P, R309-P indicates:', a: 'Public access', b: 'A parking reservation', c: 'Police vehicles only', d: 'A priority sign', correct: 'B', exp: 'The "-P" suffix denotes a parking reservation variant of the reservation sign.', page: 17 },
  ],
  6: [
    { text: 'A "Pay and Display" sign (R523) requires you to:', a: 'Only pay if asked', b: 'Pay the parking fee and display the receipt in/on the vehicle', c: 'Display a parking disc', d: 'Park only during business hours', correct: 'B', exp: 'R523 requires payment of the parking fee and displaying the receipt on or within the vehicle.', page: 21 },
    { text: 'A de-restriction sign (R600) tells the driver:', a: 'A new restriction begins', b: 'The restriction shown is now cancelled', c: 'Reduce speed', d: 'End of freeway', correct: 'B', exp: 'R600 cancels the restriction whose symbol it carries (with a red cross), meaning the restriction no longer applies.', page: 23 },
    { text: 'Sign R510 (Reduced visibility) below a regulatory sign means:', a: 'The regulatory sign applies when visibility is reduced', b: 'Always switch on headlights', c: 'Stop until visibility improves', d: 'Reduce speed by half', correct: 'A', exp: 'R510 indicates the regulatory sign above it applies only during reduced visibility conditions.', page: 21 },
    { text: 'R511 means the regulatory sign above it applies:', a: 'At night only', b: 'During daytime only', c: 'During peak hours only', d: 'On weekends only', correct: 'B', exp: 'R511 = daytime. R512 = night-time.', page: 21 },
    { text: 'A combination like "R201-80+Camera" means:', a: 'Speed limit cancelled by camera', b: 'Camera recommended', c: 'Speed limit of 80 km/h with speed prosecution by camera', d: 'Optional 80 km/h limit', correct: 'C', exp: 'The notation combines the speed limit value with a camera enforcement indicator.', page: 23 },
    { text: 'The R600 family (R132-600, R202-600, R401-600 etc.) all share what function?', a: 'They cancel a previously imposed restriction', b: 'They warn of upcoming restrictions', c: 'They double the restriction', d: 'They apply only at night', correct: 'A', exp: 'The "-600" suffix denotes a de-restriction variant.', page: 23 },
  ],
  7: [
    { text: 'A priority crossroad sign (W102) means:', a: 'Stop at the intersection', b: 'Yield to all cross traffic', c: 'You have right of way at the intersection ahead', d: 'Traffic circle ahead', correct: 'C', exp: 'W102 warns you that you have right of way. The thicker leg of the cross indicates which road has priority.', page: 24 },
    { text: 'A staggered junction (W109/W110) warns that:', a: 'Two roads join your road from opposite sides within a short distance', b: 'The road forks into two', c: 'A bridge is ahead', d: 'A roundabout is ahead', correct: 'A', exp: 'Staggered junctions indicate two roads joining from opposite sides in quick succession.', page: 25 },
    { text: 'A Y-junction warning (W115) means:', a: 'Road ends ahead', b: 'The road forks into two roads', c: 'Two roads merge into one', d: 'U-turn allowed', correct: 'B', exp: 'W115 warns of a Y-shaped split — driver must decide which road to take.', page: 25 },
    { text: 'Sign W116 (End of dual roadway) means:', a: 'Freeway ends', b: 'The one-way roadway is ending and approaching vehicles will share your carriageway', c: 'Lane closure ahead', d: 'Speed limit reduction', correct: 'B', exp: 'W116/W117 warns that two-way traffic will resume — position your vehicle correctly and be ready to change lanes.', page: 25 },
    { text: 'A T-junction warning (W104) indicates you must:', a: 'Turn sharply left or right at the intersection', b: 'Stop completely', c: 'Proceed straight only', d: 'Yield to traffic from behind', correct: 'A', exp: 'W104 warns of a T-junction where you must turn left or right. Slow down and prepare to stop or take the corner safely.', page: 24 },
  ],
  8: [
    { text: 'At a traffic circle ahead sign (W201) without other markings, you must yield to:', a: 'Traffic from the left', b: 'Traffic approaching from the right (and vehicles already in the circle)', c: 'Pedestrians only', d: 'The largest vehicle', correct: 'B', exp: 'If no other indication is shown, yield to traffic approaching from the right. Vehicles already in the circle have right of way.', page: 26 },
    { text: 'A hairpin bend (W206/W207) warns of:', a: 'A gentle curve', b: 'A railway crossing', c: 'A very sharp, U-shaped curve', d: 'A speed hump', correct: 'C', exp: 'W206/W207 indicate a very sharp, U-shaped curve, typically in mountainous areas.', page: 26 },
    { text: 'A winding road sign (W208/W209) tells you:', a: 'The road ends soon', b: 'There is a series of curves ahead', c: 'Detour ahead', d: 'Lane reduction', correct: 'B', exp: 'W208/W209 warn of a series of curves — there may be many more curves after the first without further warning.', page: 26 },
    { text: 'A concealed driveway sign (W216/W217/W218) warns that:', a: 'Hidden driveways enter the road where vision is limited', b: 'A road dead-ends', c: 'Slow vehicles will enter', d: 'A toll plaza is ahead', correct: 'A', exp: 'These signs warn of one or more concealed driveways entering the road in a way that makes them hard to see.', page: 27 },
    { text: 'Sign W302 (Traffic control "STOP" ahead) prepares you for:', a: 'A traffic light', b: 'A stop sign that cannot be seen in time', c: 'A railway crossing', d: 'A scholar patrol', correct: 'B', exp: 'W302 warns of an approaching STOP sign that may not be visible in time.', page: 27 },
    { text: 'Sign W212 (Two-way traffic) appears where:', a: 'A one-way road becomes a two-way road', b: 'Two roads cross', c: 'A road forks', d: 'A bridge begins', correct: 'A', exp: 'W212 warns drivers leaving a one-way roadway that two-way traffic is ahead — extra caution when overtaking.', page: 27 },
  ],
  9: [
    { text: 'Sign W306 (Pedestrian crossing) — you may NOT:', a: 'Yield to pedestrians', b: 'Stop for pedestrians', c: 'Overtake other vehicles stopped at the crossing', d: 'Use your indicators', correct: 'C', exp: 'You must not overtake other vehicles that have stopped at the pedestrian crossing.', page: 28 },
    { text: 'Sign W307 (Pedestrians) warns that pedestrians may be crossing for the next:', a: '500 m', b: '1 km', c: '2 km', d: '5 km', correct: 'C', exp: 'W307 warns of high pedestrian activity for the next 2 km.', page: 28 },
    { text: 'At a railway crossing with no stop line, you must stop no closer than:', a: '1 m from the tracks', b: '2 m from the tracks', c: '3 m from the nearest track', d: 'Right at the boom', correct: 'C', exp: 'If stopping is necessary and there is no stop line, stop no closer than 3 m from the nearest track. Never stop on the track or in the railway reserve.', page: 29 },
    { text: 'Sign W319 (Tunnel) requires you to:', a: 'Sound your horn', b: 'Switch to high beam', c: 'Switch on headlights in the dim position', d: 'Stop before entering', correct: 'C', exp: 'W319 warns of a tunnel — switch on headlights in dim (dip) position.', page: 29 },
    { text: 'Sign W314 (Gate) warns that:', a: 'There is a gate or boom across the road ahead', b: 'A railway depot is ahead', c: 'Toll booth ahead', d: 'Border crossing ahead', correct: 'A', exp: 'W314 warns of a gate or boom — slow down and be prepared to stop.', page: 29 },
    { text: 'A steep descend sign (W323) reminds you to:', a: 'Increase speed to clear the descent', b: 'Allow for a longer stopping distance, especially when heavily laden', c: 'Engage neutral', d: 'Use full brake pressure', correct: 'B', exp: 'Allow longer stopping distance on descents, particularly with heavy loads and in mountainous areas.', page: 29 },
    { text: 'Sign TW304 (Traffic control ahead) indicates:', a: 'A broken traffic light', b: 'A scholar patrol', c: 'A traffic officer ahead controlling traffic', d: 'Roadworks ahead', correct: 'C', exp: 'TW304 indicates a traffic officer is regulating traffic ahead. Be ready to stop on the officer\'s instruction.', page: 28 },
  ],
  10: [
    { text: 'Sign W333 (Slippery road) warns of slippery conditions for the next:', a: '500 m', b: '1 km', c: '2 km', d: 'Until the next sign', correct: 'C', exp: 'Slow down for the next 2 km — sudden braking or harsh steering can cause skidding.', page: 31 },
    { text: 'At a one-vehicle width structure (W327), you must:', a: 'Sound your horn before entering', b: 'Stop at least 6 m from the structure if there is oncoming traffic and yield', c: 'Speed up to clear quickly', d: 'Drive on the right', correct: 'B', exp: 'Slow down, stop at least 6 m from the structure if oncoming traffic exists, and yield.', page: 30 },
    { text: 'Sign W350 (Drift) warns that:', a: 'Strong winds are ahead', b: 'There is a drift ahead and the road could be flooded', c: 'Sand on the road', d: 'Loose stones', correct: 'B', exp: 'A drift means a water crossing — slow down, stop if the depth is unknown, and only proceed if passable.', page: 33 },
    { text: 'Sign W349 (Crosswinds) requires you to:', a: 'Stop and wait', b: 'Adjust steering in time, as shielding from trucks or bridges affects the vehicle', c: 'Sound your horn', d: 'Drive faster through the section', correct: 'B', exp: 'Crosswinds require steering adjustments — watch for wind shielding and buffeting near trucks.', page: 33 },
    { text: 'Sign TW347 (Temporary police flashing light) means:', a: 'Be ready to stop at the stop sign that follows or on demand of a police officer', b: 'Slow down only', c: 'Switch on headlights', d: 'Sound your horn', correct: 'A', exp: 'TW347 warns of a temporary stop, collision scene, or roadblock with police on duty.', page: 32 },
    { text: 'At an emergency flashing light (W346), you should:', a: 'Increase speed past it', b: 'Slow down and look out for further signs indicating the hazard', c: 'Stop immediately', d: 'Ignore — it is decorative', correct: 'B', exp: 'W346 warns of a hazard ahead — slow down and watch for further signs.', page: 32 },
    { text: 'Sign TW353 (Collision) instructs drivers to:', a: 'Stop and assist always', b: 'Stop out of curiosity to help', c: 'Not stop out of curiosity if professional help is on scene, and concentrate on the route', d: 'Photograph the scene', correct: 'C', exp: 'Slow down, look for someone controlling traffic, be ready to stop, but do not stop out of curiosity if enough professional help is present.', page: 33 },
    { text: 'Sign W354 (Reduced visibility) warns of:', a: 'A tunnel ahead', b: 'Fog or smoke on the road ahead', c: 'Direct sunlight', d: 'Rainstorms', correct: 'B', exp: 'W354 warns of reduced visibility — look out for slow-moving vehicles and reduce speed.', page: 33 },
  ],
  11: [
    { text: 'The notation "W332-RB" indicates a:', a: 'Speed hump on a regular background', b: 'Speed humps sign plus text message on a high-visibility background', c: 'Speed hump removed', d: 'Repaired road surface', correct: 'B', exp: 'The "-RB" suffix indicates a high-visibility background variant with a text message.', page: 36 },
    { text: 'The "TIN11.2" supplementary indicates:', a: 'A daytime limit', b: 'For a distance', c: 'A speed camera', d: 'Night time', correct: 'B', exp: 'IN11.2 / TIN11.2 indicates "for a distance" on combination signs.', page: 36 },
    { text: '"R201-RC+W354-WC+IN11.2" means:', a: 'Speed limit on a high-visibility background plus reduced visibility for a distance', b: 'Roadworks with police enforcement', c: 'End of speed limit zone', d: 'Emergency vehicles only', correct: 'A', exp: '"RC" and "WC" denote high-visibility backgrounds; "IN11.2" denotes a distance qualifier.', page: 36 },
    { text: '"R210-301" is an example of an action-object sign meaning:', a: 'Right turn allowed for delivery vehicles only', b: 'Buses must turn right', c: 'No right turn ahead — applies to buses', d: 'Right turn lane begins', correct: 'C', exp: 'R210 = no right turn ahead; -301 = buses (object).', page: 38 },
    { text: 'The suffix "-501" on signs like "R122-501" indicates:', a: 'A limited time period', b: 'A maximum number of vehicles', c: 'A speed-camera variant', d: 'A regional sign', correct: 'A', exp: '"-501" denotes a limited time period (one-time period). "-502" denotes two-time periods.', page: 38 },
  ],
  12: [
    { text: 'A blue freeway name sign begins with the code:', a: 'GDS', b: 'GFS', c: 'GLS', d: 'GE', correct: 'C', exp: 'GLS-4/GLS-5 are dual/single freeway name signs.', page: 39 },
    { text: 'A confirmation route marker (GE12–GE15) tells you:', a: 'Where the next intersection is', b: 'The number and status of the route you are on', c: 'The toll fee', d: 'The speed limit on this route', correct: 'B', exp: 'Confirmation route markers confirm route number and status (metropolitan/regional/provincial/national).', page: 41 },
    { text: 'A bicycle route marker (GE17) tells motorists to:', a: 'Use the lane during off-peak', b: 'Not use the route and watch for cyclists changing direction', c: 'Sound their horn', d: 'Yield to cyclists when overtaking', correct: 'B', exp: 'Motorists must not use cycle routes and should look out for cyclists who could suddenly change direction.', page: 42 },
    { text: 'A stack-type advance direction sign (GD1) is placed:', a: 'On the left-hand side before an intersection', b: 'After the intersection', c: 'Above the road only', d: 'At toll plazas', correct: 'A', exp: 'GD1 is on the left before an intersection, showing route numbers and destinations.', page: 42 },
    { text: 'A "Fingerboard" sign (GD4) guides drivers to:', a: 'Major freeways', b: 'Toll plazas', c: 'Small locations or destinations on less-travelled routes', d: 'Police stations only', correct: 'C', exp: 'GD4 is for small destinations or less-travelled routes.', page: 42 },
    { text: 'An alternative route marker (GE16) is found at:', a: 'The intersection of toll and alternative routes', b: 'Roadworks only', c: 'Border posts', d: 'Pedestrian crossings', correct: 'A', exp: 'GE16 indicates an alternative route to a toll route — usually a lower-standard road.', page: 41 },
  ],
  13: [
    { text: 'A pre-advance exit direction sign (GA1) is placed approximately how far before the off-ramp?', a: '500 m', b: '1 km', c: '2 km', d: '5 km', correct: 'C', exp: 'GA1 is placed about 2 km before an off-ramp exit.', page: 43 },
    { text: 'An advance exit direction sign (GA2) is placed approximately:', a: '2 km before', b: '1 km before', c: '500 m before', d: 'At the off-ramp', correct: 'B', exp: 'GA2 is placed about 1 km before an off-ramp.', page: 43 },
    { text: 'A confirmation sign (GA7) after entering a freeway is placed first at:', a: 'About 750 m after entering, then every 5 to 10 km', b: 'Every kilometre', c: 'Only at toll plazas', d: 'At each off-ramp', correct: 'A', exp: 'GA7 confirms destinations 750 m after entering and then every 5–10 km.', page: 44 },
    { text: 'A gore exit sign (GA4) is found:', a: 'Above the freeway', b: 'Between the right side of the off-ramp and the continuing freeway', c: 'On the median', d: 'After the toll plaza', correct: 'B', exp: 'GA4 marks the separation point between the off-ramp and the main road.', page: 43 },
    { text: 'An exit sequence sign (GA8) warns you of:', a: 'Multiple exits close together leading to the same town', b: 'The end of the freeway', c: 'A toll plaza ahead', d: 'Construction', correct: 'A', exp: 'GA8 indicates a series of closely-spaced exits all leading to the same town.', page: 44 },
  ],
  14: [
    { text: 'At an arrestor bed (GS501–504), drivers should:', a: 'Park here in an emergency', b: 'Use it as a rest stop', c: 'Drive straight into it only if their brakes fail', d: 'Avoid at all costs', correct: 'C', exp: 'Arrestor beds are for vehicles whose brakes have failed — drive straight in only in that case.', page: 45 },
    { text: 'An "Engage lower gear" sign (GS505) is found:', a: 'On freeways only', b: 'On steep descents', c: 'At toll plazas', d: 'On gravel roads', correct: 'B', exp: 'GS505 warns of a steep descent — heavy vehicles must engage a lower gear to protect brakes.', page: 45 },
    { text: 'A diagrammatic "lane-use control by regulation" sign indicates:', a: 'The right-hand lane is subject to a command/prohibition regulatory sign', b: 'The left lane is closed', c: 'Overtaking is allowed', d: 'Speed limit increase', correct: 'A', exp: 'These signs diagrammatically show that a specific lane has a compulsory regulation.', page: 45 },
    { text: 'The general action for all diagrammatic signs is:', a: 'Ensure a safe gap and yield to other merging traffic', b: 'Stop immediately', c: 'Use hazard lights', d: 'Sound the horn', correct: 'A', exp: 'When lanes end, converge, merge, or are added, ensure a safe gap and yield to other traffic.', page: 45 },
    { text: 'An overhead arrestor bed exit sign (GS601/GS602) tells you to:', a: 'Not turn into that road unless your destination is there (or brakes have failed)', b: 'Always turn in for safety', c: 'Use it as a viewing point', d: 'Park there briefly', correct: 'A', exp: 'Do not use the arrestor bed exit unless required — it is for emergencies only.', page: 46 },
  ],
  15: [
    { text: 'Count-down signs (IN1, IN2, IN3) indicate that an exit is:', a: '100 m, 200 m, 300 m ahead', b: '300 m, 200 m, 100 m ahead', c: '1 km, 500 m, 200 m ahead', d: 'Closed', correct: 'B', exp: 'IN3, IN2, IN1 indicate distances of 300 m, 200 m, and 100 m to the exit respectively.', page: 47 },
    { text: 'A right-of-way sign (IN7) means:', a: 'Stop and yield', b: 'Reduce speed', c: 'You have right of way at the intersection ahead', d: 'Turn right only', correct: 'C', exp: 'IN7 informs you that you have right of way — proceed without unnecessary slowing, but ensure others yield.', page: 47 },
    { text: 'A park-and-ride sign (IN9/IN10) indicates a parking area with:', a: 'A bus or train service for onward travel', b: 'Free overnight parking', c: 'A taxi rank', d: 'A police station nearby', correct: 'A', exp: 'IN9 = bus park-and-ride; IN10 = train park-and-ride.', page: 47 },
    { text: 'Co-ordinated traffic signals (IN14) tell drivers:', a: 'Traffic lights are broken', b: 'Maintaining the indicated speed will catch green at subsequent intersections', c: 'The road is closed', d: 'Use bus lanes', correct: 'B', exp: 'IN14 indicates a "green wave" — the displayed speed is a recommendation, not a limit.', page: 48 },
    { text: 'Sign IN15 (Multi-phase signals) warns that:', a: 'The lights are broken', b: 'The signal sequence does not follow the normal pattern', c: 'Pedestrians have priority', d: 'Only buses may proceed', correct: 'B', exp: 'At multi-phase intersections, your signal may stay red while the opposite direction turns green. Wait for your green.', page: 48 },
    { text: 'Sign IN16 (Bus stop ahead) tells you to:', a: 'Take a bus', b: 'Stop and wait', c: 'Watch for buses slowing and pedestrians when overtaking', d: 'Yield to bus passengers crossing', correct: 'C', exp: 'IN16 alerts drivers that buses may slow and stop ahead; watch for pedestrians during overtaking.', page: 48 },
  ],
  16: [
    { text: 'A no-overtaking line (RM1) may be crossed only to:', a: 'Gain access to a driveway or pass a stationary obstruction, safely', b: 'Overtake slower vehicles', c: 'Reach a turning lane', d: 'Make a U-turn', correct: 'A', exp: 'RM1 may be crossed only to gain access to/from a driveway or pass a stationary obstruction — and only when safe.', page: 49 },
    { text: 'A no-crossing line (RM2) may be crossed:', a: 'When safe to overtake', b: 'During reduced visibility', c: 'Only to drive around a stationary vehicle or obstruction', d: 'Never under any circumstances', correct: 'C', exp: 'RM2 may not be crossed under any circumstances except to go around a stationary obstruction.', page: 49 },
    { text: 'The "MB" code on an exclusive parking bay (RM7) reserves the bay for:', a: 'Mountain Bikes', b: 'Mobile Police', c: 'Minibuses', d: 'Medical Personnel', correct: 'C', exp: 'On RM7: MB = Minibus.', page: 51 },
    { text: 'At a box junction (RM10), you must:', a: 'Stop inside the yellow box', b: 'Not stop inside the box and only enter if you can exit', c: 'Yield to traffic from the left', d: 'Accelerate to clear', correct: 'B', exp: 'Do not stop in the box; only enter the intersection if your exit is clear.', page: 52 },
    { text: 'The "SOS" exclusive parking bay code stands for:', a: 'Stop or Stationary', b: 'Service or Support', c: 'SOS telephone (emergency only)', d: 'Standard Operating Stop', correct: 'C', exp: 'SOS = SOS telephone. You may stop at the SOS sign only in an emergency.', page: 51 },
    { text: 'A right-edge line marking (RM4.2) is usually found on:', a: 'Gravel roads only', b: 'One-way roads such as dual carriageways or freeways', c: 'School zones', d: 'Single-lane country roads', correct: 'B', exp: 'The right-edge line is found on one-way roads such as dual carriageways and freeways — it may not be crossed.', page: 50 },
    { text: 'When parking at an angle, the front of your vehicle should be no further than how far from the kerb?', a: '50 mm', b: '100 mm', c: '150 mm', d: '300 mm', correct: 'C', exp: 'In angle parking, the front of the vehicle must be no further than 150 mm from the kerb, and no part of the vehicle on the sidewalk.', page: 50 },
    { text: 'A no-stopping line (RM12) — when broken — means:', a: 'You may never stop', b: 'Stopping is always allowed', c: 'You may not stop during the times indicated by a road traffic sign', d: 'Only buses may stop', correct: 'C', exp: 'A broken RM12 indicates time-restricted no-stopping; obey the times on the accompanying sign.', page: 52 },
  ],
  17: [
    { text: 'Traffic circle mandatory directional arrows (RM15) require you to:', a: 'Drive anti-clockwise', b: 'Drive clockwise only and yield to traffic from the right', c: 'Stop before entering', d: 'Choose any direction', correct: 'B', exp: 'RM15 mandates clockwise travel. Yield to traffic from the right; at mini-circles, yield to whoever reaches their yield line first.', page: 53 },
    { text: 'Continuity lines (WM2) warn that:', a: 'The lane you are in will soon turn off from the road you are travelling on', b: 'The road is ending', c: 'A pedestrian crossing is ahead', d: 'A traffic light is ahead', correct: 'A', exp: 'WM2 warns of a break in the continuing road — your lane may exit. Yield to traffic wanting to change lanes.', page: 53 },
    { text: 'Reversible lane lines (WM4) warn you that:', a: 'The lane can carry traffic from the opposite direction at different times', b: 'The lane is closed', c: 'Buses may share the lane', d: 'Speed limit changes here', correct: 'A', exp: 'WM4 indicates a reversible lane — traffic direction changes by time of day.', page: 53 },
    { text: 'An arrestor bed ahead marking (WM9) is used by:', a: 'All vehicles in emergencies', b: 'Drivers of heavy vehicles whose brakes have failed', c: 'Police vehicles only', d: 'Tour buses', correct: 'B', exp: 'Only drive into an arrestor bed when your brakes fail.', page: 54 },
    { text: 'Lane reduction arrows (WM6.1, WM6.2, WM6.3) warn you to:', a: 'Change lanes in time, checking blind spots at both sides', b: 'Increase speed', c: 'Stop in your lane', d: 'Sound your horn', correct: 'A', exp: 'WM6 warns that lanes are reducing from the left, right, or both sides. Change lanes in time and check blind spots.', page: 54 },
    { text: 'Bifurcation arrows (GM3) indicate:', a: 'A lane closure ahead', b: 'An increase in the number of lanes ahead', c: 'A toll plaza', d: 'A bridge', correct: 'B', exp: 'GM3 marks an increase in lanes ahead. Do not straddle markings.', page: 55 },
    { text: 'Guide lines (GM2) are found:', a: 'At freeway exits only', b: 'Inside intersections to guide your turning path', c: 'On gravel roads', d: 'At parking bays', correct: 'B', exp: 'GM2 guides drivers to follow the correct route through an intersection — turn according to the markings.', page: 55 },
    { text: 'Word markings (GM7) require drivers to:', a: 'Read the message and concentrate on the indicated danger', b: 'Stop immediately', c: 'Ignore them if seen briefly', d: 'Report them to authorities', correct: 'A', exp: 'GM7 supplies additional information — read the message and act on the indicated hazard.', page: 56 },
  ],
  18: [
    { text: 'A flashing red traffic light means:', a: 'The light is broken — proceed at speed', b: 'Stop and may carry on when safe (treat as a stop sign)', c: 'Reduce speed and proceed', d: 'Only emergency vehicles may proceed', correct: 'B', exp: 'A flashing red signal must be treated as a stop sign — stop, then proceed when safe.', page: 57 },
    { text: 'A constant amber arrow at a traffic signal means:', a: 'Yield then proceed', b: 'Stop and wait until the flashing green arrow shows you may go', c: 'Proceed in any direction', d: 'Turn right only', correct: 'B', exp: 'A constant amber arrow requires stopping and waiting for the flashing green arrow.', page: 57 },
    { text: 'A flashing amber disc means:', a: 'Stop immediately', b: 'Light is broken', c: 'Drive on carefully but yield to pedestrians (who may cross)', d: 'Turn left only', correct: 'C', exp: 'A flashing amber disc permits cautious proceeding while yielding to pedestrians.', page: 57 },
    { text: 'At a railway crossing, a flashing red light indicates:', a: 'A train is coming — do not drive on until the light stops flashing', b: 'The track is closed permanently', c: 'Slow down only', d: 'Emergency stop only', correct: 'A', exp: 'A flashing red light at a railway crossing means a train is approaching — wait until it stops flashing.', page: 57 },
    { text: 'Overhead steady red cross (S17) indicates:', a: 'The lane is for emergency vehicles only', b: 'Do not drive in the lane (it may be open to opposite-direction traffic)', c: 'Stop in the lane', d: 'Yield to overhead traffic', correct: 'B', exp: 'S17 = lane closed; may be used by opposing traffic.', page: 57 },
    { text: 'An overhead yellow arrow left (S18) or right (S19) means:', a: 'Turn in that direction at the next intersection', b: 'Yield to traffic in the arrow direction', c: 'The lane is closed ahead — leave the lane in the direction of the arrow', d: 'Speed limit increase', correct: 'C', exp: 'S18/S19 indicate a lane is closing ahead; the driver must change lanes in the arrow direction.', page: 57 },
    { text: 'Traffic officer hand signals (SS1) take precedence over:', a: 'Road markings only', b: 'Stop signs only', c: 'Any other traffic signal, including traffic lights', d: 'Nothing — they are advisory', correct: 'C', exp: 'The traffic officer\'s signals override every other traffic signal.', page: 58 },
    { text: 'Flag signals (SS2) are used by:', a: 'Workers at roadworks or herders leading animals across or next to the road', b: 'Tow truck drivers', c: 'Police officers only', d: 'Pedestrians at zebra crossings', correct: 'A', exp: 'SS2 flag signals are used at roadworks, by herdsmen, or in similar temporary situations.', page: 58 },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const labelToOpts = (q) => ['A','B','C','D'].map((lbl, i) => ({
  option_label: lbl,
  option_text: q[lbl.toLowerCase()],
  is_correct: q.correct === lbl,
}))

// ─── SEED ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding Live Notes data...\n')

  // 1. Clear existing data (cascade from chapters clears everything except attempts/progress)
  console.log('  Clearing existing data...')
  await del('ln_quiz_attempts',         'id=not.is.null')
  await del('ln_user_chapter_progress', 'id=not.is.null')
  await del('ln_chapters',              'manual_slug=eq.k53-road-signs-2012')

  // 2. Insert chapters
  console.log('  Inserting 19 chapters...')
  const chapters = await post('ln_chapters', CHAPTERS.map(c => ({
    manual_slug: 'k53-road-signs-2012',
    ...c,
    pass_threshold: 70,
  })))
  console.log(`  ✓ ${chapters.length} chapters inserted`)

  // Build lookup: chapter_number → chapter_id (null → front-matter id)
  const chapterMap = {}
  for (const ch of chapters) {
    chapterMap[ch.chapter_number ?? 'fm'] = ch.id
  }

  // 3. Insert pages (58 pages)
  console.log('  Inserting 58 pages...')
  const pageRows = []
  for (const ch of chapters) {
    for (let n = ch.page_start; n <= ch.page_end; n++) {
      pageRows.push({
        chapter_id:   ch.id,
        page_number:  n,
        storage_path: `Live Notes/${n}.jpg`,
        alt_text:     ch.is_front_matter
          ? `K53 Road Signs Manual — page ${n}`
          : `Chapter ${ch.chapter_number}: ${ch.title} — page ${n}`,
      })
    }
  }
  await post('ln_pages', pageRows)
  console.log(`  ✓ ${pageRows.length} pages inserted`)

  // 4. Insert quizzes (18 study chapters only)
  console.log('  Inserting 18 quizzes...')
  const studyChapters = chapters.filter(c => !c.is_front_matter)
  const quizRows = studyChapters.map(c => ({
    chapter_id:   c.id,
    title:        `Chapter ${c.chapter_number} Quiz — ${c.title}`,
    instructions: 'Choose the best answer for each question. You can review your answers at the end.',
    time_limit_seconds: null,
  }))
  const quizzes = await post('ln_quizzes', quizRows)
  console.log(`  ✓ ${quizzes.length} quizzes inserted`)

  // Build quiz lookup: chapter_id → quiz_id
  const quizMap = {}
  for (const qz of quizzes) quizMap[qz.chapter_id] = qz.id

  // 5. Insert questions + options chapter by chapter
  let totalQ = 0, totalOpt = 0
  for (const ch of studyChapters) {
    const qData = QUIZ_DATA[ch.chapter_number]
    if (!qData) { console.warn(`  ⚠ No quiz data for chapter ${ch.chapter_number}`); continue }

    const quizId = quizMap[ch.id]

    const questionRows = qData.map((q, i) => ({
      quiz_id:         quizId,
      question_number: i + 1,
      question_text:   q.text,
      question_type:   'single_choice',
      explanation:     q.exp,
      source_page:     q.page,
      difficulty:      'medium',
    }))

    const inserted = await post('ln_questions', questionRows)
    totalQ += inserted.length

    // Build options for all questions in this chapter
    const optionRows = []
    for (let i = 0; i < inserted.length; i++) {
      const qId = inserted[i].id
      for (const opt of labelToOpts(qData[i])) {
        optionRows.push({ question_id: qId, ...opt })
      }
    }
    await post('ln_question_options', optionRows)
    totalOpt += optionRows.length

    process.stdout.write(`  ✓ Chapter ${ch.chapter_number}: ${inserted.length} questions, ${optionRows.length} options\n`)
  }

  console.log(`\n✅ Seeding complete!`)
  console.log(`   Chapters : 19 (1 front-matter + 18 study)`)
  console.log(`   Pages    : ${pageRows.length}`)
  console.log(`   Quizzes  : ${quizzes.length}`)
  console.log(`   Questions: ${totalQ}`)
  console.log(`   Options  : ${totalOpt}`)
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1) })
