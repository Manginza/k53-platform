/**
 * lib/rules-of-the-road.ts — "Rules of the Road" study content for Live Notes.
 *
 * Source: SA Learner Driver Manual — Rules of the Road (Dept. of Transport,
 * June 2012). Summarised for learner's-licence study. Motorcycle-specific
 * rules and questions are intentionally excluded.
 *
 * Quizzes are scored client-side (no login required), matching the course
 * practice tests. Pass mark: 75%.
 */

export type Choice = 'A' | 'B' | 'C'

export interface RoadRuleQuestion {
  question: string
  options: { A: string; B: string; C: string }
  answer: Choice
  explanation: string
}

export interface RoadRuleSection {
  heading: string
  points: string[]
}

export interface RoadRuleChapter {
  slug: string
  order: number
  title: string
  summary: string
  sections: RoadRuleSection[]
  quiz: RoadRuleQuestion[]
}

export const RULES_PASS_MARK = 75

export const RULES_CHAPTERS: RoadRuleChapter[] = [
  // ── 1 ────────────────────────────────────────────────────────────────────
  {
    slug: 'learners-licence-and-licensing',
    order: 1,
    title: 'The Learner\'s Licence & Vehicle Licensing',
    summary: 'How the learner\'s licence works, the vehicle codes, validity periods and who may not hold a licence.',
    sections: [
      {
        heading: 'The learner\'s licence test',
        points: [
          'A learner\'s licence is required before you may legally be trained to drive on a public road.',
          'You apply at a registered Driving Licence Testing Centre (DLTC) on form LL1.',
          'The test covers three areas: the rules of the road and other legislation; road traffic signs, signals and road markings; and the use of the controls of a vehicle.',
          'Once passed, a learner\'s licence is valid for 24 months from the date of the test.',
        ],
      },
      {
        heading: 'Learner\'s licence codes',
        points: [
          'Code 2: authorises light motor vehicles whose Tare, GVM and GCM do not exceed 3 500 kg. Minimum age 17.',
          'Code 3: authorises heavier vehicles. Minimum age 18.',
          'A learner may only drive while under the direct supervision of a person who holds a valid driving licence for that class of vehicle.',
        ],
      },
      {
        heading: 'Carrying and renewing licences',
        points: [
          'A driver must keep his or her licence in the vehicle while driving on a public road.',
          'A motor-vehicle licence and licence disc are valid for 12 months.',
          'After a licence disc expires there is a 21-day period of grace during which the vehicle may still be used.',
          'If you change your place of residence permanently, you must notify the registering authority within 14 days.',
          'Applicants aged 65 or older must submit a medical certificate (form MC).',
        ],
      },
      {
        heading: 'Who may not hold a licence',
        points: [
          'A person addicted to drugs or to the excessive use of alcohol.',
          'A person disqualified, suspended or cancelled by a competent court or authority.',
          'A person suffering from, e.g., uncontrolled epilepsy, fainting attacks, uncontrolled diabetes, defective vision or muscular incoordination. (Deafness alone is not a disqualifying defect.)',
        ],
      },
    ],
    quiz: [
      {
        question: 'How long is a learner\'s licence valid after you pass the test?',
        options: { A: '12 months', B: '24 months', C: '36 months' },
        answer: 'B',
        explanation: 'A learner\'s licence is valid for 24 months from the date the approved test was passed.',
      },
      {
        question: 'What is the minimum age to obtain a Code 2 (light motor vehicle) learner\'s licence?',
        options: { A: '16 years', B: '17 years', C: '18 years' },
        answer: 'B',
        explanation: 'You must be at least 17 years of age for a Code 2 learner\'s licence.',
      },
      {
        question: 'A light motor vehicle is one whose mass does not exceed:',
        options: { A: '1 500 kg', B: '3 500 kg', C: '9 000 kg' },
        answer: 'B',
        explanation: 'A Code 2 (LMV) covers vehicles whose Tare, GVM and GCM do not exceed 3 500 kg.',
      },
      {
        question: 'Within how many days must you report a permanent change of address?',
        options: { A: '7 days', B: '14 days', C: '30 days' },
        answer: 'B',
        explanation: 'You must notify the registering authority within 14 days of permanently changing your place of residence.',
      },
      {
        question: 'For how long is a motor-vehicle licence disc valid?',
        options: { A: '6 months', B: '12 months', C: '24 months' },
        answer: 'B',
        explanation: 'A motor-vehicle licence and licence disc are valid for 12 months.',
      },
      {
        question: 'After your licence disc expires, what is the period of grace before it is an offence to use the vehicle?',
        options: { A: '21 days', B: '30 days', C: '60 days' },
        answer: 'A',
        explanation: 'A vehicle may be operated for 21 days after the date of expiry while displaying the expired disc.',
      },
      {
        question: 'While driving on a public road, a driver must:',
        options: { A: 'Keep the licence at home for safekeeping', B: 'Keep the licence with them in the vehicle', C: 'Only carry the licence at night' },
        answer: 'B',
        explanation: 'A driver must keep his or her licence in the vehicle while driving on a public road.',
      },
    ],
  },

  // ── 2 ────────────────────────────────────────────────────────────────────
  {
    slug: 'key-definitions',
    order: 2,
    title: 'Key Definitions',
    summary: 'The legal terms that appear throughout the rules of the road — vehicle classes, road parts, and parking vs stopping.',
    sections: [
      {
        heading: 'Vehicle classes',
        points: [
          'LMV (Light Motor Vehicle): Tare/GVM not more than 3 500 kg.',
          'HMV (Heavy Motor Vehicle): Tare exceeds 3 500 kg, or a minibus/bus/goods vehicle with GVM over 3 500 kg.',
          'Minibus: designed to carry more than 9 but not more than 16 persons (including the driver).',
          'Bus: designed to carry more than 16 persons (including the driver).',
          'Goods vehicle: a vehicle designed to carry goods (includes truck-tractors, breakdown vehicles and dollies).',
        ],
      },
      {
        heading: 'Parts of the road',
        points: [
          'Roadway: the part of the road between the edges, made for vehicle traffic.',
          'Shoulder: the part between the edge of the roadway and the kerb line.',
          'Sidewalk: the part of the verge for the exclusive use of pedestrians.',
          'Intersection: the whole area where roads join — it includes sidewalks and verges.',
          'Junction: the part of an intersection on the improved (roadway) part of the road.',
        ],
      },
      {
        heading: 'Parking vs stopping',
        points: [
          '"Stop" means bringing the vehicle to a standstill.',
          '"Park" means keeping a vehicle stationary for longer than is reasonably needed to load or unload persons or goods.',
        ],
      },
    ],
    quiz: [
      {
        question: 'A vehicle is classified as a heavy motor vehicle (HMV) when its Tare exceeds:',
        options: { A: '1 500 kg', B: '3 500 kg', C: '9 000 kg' },
        answer: 'B',
        explanation: 'An HMV is a vehicle whose Tare exceeds 3 500 kg (or a bus/minibus/goods vehicle with GVM over 3 500 kg).',
      },
      {
        question: 'Which term includes the whole area where roads join, including sidewalks and verges?',
        options: { A: 'Junction', B: 'Intersection', C: 'Shoulder' },
        answer: 'B',
        explanation: 'An intersection includes all parts of the road (sidewalks, verges, etc.). A junction is only the roadway part within the intersection.',
      },
      {
        question: '"Parking" a vehicle means keeping it stationary for longer than is reasonably needed to:',
        options: { A: 'Wait for a traffic light', B: 'Load or unload persons or goods', C: 'Let the engine cool down' },
        answer: 'B',
        explanation: 'Parking is keeping a vehicle stationary longer than reasonably necessary for the actual loading or unloading of persons or goods.',
      },
      {
        question: 'A minibus is designed to carry:',
        options: { A: 'More than 9 but not more than 16 persons', B: 'Exactly 8 persons', C: 'More than 16 persons' },
        answer: 'A',
        explanation: 'A minibus carries more than 9 but not more than 16 persons, including the driver. More than 16 is a bus.',
      },
      {
        question: 'The "shoulder" of the road is the portion between:',
        options: { A: 'The two edges of the roadway', B: 'The edge of the roadway and the kerb line', C: 'Two lane markings' },
        answer: 'B',
        explanation: 'The shoulder is the portion of road between the edge of the roadway and the kerb line.',
      },
      {
        question: 'The "sidewalk" is intended for the exclusive use of:',
        options: { A: 'Cyclists', B: 'Pedestrians', C: 'Parked vehicles' },
        answer: 'B',
        explanation: 'A sidewalk is the portion of the verge intended for the exclusive use of pedestrians.',
      },
    ],
  },

  // ── 3 ────────────────────────────────────────────────────────────────────
  {
    slug: 'lights-and-visibility',
    order: 3,
    title: 'Lights & Visibility',
    summary: 'When lights must be used and the distances each lamp must achieve, plus indicators and mirrors.',
    sections: [
      {
        heading: 'When to use lights',
        points: [
          'Headlamps, rear lamps and number-plate lamps must be lit between sunset and sunrise.',
          'They must also be lit at any other time when persons and vehicles are not clearly visible at 150 metres (e.g. rain, mist).',
          'Exception: a vehicle parked off the roadway, in a demarcated parking place, or within 12 metres of a lit street lamp.',
          'A vehicle may not be driven on parking lamps only while in motion.',
        ],
      },
      {
        heading: 'Lamp distances',
        points: [
          'Main beam (bright): must light up an object at least 100 metres ahead.',
          'Dipped beam: must light up an object at least 45 metres ahead.',
          'Stop lamp: red light, visible in normal sunlight at 30 metres.',
          'Number-plate lamp: every letter and figure visible at 20 metres.',
          'Dip your main beam for oncoming traffic and when following another vehicle.',
          'Fog lamps may only be used in poor visibility caused by snow, fog, mist, dust or smoke.',
        ],
      },
      {
        heading: 'Indicators and mirrors',
        points: [
          'Direction indicators must flash and be clearly visible in daylight at 30 metres.',
          'It is compulsory to use indicators each time you turn or change lanes.',
          'The vehicle must have mirrors giving the driver a clear view of traffic to the rear.',
        ],
      },
    ],
    quiz: [
      {
        question: 'A main beam (bright) must enable the driver to see an object at least:',
        options: { A: '45 metres ahead', B: '100 metres ahead', C: '150 metres ahead' },
        answer: 'B',
        explanation: 'A main beam must adequately illuminate an object at least 100 metres ahead.',
      },
      {
        question: 'A dipped beam must light up an object at least:',
        options: { A: '30 metres ahead', B: '45 metres ahead', C: '100 metres ahead' },
        answer: 'B',
        explanation: 'A dipped beam must illuminate an object at least 45 metres ahead.',
      },
      {
        question: 'Headlamps must be switched on between:',
        options: { A: 'Sunset and sunrise', B: 'Midnight and 04:00', C: 'Only when it rains' },
        answer: 'A',
        explanation: 'Lights must be lit between sunset and sunrise, and whenever visibility drops below 150 metres.',
      },
      {
        question: 'Apart from at night, lights must also be on whenever persons and vehicles are not clearly visible at:',
        options: { A: '50 metres', B: '100 metres', C: '150 metres' },
        answer: 'C',
        explanation: 'Lights must be used when persons and vehicles are not clearly discernible at a distance of 150 metres.',
      },
      {
        question: 'The letters and figures on a number plate must be visible (with the plate lamp lit) at:',
        options: { A: '20 metres', B: '30 metres', C: '45 metres' },
        answer: 'A',
        explanation: 'A number-plate lamp must make every letter and figure visible at 20 metres.',
      },
      {
        question: 'Fog lamps may be used:',
        options: { A: 'At any time at night', B: 'Only in poor visibility such as fog, mist, dust or smoke', C: 'Whenever the driver prefers' },
        answer: 'B',
        explanation: 'Fog lamps may only be used in conditions of poor visibility caused by snow, fog, mist, dust or smoke.',
      },
      {
        question: 'You must dip your headlights:',
        options: { A: 'Only on freeways', B: 'For oncoming traffic and when following another vehicle', C: 'Never — bright is always safest' },
        answer: 'B',
        explanation: 'Always dip the main beam for oncoming traffic and when following another vehicle.',
      },
    ],
  },

  // ── 4 ────────────────────────────────────────────────────────────────────
  {
    slug: 'vehicle-equipment-and-roadworthiness',
    order: 4,
    title: 'Vehicle Equipment & Roadworthiness',
    summary: 'Brakes, hooter, windscreen, tyres, seatbelts and the warning triangle.',
    sections: [
      {
        heading: 'Controls and equipment',
        points: [
          'Every light and heavy motor vehicle must have a service brake, a parking brake and an emergency brake (the parking and emergency brake may be the same).',
          'The hooter must be audible to a person of normal hearing at 90 metres, and may only be used when necessary for safety.',
          'A windscreen must be of safety glass with a light transmittance of at least 70%.',
          'A speedometer in good working order is required on any vehicle able to reach 60 km/h or more.',
          'A vehicle\'s turning radius may not exceed 13,1 metres.',
        ],
      },
      {
        heading: 'Tyres and warning triangle',
        points: [
          'A light motor vehicle\'s tyres must show a clearly visible tread pattern at least 1 millimetre deep.',
          'When a vehicle is stationary on the roadway, an emergency warning sign (triangle) must be placed at least 45 metres behind it, facing oncoming traffic.',
        ],
      },
      {
        heading: 'Seatbelts',
        points: [
          'Seatbelts must be worn by everyone aged 3 years and older when moving forward.',
          'A child is a person aged 3 to 14 years; a person taller than 1,5 metres is treated as an adult regardless of age.',
          'Rear-seat passengers must wear seatbelts where fitted.',
          'It is not compulsory to wear a seatbelt while reversing or moving in/out of a parking bay.',
        ],
      },
    ],
    quiz: [
      {
        question: 'A vehicle hooter must be clearly audible to a person of normal hearing at:',
        options: { A: '45 metres', B: '90 metres', C: '150 metres' },
        answer: 'B',
        explanation: 'The hooter must emit a sound clearly audible at 90 metres, and may only be used for safety.',
      },
      {
        question: 'The light transmittance through a windscreen must be at least:',
        options: { A: '50%', B: '70%', C: '90%' },
        answer: 'B',
        explanation: 'A windscreen must be of safety glass with at least 70% visible light transmittance.',
      },
      {
        question: 'The minimum legal tyre tread depth for a light motor vehicle is:',
        options: { A: '1 millimetre', B: '3 millimetres', C: '5 millimetres' },
        answer: 'A',
        explanation: 'Tyres must show a clearly visible tread pattern at least 1 mm deep.',
      },
      {
        question: 'When your vehicle is stationary on the roadway, the warning triangle must be placed at least how far behind it?',
        options: { A: '15 metres', B: '45 metres', C: '100 metres' },
        answer: 'B',
        explanation: 'The emergency warning sign must be placed at least 45 metres from the vehicle, facing oncoming traffic.',
      },
      {
        question: 'From what age must a person wear a seatbelt when the vehicle is moving forward?',
        options: { A: '3 years and older', B: '7 years and older', C: '14 years and older' },
        answer: 'A',
        explanation: 'Seatbelts are compulsory for everyone aged 3 years and older.',
      },
      {
        question: 'A child is treated as an adult for seatbelt purposes if he or she is taller than:',
        options: { A: '1,2 metres', B: '1,5 metres', C: '1,8 metres' },
        answer: 'B',
        explanation: 'A person taller than 1,5 metres is regarded as an adult, irrespective of age.',
      },
      {
        question: 'Which three brakes must a light or heavy motor vehicle have?',
        options: { A: 'Service, parking and emergency brake', B: 'Only a foot brake', C: 'Front and rear brake only' },
        answer: 'A',
        explanation: 'Every light/heavy motor vehicle must have a service, parking and emergency brake (parking and emergency may be one).',
      },
    ],
  },

  // ── 5 ────────────────────────────────────────────────────────────────────
  {
    slug: 'speed-limits-dimensions-and-loads',
    order: 5,
    title: 'Speed Limits, Dimensions & Loads',
    summary: 'The general speed limits, limits for heavier vehicles, and rules for carrying goods and passengers.',
    sections: [
      {
        heading: 'General speed limits',
        points: [
          'These apply automatically and need not be shown by a sign (unless a sign indicates otherwise):',
          '60 km/h on every public road in an urban area.',
          '100 km/h on a public road outside an urban area that is not a freeway.',
          '120 km/h on a freeway.',
          'A bus or minibus is limited to 100 km/h.',
          'A goods vehicle with a GVM over 9 000 kg (and breakdown vehicles towing) is limited to 80 km/h.',
        ],
      },
      {
        heading: 'Carrying goods and passengers',
        points: [
          'Goods may not obscure the driver\'s view, contact the road surface, or be unsecured.',
          'Where persons are carried on a goods vehicle, the sides must be enclosed to at least 350 mm above where they sit, or 900 mm above where they stand.',
          'A load projecting more than 150 mm to the side or 300 mm to the rear must be marked: by day with a red flag (300 mm × 300 mm), and at night/poor visibility with retro-reflectors (white to the front, red to the rear).',
        ],
      },
    ],
    quiz: [
      {
        question: 'Unless a sign says otherwise, the speed limit in an urban area is:',
        options: { A: '40 km/h', B: '60 km/h', C: '80 km/h' },
        answer: 'B',
        explanation: 'The general speed limit in an urban area is 60 km/h.',
      },
      {
        question: 'On a public road outside an urban area that is not a freeway, the general speed limit is:',
        options: { A: '80 km/h', B: '100 km/h', C: '120 km/h' },
        answer: 'B',
        explanation: 'Outside urban areas, on roads other than freeways, the limit is 100 km/h.',
      },
      {
        question: 'The general speed limit on a freeway is:',
        options: { A: '100 km/h', B: '110 km/h', C: '120 km/h' },
        answer: 'C',
        explanation: 'The general speed limit on a freeway is 120 km/h.',
      },
      {
        question: 'A bus or minibus is limited to a maximum speed of:',
        options: { A: '80 km/h', B: '100 km/h', C: '120 km/h' },
        answer: 'B',
        explanation: 'A speed limit of 100 km/h applies to a bus and a minibus.',
      },
      {
        question: 'A goods vehicle with a GVM over 9 000 kg is limited to:',
        options: { A: '80 km/h', B: '100 km/h', C: '120 km/h' },
        answer: 'A',
        explanation: 'Goods vehicles with a GVM over 9 000 kg (and articulated vehicles over 9 000 kg) are limited to 80 km/h.',
      },
      {
        question: 'During the day, a load projecting too far to the rear must be marked with:',
        options: { A: 'A red flag (300 mm × 300 mm)', B: 'A white cloth', C: 'A flashing blue light' },
        answer: 'A',
        explanation: 'By day a projecting load is marked with a red flag 300 mm × 300 mm; at night with retro-reflectors.',
      },
    ],
  },

  // ── 6 ────────────────────────────────────────────────────────────────────
  {
    slug: 'road-position-signalling-and-overtaking',
    order: 6,
    title: 'Road Position, Signalling & Overtaking',
    summary: 'Keeping left, giving signals, and when and how you may overtake.',
    sections: [
      {
        heading: 'Position on the road',
        points: [
          'You must drive on the left side of the roadway and not encroach onto the right half.',
          'On a divided road you must use the left-hand roadway unless directed otherwise.',
          'When another vehicle wishes to pass you, keep as far left as is safe and do not speed up until it has passed.',
          'You may only drive on the shoulder (light vehicle, daytime, single lane each way) to let a faster vehicle overtake, when safe and visibility is at least 150 metres.',
        ],
      },
      {
        heading: 'Signalling',
        points: [
          'Before stopping, turning left or turning right you must give a clear signal in good time.',
          'It is compulsory to use direction indicators each time you turn or change lanes.',
        ],
      },
      {
        heading: 'Overtaking',
        points: [
          'You normally overtake (pass) other traffic on the right, at a safe distance, returning to the left only once safely clear.',
          'You may not exceed the speed limit while overtaking.',
          'You may not overtake when approaching the summit of a rise, a curve, or any place where your view is restricted.',
          'You may never overtake by driving on the shoulder or verge.',
          'On a freeway, keep left and pass on the right.',
          'You may flash your headlights to let a driver ahead know you intend to overtake.',
        ],
      },
    ],
    quiz: [
      {
        question: 'On a public road you must drive on the:',
        options: { A: 'Right side of the roadway', B: 'Left side of the roadway', C: 'Centre of the roadway' },
        answer: 'B',
        explanation: 'You must drive on the left side of the roadway and not encroach onto the right half.',
      },
      {
        question: 'You normally overtake other traffic on the:',
        options: { A: 'Left', B: 'Right', C: 'Shoulder' },
        answer: 'B',
        explanation: 'You pass to the right of a vehicle moving in the same direction, at a safe distance.',
      },
      {
        question: 'You may NOT overtake when approaching:',
        options: { A: 'A straight, open stretch of road', B: 'The summit of a rise or a curve', C: 'A petrol station' },
        answer: 'B',
        explanation: 'Overtaking is prohibited near the summit of a rise, a curve, or anywhere your view is restricted.',
      },
      {
        question: 'While overtaking, you:',
        options: { A: 'May exceed the speed limit to pass quickly', B: 'May not exceed the speed limit', C: 'Must use the shoulder' },
        answer: 'B',
        explanation: 'Exceeding the speed limit when overtaking is not permitted.',
      },
      {
        question: 'On a freeway you should:',
        options: { A: 'Keep left and pass on the right', B: 'Keep right and pass on the left', C: 'Drive in any lane' },
        answer: 'A',
        explanation: 'On a freeway, vehicles must keep left and overtake on the right.',
      },
      {
        question: 'A signal of your intention to stop or turn must be given:',
        options: { A: 'In good time, before the manoeuvre', B: 'Exactly as you turn', C: 'Only at night' },
        answer: 'A',
        explanation: 'You must signal clearly and in good time so others are warned of your intention.',
      },
    ],
  },

  // ── 7 ────────────────────────────────────────────────────────────────────
  {
    slug: 'intersections-parking-and-stopping',
    order: 7,
    title: 'Intersections, Parking & Stopping',
    summary: 'Right of way at intersections, where you may not park, where you may not stop, and pedestrian rights.',
    sections: [
      {
        heading: 'Intersections and pedestrians',
        points: [
          'Where traffic moves around a traffic island (e.g. a traffic circle), yield the right of way to traffic approaching from your right.',
          'You must yield, slow down or stop for a pedestrian crossing within a pedestrian crossing.',
          'If a vehicle has stopped at a pedestrian crossing, you may not pass it.',
        ],
      },
      {
        heading: 'Where you may NOT park',
        points: [
          'Within 9 metres of the approaching side of a pedestrian crossing.',
          'Within 5 metres of an intersection.',
          'On the same side as a fire hydrant, within 1,5 metres of the hydrant.',
          'On a road less than 5,5 metres wide, or where it would obscure a road sign, or on a sidewalk.',
        ],
      },
      {
        heading: 'Where you may NOT stop',
        points: [
          'Within 6 metres of a tunnel, subway or bridge (or the start/end of one).',
          'Within 9 metres of the approaching side of a pedestrian crossing.',
          'On the right-hand side of the road facing oncoming traffic.',
          'Alongside another vehicle where the roadway is less than 9 metres wide, or at a railway level crossing.',
        ],
      },
    ],
    quiz: [
      {
        question: 'At a traffic circle (island), you must yield to traffic approaching from your:',
        options: { A: 'Left', B: 'Right', C: 'Rear' },
        answer: 'B',
        explanation: 'Where traffic moves around a traffic island you yield the right of way to traffic approaching from your right.',
      },
      {
        question: 'You may not park within how many metres of an intersection?',
        options: { A: '5 metres', B: '9 metres', C: '12 metres' },
        answer: 'A',
        explanation: 'You may not park within 5 metres of an intersection.',
      },
      {
        question: 'You may not park within how many metres of the approaching side of a pedestrian crossing?',
        options: { A: '5 metres', B: '9 metres', C: '15 metres' },
        answer: 'B',
        explanation: 'You may not park within 9 metres of the side from which you approach a pedestrian crossing.',
      },
      {
        question: 'You may not park within how many metres of a fire hydrant?',
        options: { A: '1,5 metres', B: '5 metres', C: '9 metres' },
        answer: 'A',
        explanation: 'You may not park within 1,5 metres on either side of a fire hydrant.',
      },
      {
        question: 'You may not stop within how many metres of a bridge, tunnel or subway?',
        options: { A: '6 metres', B: '9 metres', C: '12 metres' },
        answer: 'A',
        explanation: 'You may not stop within 6 metres of a tunnel, subway or bridge.',
      },
      {
        question: 'When a vehicle has stopped at a pedestrian crossing, you may:',
        options: { A: 'Pass it slowly', B: 'Not pass it', C: 'Pass it if no one is crossing' },
        answer: 'B',
        explanation: 'Whenever a vehicle has stopped at a pedestrian crossing, no other vehicle may pass the stopped vehicle.',
      },
    ],
  },

  // ── 8 ────────────────────────────────────────────────────────────────────
  {
    slug: 'driver-duties-freeways-and-safety',
    order: 8,
    title: 'Driver Duties, Freeways, Towing & Safety',
    summary: 'Following distance, cellphones, freeway rules, towing, accidents and the alcohol limits.',
    sections: [
      {
        heading: 'Following distance and general duties',
        points: [
          'Keep a minimum following distance of 2 seconds for light motor vehicles, and 3 seconds for heavy motor vehicles.',
          'Increase the following distance in rain, on slippery surfaces, in poor visibility, or when followed too closely.',
          'You may not hold a cellphone (or any communication device) in your hand or with any part of your body while driving.',
          'You must give an immediate right of way to an emergency vehicle sounding a siren and showing warning lights.',
        ],
      },
      {
        heading: 'Freeways and towing',
        points: [
          'Pedal cycles, animal-drawn vehicles, motorcycles of 50 cc or less, motor quadrucycles and tractors may not use a freeway, and pedestrians may not walk on one.',
          'You may not stop on a freeway except in an emergency or as directed by a sign/officer; let merging vehicles in.',
          'A tow-rope, chain or tow-bar between two vehicles may not exceed 3,5 metres.',
          'When towing with a rope or chain, you may not exceed 30 km/h.',
        ],
      },
      {
        heading: 'Accidents and alcohol',
        points: [
          'After an accident you must stop, check for and assist the injured, give your details, and (if not already given to an officer at the scene) report to a police station within 24 hours.',
          'You may not drink alcohol after an accident until you have reported it.',
          'It is an offence to drive with a blood-alcohol concentration of 0,05 g per 100 ml or more — and 0,02 g per 100 ml or more for a professional driver.',
          'A vehicle left for more than 24 hours (outside an urban area) or 7 days (within an urban area) is deemed abandoned.',
        ],
      },
    ],
    quiz: [
      {
        question: 'The minimum following distance for a light motor vehicle is:',
        options: { A: '1 second', B: '2 seconds', C: '5 seconds' },
        answer: 'B',
        explanation: 'Keep a minimum 2-second following distance for light motor vehicles (3 seconds for heavy vehicles).',
      },
      {
        question: 'The minimum following distance for a heavy motor vehicle is:',
        options: { A: '2 seconds', B: '3 seconds', C: '6 seconds' },
        answer: 'B',
        explanation: 'Heavy motor vehicles must keep a minimum 3-second following distance.',
      },
      {
        question: 'The legal blood-alcohol limit for an ordinary driver is below:',
        options: { A: '0,02 g per 100 ml', B: '0,05 g per 100 ml', C: '0,10 g per 100 ml' },
        answer: 'B',
        explanation: 'It is an offence to drive with 0,05 g per 100 ml of blood or more (0,02 g for a professional driver).',
      },
      {
        question: 'The blood-alcohol limit for a professional driver is below:',
        options: { A: '0,02 g per 100 ml', B: '0,05 g per 100 ml', C: '0,08 g per 100 ml' },
        answer: 'A',
        explanation: 'A professional driver may not drive with 0,02 g per 100 ml of blood or more.',
      },
      {
        question: 'After an accident, if you have not given your details to an officer at the scene, you must report it to a police station within:',
        options: { A: '24 hours', B: '48 hours', C: '7 days' },
        answer: 'A',
        explanation: 'You must report the accident to a police station within 24 hours.',
      },
      {
        question: 'Using a hand-held cellphone while driving is:',
        options: { A: 'Allowed at low speed', B: 'Prohibited', C: 'Allowed in traffic' },
        answer: 'B',
        explanation: 'You may not hold a cellphone or communication device in your hand (or with any part of your body) while driving.',
      },
      {
        question: 'When towing with a tow-rope or chain, you may not exceed:',
        options: { A: '30 km/h', B: '60 km/h', C: '80 km/h' },
        answer: 'A',
        explanation: 'With a tow-rope or chain you may not exceed 30 km/h (unless connected by a draw-bar or tow-bar).',
      },
      {
        question: 'Which of these may NOT be used on a freeway?',
        options: { A: 'A light motor vehicle', B: 'A pedal cycle', C: 'A minibus' },
        answer: 'B',
        explanation: 'Pedal cycles, animal-drawn vehicles, 50 cc-or-less motorcycles, quadrucycles and tractors may not use a freeway.',
      },
    ],
  },
]

export function getRuleChapter(slug: string): RoadRuleChapter | undefined {
  return RULES_CHAPTERS.find(c => c.slug === slug)
}
