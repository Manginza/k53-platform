// seed-live-notes-k53-questions.mjs
// Replaces Live Notes quiz questions with K53 exam-grade questions (3 options A/B/C).
// Keeps chapters, pages and quizzes intact — only replaces questions + options.
// Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-live-notes-k53-questions.mjs

const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) { console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const H = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` }

const get  = async (path) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: H })
  if (!r.ok) throw new Error(`GET ${path}: ${r.status} ${await r.text()}`)
  return r.json()
}
const post = async (table, body) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`POST ${table}: ${r.status} ${await r.text()}`)
  return r.json()
}
const del  = async (table, filter) => {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, { method: 'DELETE', headers: H })
}

// ─── K53 EXAM-GRADE QUESTIONS ────────────────────────────────────────────────
// Format: { text, a, b, c, correct: 'A'|'B'|'C', exp, page, diff }
// 3 options (A/B/C) to match the actual K53 learner's licence exam format.

const Q = {
  1: [ // Introduction to Road Traffic Signs — pages 3–4
    { text: 'Road traffic signs in South Africa are divided into how many main groups?',
      a:'Four', b:'Five', c:'Six', correct:'C',
      exp:'The six groups are: regulatory, warning, guidance, information, road markings and traffic signals.', page:3 },
    { text: 'What shape is a STOP sign?',
      a:'Round', b:'Triangular', c:'Octagonal', correct:'C',
      exp:'The STOP sign is octagonal (8-sided) — an exception to the general round shape of regulatory signs.', page:3 },
    { text: 'A sign with a yellow background indicates:',
      a:'A warning sign', b:'A temporary sign', c:'A guidance sign', correct:'B',
      exp:'Yellow backgrounds mean temporary. Sign numbers carry a "T" prefix — e.g. TR201.', page:4 },
    { text: 'If you disobey a regulatory sign you may be:',
      a:'Given a verbal warning only', b:'Fined but not imprisoned', c:'Fined, imprisoned, or both', correct:'C',
      exp:'The manual states disobedience of regulatory signs is punishable by a fine, imprisonment, or both.', page:3 },
    { text: 'A YIELD sign (R2) is which shape?',
      a:'Round', b:'Octagonal', c:'Triangular pointing downward', correct:'C',
      exp:'The YIELD sign is an inverted triangle — another exception to the round regulatory-sign rule.', page:3 },
    { text: 'Temporary signs are used in all of the following situations EXCEPT:',
      a:'Road works and construction zones', b:'Collision scenes', c:'Permanent freeway navigation', correct:'C',
      exp:'Temporary signs cover road works, collisions and scholar patrols — not permanent freeway routing.', page:4 },
  ],

  2: [ // Control Signs — pages 5–6
    { text: 'At a 4-way STOP, when may you move off?',
      a:'As soon as you have come to a complete stop', b:'When the road ahead looks clear', c:'Only after every vehicle that stopped before you has moved off', correct:'C',
      exp:'At 3- or 4-way stops you may not move off until all vehicles that stopped before you have done so.', page:5 },
    { text: 'What is the maximum speed in a Woonerf (pedestrian priority area)?',
      a:'10 km/h', b:'15 km/h', c:'30 km/h', correct:'B',
      exp:'Sign R5 limits speed in a Woonerf to 15 km/h.', page:6 },
    { text: 'When turning left at a Stop/Yield sign (R1.2), you must:',
      a:'Come to a complete stop before turning', b:'Yield to any traffic that poses a hazard', c:'Sound your hooter before entering', correct:'B',
      exp:'R1.2 allows a left turn without stopping if it can be done without interfering with cross traffic — but you must still yield to close traffic.', page:5 },
    { text: 'A No Entry sign (R3) is typically placed at:',
      a:'The entrance to a one-way road', b:'The end of a one-way street or off-ramp', c:'Pedestrian crossings', correct:'B',
      exp:'R3 is placed at the end of a one-way street, end of an off-ramp, or where two-way roads become one-way.', page:6 },
    { text: 'At a mini traffic circle (R2.2), who may proceed first?',
      a:'The largest vehicle', b:'Vehicles approaching from the right', c:'The driver who reaches the yield line first', correct:'C',
      exp:'At a mini-circle the driver who reaches their yield line first may proceed first.', page:6 },
    { text: 'The R2.1 (Yield to pedestrians) sign is placed at:',
      a:'Freeways', b:'Railway crossings', c:'Intersections and pedestrian crossings', correct:'C',
      exp:'R2.1 is placed where pedestrians crossing or wanting to cross must be given priority.', page:6 },
  ],

  3: [ // Command Signs — pages 7–11
    { text: 'Sign R101 shows a number with an upward arrow. This means you must not drive:',
      a:'Faster than the number shown', b:'Slower than the number shown', c:'At exactly that speed', correct:'B',
      exp:'R101 is a minimum speed sign — you must not drive slower than the km/h shown.', page:7 },
    { text: 'You approach sign R133. What must you do?',
      a:'Stop and wait', b:'Reduce your speed', c:'Switch on your headlamps in the dip position', correct:'C',
      exp:'R133 requires headlamps to be on in dip (low-beam) position — found especially before tunnels.', page:11 },
    { text: 'At a roundabout (R137) you must travel:',
      a:'Anti-clockwise, yielding to vehicles on your left', b:'Clockwise, yielding to traffic from your right', c:'In any direction, giving way to larger vehicles', correct:'B',
      exp:'R137 requires clockwise movement and yielding to vehicles already in the circle approaching from your right.', page:11 },
    { text: 'Signs R105, R106 and R107 are mandatory direction signs. When you pass one you must:',
      a:'Slow down and proceed cautiously', b:'Drive only in the direction shown', c:'Give way to oncoming traffic', correct:'B',
      exp:'These command signs require you to drive only in the direction of the arrow shown.', page:7 },
    { text: 'A Keep Left sign (R103) is typically displayed at:',
      a:'Pedestrian crossings', b:'School zones', c:'Obstructions such as traffic islands', correct:'C',
      exp:'R103/R104 are placed at obstructions like traffic islands to indicate which side to pass.', page:7 },
    { text: 'Sign R132 (Pay Toll) gives drivers a last opportunity to:',
      a:'Exceed the speed limit briefly', b:'Take an alternative route before the toll', c:'Make a U-turn', correct:'B',
      exp:'R132 is a last chance to take an alternative route before committing to pay the toll.', page:10 },
    { text: 'According to sign R102, a heavy vehicle exceeding the indicated mass must:',
      a:'Stop and obtain permission to proceed', b:'Reduce speed by 20 km/h', c:'Use only the portion of the road indicated by the sign', correct:'C',
      exp:'Heavy vehicles with GVM/GCM above the indicated mass must use only the road portion shown by R102.', page:7 },
  ],

  4: [ // Prohibition Signs — pages 12–16
    { text: 'Sign R201 (speed limit) means you may:',
      a:'Drive at exactly that speed at all times', b:'Not exceed that speed', c:'Drive faster if the road is clear', correct:'B',
      exp:'R201 sets the maximum lawful speed — do not exceed it from the sign onward.', page:12 },
    { text: 'After passing sign R207 (hitch-hiking prohibited) you may not pick up passengers for:',
      a:'100 m', b:'250 m', c:'500 m', correct:'C',
      exp:'R207 prohibits picking up passengers for the next 500 m.', page:12 },
    { text: 'Sign R213 prohibits:',
      a:'Left turns', b:'Right turns', c:'U-turns', correct:'C',
      exp:'R213 — U-turn prohibited. You may not turn your vehicle around to face the opposite direction.', page:13 },
    { text: 'Sign R214 (No Overtaking) applies for a distance of:',
      a:'100 m', b:'250 m', c:'500 m', correct:'C',
      exp:'R214/TR214 prohibits overtaking for the next 500 m.', page:13 },
    { text: 'Sign R217 (No Stopping) permits you to stop only to:',
      a:'Take a telephone call', b:'Purchase food from a roadside vendor', c:'Obey a traffic signal, traffic officer, or avoid a collision', correct:'C',
      exp:'No stopping permits stopping only for traffic signals, officer instructions, or to avoid a collision.', page:13 },
    { text: 'Your loaded vehicle is taller than the height shown on sign R204. You must:',
      a:'Reduce speed and proceed with caution', b:'Sound your hooter while passing under it', c:'Find an alternative route', correct:'C',
      exp:'If your vehicle or load exceeds the indicated height, an alternative route must be used.', page:12 },
    { text: 'Sign R206 (Excessive Noise Prohibited) is typically placed near:',
      a:'Schools and sports grounds', b:'Hospitals, churches, and homes for the aged', c:'Industrial areas and factories', correct:'B',
      exp:'R206 prohibits excessive noise near hospitals, churches, and homes for the aged. The hooter may not be used for 100 m after the sign.', page:12 },
    { text: 'Where sign R211 prohibits a left turn, you may:',
      a:'Only proceed straight ahead', b:'Turn right or continue straight', c:'Make a U-turn', correct:'B',
      exp:'Where a left turn is prohibited you may proceed straight or turn right.', page:13 },
  ],

  5: [ // Reservation Signs — pages 17–20
    { text: 'Sign R302 indicates a reserved lane. This means:',
      a:'Other vehicles may use it during off-peak hours', b:'No other class of vehicle may use that part of the road', c:'Taxis and buses may share it at all times', correct:'B',
      exp:'R302 reserves the lane — no other vehicle class may use it at any time.', page:17 },
    { text: 'Sign R401 marks the point where:',
      a:'A speed restriction begins', b:'A dual-carriageway freeway begins', c:'A one-way road ends', correct:'B',
      exp:'R401 marks the start of a dual-carriageway freeway and where freeway rules apply.', page:20 },
    { text: 'Sign R403 (Woonerf) prohibits vehicles with a mass exceeding:',
      a:'1 500 kg', b:'2 500 kg', c:'3 500 kg', correct:'C',
      exp:'Woonerf prohibits vehicles over 3 500 kg or with more than 10 seats except for local access/delivery.', page:20 },
    { text: 'Sign R305-P indicates:',
      a:'Free parking with no time limit', b:'Paid parking for vehicles under 3 500 kg', c:'Reserved parking for minibuses only', correct:'B',
      exp:'R305-P is a paid parking area for vehicles with GVM under 3 500 kg; a fee is required, no time limit.', page:17 },
    { text: 'Sign R325 (Bus Stop Reservation) allows:',
      a:'Any bus or minibus to stop', b:'School buses only', c:'Minibuses displaying the correct emblem or logo to take up and drop passengers', correct:'C',
      exp:'R325 allows minibuses with the correct emblem or logo to load and offload passengers.', page:20 },
    { text: 'The "-P" suffix on reservation signs (e.g. R301-P) denotes:',
      a:'Priority access for emergency vehicles', b:'A parking reservation variant of the sign', c:'Police vehicles only', correct:'B',
      exp:'The "-P" suffix means the sign creates a parking reservation.', page:17 },
  ],

  6: [ // Restriction, Combination & De-restriction — pages 21–23
    { text: 'Sign R600 carrying a red cross through a restriction symbol means:',
      a:'A stricter restriction begins ahead', b:'The restriction indicated is now cancelled', c:'The restriction applies only at night', correct:'B',
      exp:'R600 cancels the restriction whose symbol it carries — the restriction no longer applies.', page:23 },
    { text: 'Sign R510 placed below a regulatory sign means the sign applies:',
      a:'At night only', b:'During reduced visibility', c:'During peak hours only', correct:'B',
      exp:'R510 indicates the regulatory sign above it applies only when visibility is reduced.', page:21 },
    { text: 'Sign R511 placed below a regulatory sign means the sign applies:',
      a:'At night only', b:'On weekends only', c:'During daytime only', correct:'C',
      exp:'R511 = daytime restriction. R512 = night-time restriction.', page:21 },
    { text: 'A Pay and Display sign (R523) requires you to:',
      a:'Display a valid parking disc', b:'Park only during business hours', c:'Pay the fee and display the receipt in or on the vehicle', correct:'C',
      exp:'R523 requires paying the parking fee and displaying the receipt on or within the vehicle.', page:21 },
    { text: 'The notation "R201-80+Camera" on a combination sign means:',
      a:'The camera cancels the 80 km/h limit', b:'80 km/h is optional near the camera', c:'A speed limit of 80 km/h enforced by speed camera', correct:'C',
      exp:'This combines the speed limit value with camera enforcement indication.', page:23 },
    { text: 'All signs in the R600 family (R132-600, R202-600, etc.) share what function?',
      a:'They warn of an upcoming restriction', b:'They cancel a previously imposed restriction', c:'They double the restriction for heavy vehicles', correct:'B',
      exp:'The "-600" suffix denotes a de-restriction — the named restriction no longer applies.', page:23 },
  ],

  7: [ // Warning Signs: Road Layout — pages 24–25
    { text: 'Sign W102 (Priority Crossroad) means you are approaching an intersection where:',
      a:'You must yield to all traffic', b:'You have right of way', c:'Traffic from the right always has priority', correct:'B',
      exp:'W102 warns that you have right of way. The thicker leg of the cross shows which road has priority.', page:24 },
    { text: 'A staggered junction sign (W109/W110) warns that:',
      a:'The road bends sharply ahead', b:'Two roads join from opposite sides within a short distance', c:'A roundabout is ahead', correct:'B',
      exp:'Staggered junctions mean two roads join from opposite sides in quick succession.', page:25 },
    { text: 'Sign W115 (Y-junction) means the road ahead:',
      a:'Comes to a dead end', b:'Forks into two roads', c:'Becomes a one-way road', correct:'B',
      exp:'W115 warns of a Y-shaped fork — you must decide which branch to follow.', page:25 },
    { text: 'Sign W116 (End of Dual Roadway) warns you that:',
      a:'The freeway is ending', b:'A one-way carriageway is ending and two-way traffic will resume', c:'Your lane is closing', correct:'B',
      exp:'W116/W117 warns that two-way traffic resumes — position correctly and be ready to change lanes.', page:25 },
    { text: 'When you see sign W104 (T-Junction ahead) you must:',
      a:'Stop and then proceed', b:'Proceed — you have right of way', c:'Slow down and prepare to turn left or right', correct:'C',
      exp:'W104 warns of a T-junction where you must turn left or right. Slow down and take the corner safely.', page:24 },
  ],

  8: [ // Warning Signs: Direction of Movement — pages 26–27
    { text: 'At a traffic circle sign (W201) with no other indication, you must yield to:',
      a:'Traffic from the left', b:'Traffic from the right and vehicles already in the circle', c:'The largest approaching vehicle', correct:'B',
      exp:'Without other signs, yield to traffic approaching from the right and vehicles already in the circle.', page:26 },
    { text: 'Signs W206/W207 (Hairpin Bend) warn of:',
      a:'A gentle sweeping curve', b:'A slight change of direction', c:'A very sharp, U-shaped bend', correct:'C',
      exp:'W206/W207 indicate a very sharp U-shaped bend, typically in mountainous areas.', page:26 },
    { text: 'Signs W208/W209 (Winding Road) warn that:',
      a:'The road is closing ahead', b:'A series of curves follows without further warning', c:'The road narrows ahead', correct:'B',
      exp:'W208/W209 warn of a series of curves — there may be many more curves after the first.', page:26 },
    { text: 'Sign W212 (Two-Way Traffic) appears where:',
      a:'A one-way road changes to two-way traffic', b:'Two roads cross', c:'A road splits into two lanes', correct:'A',
      exp:'W212 warns drivers leaving a one-way roadway that two-way traffic is ahead — take extra care when overtaking.', page:27 },
    { text: 'Signs W216/W217/W218 (Concealed Driveway) warn that:',
      a:'Road works are ahead', b:'Hidden driveways enter the road where vision is limited', c:'The road is a dead end', correct:'B',
      exp:'These signs warn of driveways that enter the road in a way that makes them hard to see in time.', page:27 },
    { text: 'Sign W302 warns of a STOP sign ahead because:',
      a:'The stop sign is optional at that intersection', b:'The stop sign cannot be seen in time from the normal approach', c:'You must stop 300 m before it', correct:'B',
      exp:'W302 prepares you for an approaching STOP sign that would not be visible early enough to react safely.', page:27 },
  ],

  9: [ // Warning Signs: Symbolic Part 1 — pages 28–30
    { text: 'When you see sign W306 (Pedestrian Crossing ahead) you may NOT:',
      a:'Yield to pedestrians waiting to cross', b:'Reduce your speed before the crossing', c:'Overtake a vehicle that has stopped at the crossing', correct:'C',
      exp:'Overtaking vehicles that have stopped at a pedestrian crossing is prohibited.', page:28 },
    { text: 'Sign W307 (Pedestrians) warns of high pedestrian activity for the next:',
      a:'500 m', b:'1 km', c:'2 km', correct:'C',
      exp:'W307 warns of high pedestrian activity for the next 2 km.', page:28 },
    { text: 'At a railway crossing with no stop line, you must stop no closer than:',
      a:'1 m from the nearest track', b:'2 m from the nearest track', c:'3 m from the nearest track', correct:'C',
      exp:'Where there is no stop line, stop no closer than 3 m from the nearest track. Never stop on the track.', page:29 },
    { text: 'Sign W319 (Tunnel ahead) requires you to:',
      a:'Stop before the tunnel entrance', b:'Sound your hooter on entry', c:'Switch on your headlamps in the dip (low-beam) position', correct:'C',
      exp:'W319 warns of a tunnel — switch on headlights in dip position.', page:29 },
    { text: 'Sign W323 (Steep Descent) reminds you to:',
      a:'Increase speed to clear the slope quickly', b:'Allow for a longer stopping distance, especially when heavily loaded', c:'Engage neutral gear', correct:'B',
      exp:'Allow longer stopping distances on descents — particularly with heavy loads in mountainous areas.', page:29 },
    { text: 'Sign TW304 (Traffic Control ahead) means:',
      a:'A broken traffic light is ahead', b:'A scholar patrol is ahead', c:'A traffic officer is regulating traffic ahead — be ready to stop', correct:'C',
      exp:'TW304 indicates a traffic officer is regulating traffic. Be ready to stop on instruction.', page:28 },
    { text: 'Sign W314 (Gate) tells you to:',
      a:'Sound your hooter to alert the gate attendant', b:'Proceed — the gate opens automatically', c:'Slow down and be prepared to stop', correct:'C',
      exp:'W314 warns of a gate or boom across the road ahead — slow down and prepare to stop.', page:29 },
  ],

  10: [ // Warning Signs: Symbolic Part 2 — pages 31–35
    { text: 'Sign W333 (Slippery Road) warns that road conditions may be slippery for the next:',
      a:'500 m', b:'1 km', c:'2 km', correct:'C',
      exp:'Slow down for the next 2 km — sudden braking or harsh steering can cause skidding.', page:31 },
    { text: 'When approaching a one-vehicle-width structure (W327) with oncoming traffic you must:',
      a:'Sound your hooter and proceed', b:'Stop at least 6 m from the structure and yield', c:'Flash your lights and drive through quickly', correct:'B',
      exp:'Slow down, stop at least 6 m from the structure, and yield to oncoming traffic.', page:30 },
    { text: 'Sign W350 (Drift) warns that:',
      a:'Strong winds are expected', b:'Sand is drifting across the road', c:'A water crossing lies ahead that may be flooded', correct:'C',
      exp:'A drift is a water crossing — slow down, stop if depth is unknown, proceed only if passable.', page:33 },
    { text: 'Sign TW347 (Police Flashing Light) means you should be ready to:',
      a:'Exceed the speed limit to clear the area', b:'Switch on your hazard lights and slow down', c:'Stop — at a roadblock, stop sign, or on a police officer\'s instruction', correct:'C',
      exp:'TW347 warns of a temporary stop, collision scene, or roadblock with police on duty.', page:32 },
    { text: 'Sign W354 (Reduced Visibility) warns of:',
      a:'A tunnel or underpass', b:'Fog or smoke on the road ahead', c:'Direct sunlight glare ahead', correct:'B',
      exp:'W354 warns of reduced visibility — look out for slow-moving vehicles and reduce speed.', page:33 },
    { text: 'Sign TW353 (Collision ahead) instructs you to:',
      a:'Stop and assist all injured persons', b:'Photograph the scene for insurance', c:'Not stop out of curiosity if professional help is already on scene', correct:'C',
      exp:'Slow down, look for someone controlling traffic, be ready to stop, but do not stop out of curiosity if adequate professional help is present.', page:33 },
    { text: 'Sign W349 (Crosswinds) requires you to:',
      a:'Stop and wait until conditions improve', b:'Adjust your steering in time — especially near bridges and large trucks', c:'Drive faster to reduce wind exposure time', correct:'B',
      exp:'Crosswinds require steering adjustments — watch for wind shielding and buffeting effects near trucks.', page:33 },
    { text: 'Sign W346 (Emergency Flashing Light) indicates:',
      a:'The road is closed ahead', b:'Road works 200 m ahead', c:'A hazard ahead — slow down and watch for further signs', correct:'C',
      exp:'W346 warns of a hazard — slow down and look for additional signs explaining the nature of the hazard.', page:32 },
  ],

  11: [ // Warning Signs: Combination Signs — pages 36–38
    { text: 'The suffix "-RB" on a sign (e.g. W332-RB) indicates:',
      a:'The sign applies only on right bends', b:'A high-visibility background with a text message', c:'The sign applies on both sides of the road', correct:'B',
      exp:'"-RB" = high-visibility (fluorescent) background with an additional text message.', page:36 },
    { text: 'The supplementary notation "IN11.2" on a combination sign means:',
      a:'The sign applies for 11.2 km', b:'The sign applies during the day', c:'"For a distance" — the restriction applies over a distance', correct:'C',
      exp:'IN11.2 / TIN11.2 means "for a distance" on combination signs.', page:36 },
    { text: 'The combination "R210-301" is an action-object sign meaning:',
      a:'Bus lane ends — right turn only', b:'No right turn ahead, applying specifically to buses', c:'Buses must turn right at the next intersection', correct:'B',
      exp:'R210 = no right turn; -301 = buses (the object). Combined = no right turn for buses.', page:38 },
    { text: 'The suffix "-501" on a combination sign (e.g. R122-501) indicates:',
      a:'The restriction applies over 500 m', b:'The sign applies to 5-axle vehicles only', c:'The restriction applies during one specified time period', correct:'C',
      exp:'"-501" = one time period. "-502" = two time periods. These are time restriction variants.', page:38 },
    { text: 'The suffix "RC" or "WC" on a combination sign denotes:',
      a:'A road camera is present', b:'A high-visibility (colour) background is used', c:'A change in road conditions', correct:'B',
      exp:'"RC" (regulatory colour) and "WC" (warning colour) indicate high-visibility fluorescent backgrounds.', page:36 },
  ],

  12: [ // Guidance Signs: Route Markers — pages 39–42
    { text: 'A confirmation route marker (GE12–GE15) tells you:',
      a:'The distance to the next town', b:'The route number and road status you are currently on', c:'The toll fee for this route', correct:'B',
      exp:'Confirmation route markers confirm the route number and status (metropolitan/regional/provincial/national).', page:41 },
    { text: 'A bicycle route marker (GE17) tells motor vehicle drivers:',
      a:'To use the cycle lane during off-peak hours', b:'Not to use the cycle route and to watch for cyclists changing direction', c:'That the cycle route is closed to cyclists', correct:'B',
      exp:'Motorists must not use cycle routes and must watch for cyclists who may suddenly change direction.', page:42 },
    { text: 'Blue freeway name signs (GLS) are used to indicate:',
      a:'The toll fee on a freeway', b:'The name and number of a freeway', c:'The distance to the next freeway interchange', correct:'B',
      exp:'GLS-4/GLS-5 are dual/single freeway name signs that identify the freeway.', page:39 },
    { text: 'A stack-type advance direction sign (GD1) is placed:',
      a:'After the intersection', b:'Overhead on motorways only', c:'On the left-hand side before an intersection', correct:'C',
      exp:'GD1 is placed on the left before an intersection, showing route numbers and destinations.', page:42 },
    { text: 'An alternative route marker (GE16) shows drivers:',
      a:'A detour because of road works', b:'An alternative route to a toll road', c:'A secondary route number only', correct:'B',
      exp:'GE16 indicates an alternative, usually lower-standard route to avoid a toll road.', page:41 },
    { text: 'A Fingerboard sign (GD4) is used to direct drivers to:',
      a:'Major national roads and freeways', b:'Emergency services only', c:'Small destinations or locations on less-travelled routes', correct:'C',
      exp:'GD4 is reserved for small destinations or less-travelled routes where a full direction sign is not warranted.', page:42 },
  ],

  13: [ // Guidance Signs: Freeway Direction — pages 43–44
    { text: 'A pre-advance exit direction sign (GA1) is placed approximately how far before an off-ramp?',
      a:'500 m', b:'1 km', c:'2 km', correct:'C',
      exp:'GA1 is placed about 2 km before an off-ramp to give drivers early notice.', page:43 },
    { text: 'An advance exit direction sign (GA2) is placed approximately:',
      a:'2 km before the off-ramp', b:'1 km before the off-ramp', c:'500 m before the off-ramp', correct:'B',
      exp:'GA2 is placed about 1 km before an off-ramp — the second advance notice.', page:43 },
    { text: 'After entering a freeway, the first freeway confirmation sign (GA7) appears at approximately:',
      a:'250 m after entry', b:'500 m after entry', c:'750 m after entry, then every 5–10 km', correct:'C',
      exp:'GA7 confirms your destination at 750 m after entry, then repeats every 5–10 km.', page:44 },
    { text: 'A gore exit sign (GA4) is positioned:',
      a:'Above the freeway at the off-ramp', b:'Between the right side of the off-ramp and the continuing freeway', c:'At the beginning of the on-ramp', correct:'B',
      exp:'GA4 marks the physical separation point between the off-ramp lane and the main carriageway.', page:43 },
    { text: 'An exit sequence sign (GA8) warns you that:',
      a:'The freeway is ending ahead', b:'Multiple closely-spaced exits all lead to the same destination', c:'A toll plaza is ahead', correct:'B',
      exp:'GA8 indicates a series of exits close together, all leading to the same town or destination.', page:44 },
  ],

  14: [ // Guidance Signs: Diagrammatic & Overhead — pages 45–46
    { text: 'You should only drive into an arrestor bed (GS501–504) if:',
      a:'You need to stop urgently on a steep descent', b:'You need to turn around safely', c:'Your brakes have completely failed', correct:'C',
      exp:'Arrestor beds are for vehicles whose brakes have failed — drive straight in only in that emergency.', page:45 },
    { text: 'Sign GS505 (Engage Lower Gear) is found:',
      a:'Before toll plazas', b:'On steep descents', c:'At sharp bends', correct:'B',
      exp:'GS505 warns of a steep descent — heavy vehicles must engage a lower gear to protect their brakes.', page:45 },
    { text: 'A diagrammatic sign showing lane-use control by regulation indicates:',
      a:'The left lane is closed', b:'Overtaking is permitted in that section', c:'A specific lane is subject to a mandatory regulatory sign', correct:'C',
      exp:'These signs show diagrammatically that a specific lane carries a compulsory regulatory instruction.', page:45 },
    { text: 'When lanes merge, converge or end, the correct action for all diagrammatic guidance is:',
      a:'Accelerate to take your position before others', b:'Stop in your lane and wait for a clear gap', c:'Create a safe gap and yield to merging traffic', correct:'C',
      exp:'The general rule for all lane-change diagrammatic signs: ensure a safe gap and yield to other traffic.', page:45 },
    { text: 'An overhead arrestor bed exit sign (GS601/GS602) tells you:',
      a:'All heavy vehicles must enter to test brakes', b:'Do not enter unless it is your destination or your brakes have failed', c:'The arrestor bed is for emergency parking only', correct:'B',
      exp:'Do not use the arrestor bed exit unless required — it is for emergencies only.', page:46 },
  ],

  15: [ // Information Signs — pages 47–48
    { text: 'Count-down signs appear as IN3, IN2, IN1. In what order do they indicate distances?',
      a:'100 m, 200 m, 300 m', b:'300 m, 200 m, 100 m', c:'500 m, 300 m, 100 m', correct:'B',
      exp:'IN3 = 300 m, IN2 = 200 m, IN1 = 100 m to the exit or feature ahead.', page:47 },
    { text: 'Sign IN7 (Right-of-Way) informs you that:',
      a:'You must yield to all cross traffic', b:'You have right of way at the intersection ahead', c:'Traffic from the right has priority', correct:'B',
      exp:'IN7 confirms you have right of way — proceed without unnecessary slowing, but ensure others yield.', page:47 },
    { text: 'Sign IN9 or IN10 (Park-and-Ride) indicates a parking area with:',
      a:'Free unlimited parking', b:'Overnight parking only', c:'Bus or train connections for onward travel', correct:'C',
      exp:'IN9 = bus park-and-ride; IN10 = train park-and-ride — a connection point for public transport.', page:47 },
    { text: 'Sign IN14 (Co-ordinated Traffic Signals) tells you that maintaining the indicated speed will:',
      a:'Ensure you stop at every red light', b:'Reduce your toll fees', c:'Catch green lights at subsequent intersections — the "green wave"', correct:'C',
      exp:'IN14 indicates a green wave — the displayed speed is a recommendation, not a speed limit.', page:48 },
    { text: 'Sign IN15 (Multi-Phase Signals) warns that:',
      a:'All traffic lights ahead are broken', b:'You have right of way through the next lights', c:'The signal sequence does not follow the normal pattern — your red may stay while others get green', correct:'C',
      exp:'At multi-phase intersections some phases show red while an adjacent phase shows green. Wait for your green.', page:48 },
    { text: 'Sign IN16 (Bus Stop ahead) reminds motorists to:',
      a:'Reduce speed to 30 km/h', b:'Stop behind the bus until it moves off', c:'Watch for decelerating buses and pedestrians when overtaking', correct:'C',
      exp:'IN16 alerts drivers that buses may slow ahead — watch for pedestrians during overtaking.', page:48 },
  ],

  16: [ // Road Markings: Regulatory — pages 49–52
    { text: 'You may cross a no-overtaking line (RM1) only to:',
      a:'Overtake a slow-moving vehicle when safe', b:'Access a driveway or pass a stationary obstruction, when safe', c:'Turn right at an intersection', correct:'B',
      exp:'RM1 may only be crossed to access/leave a driveway or pass a stationary obstruction — and only when safe.', page:49 },
    { text: 'A no-crossing line (RM2) may never be crossed except to:',
      a:'Overtake when the road is clear', b:'Avoid a collision', c:'Drive around a stationary vehicle or obstruction', correct:'C',
      exp:'RM2 may not be crossed under any circumstances except to pass a stationary obstruction.', page:49 },
    { text: 'The "MB" code on an exclusive parking bay (RM7) reserves the bay for:',
      a:'Motorbikes', b:'Municipal buses', c:'Minibuses', correct:'C',
      exp:'On RM7 exclusive bays: MB = Minibus.', page:51 },
    { text: 'You must not enter a yellow box junction (RM10) unless:',
      a:'You have right of way', b:'The traffic light is green', c:'Your exit on the other side is clear', correct:'C',
      exp:'Only enter the box if your exit is clear — do not stop inside the yellow box.', page:52 },
    { text: 'The "SOS" code on a parking bay means you may stop there:',
      a:'For any short period', b:'Only to use the emergency SOS telephone', c:'Only if your vehicle has broken down', correct:'B',
      exp:'An SOS bay is for emergency telephone use only — not general stopping.', page:51 },
    { text: 'A right-edge line (RM4.2) on a one-way road may:',
      a:'Be crossed to turn right', b:'Be crossed to overtake on the right', c:'Not be crossed', correct:'C',
      exp:'RM4.2 is a mandatory edge line on one-way roads such as dual carriageways and freeways — it may not be crossed.', page:50 },
    { text: 'When angle-parking, the front of your vehicle must be no further than how far from the kerb?',
      a:'100 mm', b:'150 mm', c:'300 mm', correct:'B',
      exp:'The front of the vehicle must be no further than 150 mm from the kerb when angle-parking.', page:50 },
    { text: 'A broken no-stopping line (RM12) means you may NOT stop:',
      a:'At any time under any circumstances', b:'During the times indicated by an accompanying road sign', c:'Only when loading or unloading goods', correct:'B',
      exp:'A broken RM12 is a time-restricted no-stopping line — obey the times on the accompanying sign.', page:52 },
  ],

  17: [ // Road Markings: Warning & Guidance — pages 53–56
    { text: 'Traffic circle mandatory directional arrows (RM15) require you to:',
      a:'Give way to traffic from the left', b:'Drive anti-clockwise through the circle', c:'Drive clockwise and yield to traffic from the right', correct:'C',
      exp:'RM15 mandates clockwise travel. Yield to traffic from the right; at mini-circles, yield to whoever reaches the yield line first.', page:53 },
    { text: 'Continuity lines (WM2) warn you that:',
      a:'The road is ending ahead', b:'Your lane will soon exit from the main road', c:'You are entering a one-way section', correct:'B',
      exp:'WM2 warns that your lane will turn off — yield to traffic wanting to remain on the main road.', page:53 },
    { text: 'Reversible lane lines (WM4) indicate that the lane:',
      a:'Is permanently closed', b:'Can carry traffic in opposite directions at different times of day', c:'Is reserved for buses and taxis only', correct:'B',
      exp:'WM4 marks a reversible lane — direction changes by time of day.', page:53 },
    { text: 'Lane reduction arrows (WM6) warn you to:',
      a:'Stop in your lane and wait for the lane to clear', b:'Maintain speed to keep pace with surrounding traffic', c:'Change lanes in good time, checking your blind spots', correct:'C',
      exp:'WM6 warns that lanes are reducing — change lanes early and check blind spots on both sides.', page:54 },
    { text: 'Bifurcation arrows (GM3) indicate:',
      a:'A lane closure ahead', b:'A mandatory turn is required', c:'An increase in the number of lanes ahead', correct:'C',
      exp:'GM3 marks where lanes increase — do not straddle the new lane markings.', page:55 },
    { text: 'Guide lines (GM2) are found inside intersections to:',
      a:'Mark the speed limit change at that point', b:'Indicate the bus lane through the intersection', c:'Guide drivers along the correct turning path', correct:'C',
      exp:'GM2 guides drivers to follow the correct route when turning through an intersection.', page:55 },
    { text: 'An arrestor bed ahead marking (WM9) should only be used by:',
      a:'Any vehicle making an emergency stop', b:'Police vehicles on high-speed pursuit', c:'Heavy vehicles whose brakes have failed', correct:'C',
      exp:'Only drive into an arrestor bed if your brakes have completely failed.', page:54 },
    { text: 'Word markings (GM7) on the road surface require drivers to:',
      a:'Stop and read them carefully before proceeding', b:'Read the message and act on the indicated hazard or instruction', c:'Ignore them — they are for information only', correct:'B',
      exp:'GM7 supplies important information — read the message and concentrate on the indicated hazard or instruction.', page:56 },
  ],

  18: [ // Traffic Signals — pages 57–58
    { text: 'A flashing red traffic signal must be treated as:',
      a:'A caution — slow down and proceed carefully', b:'A green light during off-peak hours', c:'A STOP sign — stop completely, then proceed when safe', correct:'C',
      exp:'A flashing red signal = STOP sign: stop, then proceed only when safe to do so.', page:57 },
    { text: 'A constant (steady) amber arrow at a traffic signal means:',
      a:'Yield and proceed in the arrow direction', b:'Stop and wait until the flashing green arrow permits you to go', c:'Turn in the arrow direction — you have right of way', correct:'B',
      exp:'A constant amber arrow requires you to stop and wait for the flashing green arrow signal.', page:57 },
    { text: 'A flashing amber disc at a traffic signal means:',
      a:'Stop immediately', b:'The signal is broken — treat as a STOP sign', c:'Proceed with caution, yielding to pedestrians', correct:'C',
      exp:'A flashing amber disc permits cautious proceeding while yielding to pedestrians who may be crossing.', page:57 },
    { text: 'At a railway crossing, a flashing red light tells you:',
      a:'Slow down and cross carefully', b:'A train is approaching — do not cross until the light stops flashing', c:'The crossing is closed for maintenance', correct:'B',
      exp:'A flashing red at a railway crossing means a train is approaching — wait until it stops flashing before proceeding.', page:57 },
    { text: 'An overhead steady red cross (S17) in a lane means:',
      a:'Only emergency vehicles may use the lane', b:'Do not drive in that lane — it may carry opposing traffic', c:'Stop in the lane and wait for the signal to change', correct:'B',
      exp:'S17 = lane closed. The lane may be open to traffic travelling in the opposite direction.', page:57 },
    { text: 'An overhead yellow arrow pointing left or right (S18/S19) tells you to:',
      a:'Turn in that direction at the next intersection', b:'Yield to traffic in the arrow direction', c:'Leave the lane — it is closing ahead. Move in the direction of the arrow', correct:'C',
      exp:'S18/S19 indicates your lane is closing ahead — change lanes in the direction of the arrow.', page:57 },
    { text: 'A traffic officer\'s hand signals take precedence over:',
      a:'Road markings only', b:'Traffic signs but not traffic lights', c:'Every other traffic signal, including traffic lights', correct:'C',
      exp:'A traffic officer\'s signals override every other signal — traffic lights, road signs, and road markings.', page:58 },
    { text: 'Flag signals (SS2) are used by:',
      a:'Police officers directing traffic at intersections', b:'Workers at road works or herders moving animals across or alongside the road', c:'Toll plaza operators', correct:'B',
      exp:'SS2 flag signals are used at road works, by herdsmen, or in similar temporary situations.', page:58 },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const makeOptions = (q) => ['A', 'B', 'C'].map(lbl => ({
  option_label: lbl,
  option_text:  q[lbl.toLowerCase()],
  is_correct:   q.correct === lbl,
}))

// ─── SEED ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🎯  Seeding K53 exam-grade questions for Live Notes...\n')

  // 1. Fetch all quizzes with their chapter numbers
  const rawChapters = await get('ln_chapters?is_front_matter=eq.false&select=id,chapter_number')
  const rawQuizzes  = await get('ln_quizzes?select=id,chapter_id')

  const chapterMap = {}  // chapter_number → chapter_id
  for (const ch of rawChapters) chapterMap[ch.chapter_number] = ch.id

  const quizMap = {}     // chapter_id → quiz_id
  for (const qz of rawQuizzes) quizMap[qz.chapter_id] = qz.id

  // 2. Delete all existing questions (cascades to options)
  console.log('  Removing old questions and options...')
  await del('ln_questions', 'id=not.is.null')
  console.log('  ✓ Cleared\n')

  // 3. Re-seed chapter by chapter
  let totalQ = 0, totalOpts = 0

  for (const chNum of Object.keys(Q).map(Number)) {
    const chapterId = chapterMap[chNum]
    const quizId    = quizMap[chapterId]

    if (!chapterId || !quizId) {
      console.warn(`  ⚠  Chapter ${chNum}: no matching chapter or quiz in DB — skipping`)
      continue
    }

    const qData = Q[chNum]

    // Insert questions in a batch
    const questionRows = qData.map((q, i) => ({
      quiz_id:         quizId,
      question_number: i + 1,
      question_text:   q.text,
      question_type:   'single_choice',
      explanation:     q.exp,
      source_page:     q.page,
      difficulty:      q.diff ?? 'medium',
    }))

    const insertedQs = await post('ln_questions', questionRows)
    totalQ += insertedQs.length

    // Build all options for this chapter
    const optionRows = []
    for (let i = 0; i < insertedQs.length; i++) {
      const qId = insertedQs[i].id
      for (const opt of makeOptions(qData[i])) {
        optionRows.push({ question_id: qId, ...opt })
      }
    }
    await post('ln_question_options', optionRows)
    totalOpts += optionRows.length

    console.log(`  ✓ Ch ${String(chNum).padStart(2)}: ${insertedQs.length} questions · ${optionRows.length} options`)
  }

  console.log(`\n✅  Done!`)
  console.log(`   Questions : ${totalQ}  (3 options each — K53 exam format)`)
  console.log(`   Options   : ${totalOpts}`)
  console.log(`\n   Chapters/pages/quizzes were untouched.`)
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1) })
