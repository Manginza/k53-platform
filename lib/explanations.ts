/**
 * lib/explanations.ts
 *
 * Static legislative explanations keyed by quiz_question.id.
 * Shown after a learner answers, teaching WHY the answer is correct.
 *
 * Sources: NRTA 93 of 1996 · NRTR 2000 · K53 Learner Driver Manual
 */

export const EXPLANATIONS: Record<number, string> = {

  // ── K53 / CODE 8 questions (low IDs) ──────────────────────────────────────

  3:  'Under NRTA Reg 308 you may not park within 1.5 m of a fire hydrant, within 5 m of a pedestrian crossing, or within 6 m of an intersection.',
  19: 'Dipped (dim) headlights must illuminate at least 45 m ahead. Main (bright) beam must illuminate at least 100 m ahead. (NRTA Reg 178)',
  21: 'You may not stop within 5 m of a pedestrian crossing, within 6 m of a level crossing, or on a bridge or in a tunnel. (NRTA Reg 307)',
  26: 'When someone is overtaking you: do NOT speed up, keep as far left as safely possible. Hand-signalling them past is not required by law. (NRTA Reg 299)',
  43: 'Outside urban areas, a vehicle may not be left parked on a public road for more than 24 hours. (NRTA Reg 301)',
  50: 'In an urban area, a vehicle may not be parked in one spot on a public road for more than 7 consecutive days. (NRTA Reg 301)',

  // ── CODE 10 — TEST 1 (IDs 170–232) ───────────────────────────────────────

  170: 'This sign warns that a vehicle carrying hazardous substances may not stop at that point (e.g. near a tunnel, bridge, or built-up area) — it may still pass through, just not stop there. Answer B is correct: "You may not stop there."',
  173: 'This is a "goods vehicle turn left" compulsory direction sign. Delivery vehicles must turn left at the NEXT ROAD, not at a stop sign. Answer C is correct. (NRTA Road Signs Manual)',
  175: 'You may reverse only if it is safe to do so and you are not required to reverse an unreasonable distance. (NRTA Reg 311)',
  176: 'After a licence disc expires, you have a 21-day grace period to renew without penalty. (NRTA Reg 36)',
  177: 'A black arrow road marking next to a yellow kerb line indicates NO PARKING on the side indicated by the arrow. Answer C is correct. A continuous yellow kerb means no stopping at all. (NRTA Reg 308)',
  179: 'Pedestrians who are already crossing when the red man signal begins have right of way — you must wait for them to finish crossing. (NRTA Reg 357)',
  181: 'A trailer (not semi-trailer) with a GVM exceeding 12,000 kg must have an overall length of less than 12.5 m. (NRTA Reg 244)',
  185: 'Control 8 (Clutch pedal) is depressed just before the vehicle comes to a complete standstill to prevent the engine from stalling. The clutch disconnects the engine from the drivetrain. (K53 Vehicle Controls)',
  187: 'A flashing red traffic arrow means STOP behind the line. Proceed only if clear and safe — it functions as a stop sign, not a yield. (NRTA Reg 349)',
  188: 'Dipped/dim headlights must illuminate the road a minimum of 45 m ahead. Main beam must reach at least 100 m. (NRTA Reg 178)',
  190: 'You may NOT stop on a bridge or in a tunnel, opposite a vehicle where less than 2.5 m of road remains, or where stopping is prohibited by a sign. (NRTA Reg 307)',
  191: 'On a steep incline, the parking brake (Control 7) holds the vehicle stationary after the foot brake brings it to a stop. (K53 Controls for Heavy Vehicles)',
  192: 'You may overtake on the left when: (i) the vehicle ahead is turning right AND the road is wide enough, (ii) there are two or more lanes moving the same direction, or (iii) a traffic officer directs you to. All three conditions apply. (NRTA Reg 303)',
  193: 'A heavy motor vehicle MUST be fitted with a secure, sealed fuel cap before use on a public road. An open or missing fuel cap is a fire and spill hazard and is an offence. (NRTA Reg 213)',
  195: 'When being overtaken: (i) do not speed up, (ii) keep left as far as is safe. You are NOT legally required to hand-signal them past — only (i) and (ii) are legally mandated. (NRTA Reg 299)',
  197: 'This sign advises heavy vehicle drivers to engage a LOWER gear to maintain a safe constant speed on a steep descent, preventing brake overheating and brake fade — a critical safety issue on heavy vehicles. (K53 Code 10)',
  199: 'A heavy vehicle may NOT be fitted with a spot lamp that can be deflected in any direction, as it would blind oncoming drivers. (NRTA Reg 178)',
  200: 'Stopping distance INCREASES on wet roads (reduced friction), at higher speeds (greater kinetic energy), and when the vehicle is loaded (greater mass). All three statements are correct. (NRTA Reg 292)',
  203: 'A vehicle licence disc is valid for 12 months. You have 21 days grace after expiry before penalties apply. (NRTA Reg 36)',
  205: 'Before changing lanes you must: signal in good time, check mirrors for surrounding traffic, and only move when safe. All three steps are required. (NRTA Reg 297)',
  206: 'A standard single rigid heavy vehicle (non-articulated) must have an overall length of less than 12.5 m. An articulated combination may be up to 22 m. (NRTA Reg 244)',
  207: 'You may pass on the left if the vehicle ahead (i) indicates right OR (iii) is in a separate lane on a multi-lane urban road. Option (ii) — passing on the shoulder — is NOT legal. (NRTA Reg 303)',
  210: 'As a learner driver of a heavy vehicle you MUST have a licensed driver of the same class present. Learner drivers MAY drive on freeways (with supervision) and MAY carry passengers. Only (i) is correct. (NRTA Reg 16)',
  212: 'Outside an urban area, a vehicle may not be parked for more than 24 hours on a public road. (NRTA Reg 301)',
  213: 'You may NOT stop your vehicle on a pavement/sidewalk at any time. Stopping on a pavement blocks pedestrian access and is prohibited. (NRTA Reg 307)',
  214: 'The clutch pedal (Control 8) must be depressed before selecting a gear on a manual gearbox, disconnecting engine power from the drivetrain. (K53 Vehicle Controls)',
  216: 'You may drive on the paved left shoulder only: (ii) in daytime to allow a vehicle to pass if visibility is clear for 150 m, or (iv) during a mechanical emergency such as a flat tyre. Driving on the shoulder any time (i) or on a freeway (iii) alone is not permitted. (NRTA Reg 306)',
  217: 'A double-deck bus must not exceed an overall height of 4.65 m on a public road (including any load). (NRTA Reg 244)',
  219: 'In an urban area a vehicle may be left parked in one spot for a maximum of 7 days. Leaving it longer is an offence. (NRTA Reg 301)',
  220: 'You cannot obtain a learner\'s licence if you already hold a licence for the same vehicle class, if you have been declared unfit, or if your licence is under suspension. All three disqualify you. (NRTA Reg 15)',
  224: 'Overhead direction signs are found on ordinary public roads with more than one traffic lane — they are not exclusive to freeways. Answer A is correct.',
  225: 'You may NOT overtake when nearing a blind crest (i), approaching a blind curve (ii), OR when visibility is less than 150 m due to dust or mist (iii). All three are overtaking prohibitions. (NRTA Reg 302)',
  226: 'To safely execute a gear change you must use Control 6 (gear lever) and Control 8 (clutch pedal). Press the clutch, select the gear, release the clutch smoothly. (K53 Code 10 Controls)',
  228: 'The single most important overriding rule of the road in South Africa is: KEEP TO THE LEFT SIDE OF THE ROAD AS FAR AS IS SAFE. (NRTA Reg 293)',
  232: 'Tractors are strictly prohibited from driving on a South African freeway, unless actively engaged in freeway construction or maintenance. (NRTA Reg 316)',

  // ── CODE 10 — TEST 2 (IDs 235–288) ───────────────────────────────────────

  245: 'Braking distance on a heavy vehicle increases: (i) on wet roads due to reduced tyre friction, (ii) at higher speeds due to greater kinetic energy, and (iii) when loaded due to greater momentum. All three are correct. (NRTA Reg 292)',
  247: 'You MUST stop: (i) for a person herding animals across a public road, (ii) when directed by a traffic officer on a freeway, and (iii) on any road to avoid an accident. All three are legal obligations. (NRTA Reg 299 & 310)',
  249: 'After an accident you MUST stop immediately and remain to determine damage. You may NOT refuse to give your name and address to other involved parties — (iii) is FALSE. You must give details to ALL parties, not only police. Only (i) and (ii) are correct. (NRTA Sec 61)',
  257: 'Heavy motor vehicles must be fitted with all three brake systems: service brakes (normal braking), parking brakes (hold stationary), and emergency brakes (brake failure). (NRTA Reg 229)',
  258: 'You may NOT: (i) leave the engine running unattended, (ii) use a vehicle without a secure fuel cap, or (iii) spin the wheels when pulling off. All three are offences under the NRTA. (NRTA Reg 213 & Reg 317)',
  261: 'Warning flags indicating load projections MUST be red and at least 300 mm × 300 mm. Both colour and size are prescribed by law — not optional. (NRTA Reg 246)',
  267: 'This sign restricts heavy motor vehicles with a GVM of 5 tonnes OR MORE from turning left. Vehicles under 5 t GVM may proceed. (NRTA Road Signs Manual)',
  268: 'You may legally stop 6 m from a railway level crossing — that is the minimum required clearance. Stopping within 6 m is prohibited. (NRTA Reg 307)',
  277: 'A driver may ONLY disobey a rule of the road when directed to do so by a traffic officer. No other circumstance — including emergencies — gives you the automatic right to break road law. (NRTA Reg 292)',
  286: 'An accident involving only property damage (no injuries or deaths) must be reported to the nearest police station within 24 hours. (NRTA Sec 61(3))',
  287: 'Load projection flags must be red AND at least 300 mm × 300 mm. Any other colour or smaller size is non-compliant. (NRTA Reg 246)',
  288: 'You may drive on the right-hand side of a two-way road ONLY when directed to do so by a traffic officer. No other circumstance justifies it. (NRTA Reg 293)',

  // ── CODE 10 — TEST 3 (IDs 334–378) ───────────────────────────────────────

  336: 'A breath sample of 1 000 ml (1 litre) of expired breath is used in a breathalyzer test. A blood sample of 100 ml is used for a blood alcohol test. (NRTA Reg 336A)',
  338: 'The driver MUST ensure the engine is switched OFF while flammable fuel is being pumped into the tank. Ignition of fuel vapour can cause a fire or explosion. (NRTA Reg 213)',
  339: 'Main (bright/full) beam headlights must illuminate objects at least 100 m ahead. Dipped (dim) beam must illuminate at least 45 m ahead. (NRTA Reg 178)',
  344: 'On a freeway you may only drive in the right-hand lane when OVERTAKING another vehicle. Once you have overtaken, return to the left lane immediately. (NRTA Reg 293)',
  345: 'A blood sample of 100 ml is drawn for a blood alcohol content (BAC) test. A breath sample of 1 000 ml is used for a breathalyzer test. (NRTA Reg 336A)',
  349: 'Animal-drawn vehicles (ox-wagons, horse carts, etc.) are strictly prohibited from using South African freeways. (NRTA Reg 316)',
  354: 'A driver MUST yield right of way to a pedestrian who is already crossing within a marked pedestrian crossing. (NRTA Reg 357)',
  361: 'You must not park within 1.5 m of a fire hydrant on either side. This ensures emergency vehicles can always access the hydrant. (NRTA Reg 308)',
  364: 'If a person is injured or killed, NO vehicle may be moved until: (a) its position has been clearly marked on the road surface, or (b) a traffic officer has authorised removal. Moving a vehicle prematurely destroys evidence. (NRTA Sec 61)',
  365: 'Stop lamps (brake lights) must be visible to a person with normal eyesight from at least 30 m away in sunlight. (NRTA Reg 180)',
  367: 'Outside an urban area, you must park not more than 450 mm from the left edge of the roadway. Parking further than 450 mm from the edge is an offence. (NRTA Reg 301)',
  368: 'A number plate must be legible to a person with normal eyesight from at least 20 m in normal daylight. (NRTA Reg 36)',
}
