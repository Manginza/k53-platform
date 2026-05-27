-- =================================================================
-- K53 Platform — Seed: Code 10 Test 2 Questions
-- Generated: 2026-05-27T16:02:10.494Z
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- =================================================================

DO $$
DECLARE
  v_course_id bigint;
BEGIN
  -- Get the Code 10 course id
  SELECT id INTO v_course_id FROM courses WHERE code = 'code10';

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Course with code=code10 not found. Did you run schema.sql first?';
  END IF;

  -- Clear existing test 2 questions for this course (safe to re-run)
  DELETE FROM quiz_questions WHERE course_id = v_course_id AND test_number = 2;

  -- Insert all questions
  INSERT INTO quiz_questions
    (course_id, test_number, question, option_a, option_b, option_c, correct_answer, image_url, image_ref)
  VALUES
    (v_course_id, 2, 'What does this road sign indicate?', 'That you have the right of way at the next intersection.', 'That there is danger ahead.', 'That you do not have the right of way at the next intersection.', 'A', '/images/code10/test2/2c10.1.img.png', '2c10.1.img.png'),
    (v_course_id, 2, 'If you want to change lanes, you must...', 'Give the necessary signal and, after looking for other traffic, change lanes.', 'Switch on your indicator and change lanes.', 'Apply the brakes lightly and then change lanes.', 'A', NULL, NULL),
    (v_course_id, 2, 'You may cross or enter a public road...', 'If the road is clear of traffic for a short distance.', 'If the road is clear of traffic for a long distance and it can be done without obstructing traffic.', 'In any manner as long as you use your indicators in time.', 'B', NULL, NULL),
    (v_course_id, 2, 'Does this road marking have the same purpose as a stop sign?', 'True.', 'False.', NULL, 'A', '/images/code10/test2/2c10.2.img.png', '2c10.2.img.png'),
    (v_course_id, 2, 'This road sign prohibits all... to drive there: (i) vehicles conveying dangerous goods, (ii) goods vehicles, (iii) abnormal vehicles, (iv) heavy vehicles. SELECT THE CORRECT COMBINATION', 'Only (iii) and (iv) are correct', 'All of the above are correct', 'Only (i) is correct', 'B', '/images/code10/test2/2c10.2.1.img.png', '2c10.2.1.img.png'),
    (v_course_id, 2, 'If you want to turn left with your vehicle, you must...', 'Slow down completely, stop and then turn.', 'First move to the right to enable you to turn left easily.', 'Give the necessary signal in good time.', 'C', NULL, NULL),
    (v_course_id, 2, 'When you drive...', 'You must have both hands on the steering wheel.', 'You must wear shoes with rubber soles.', 'Your vision of the road and the traffic must be unobstructed.', 'C', NULL, NULL),
    (v_course_id, 2, 'What is the duty of a driver when driving on a public road that has been divided into two or more roadways?', 'You are allowed to drive on any part of the roadway after sunset, or when there is no other traffic on the road.', 'Drive on the left-hand roadway unless directed or shown to do so by a traffic officer or traffic sign.', 'You may drive on any part of the roadway.', 'B', NULL, NULL),
    (v_course_id, 2, 'A heavy motor vehicle must be equipped with an efficient exhaust silencer, which...', 'must be so maintained that the exhaust gas or smoke does not leak into the driving cab or passenger compartment of the vehicle.', 'must be so maintained that it does not cause a vibration in the cab.', 'does not have to be maintained, as long it does not make noise.', 'A', NULL, NULL),
    (v_course_id, 2, 'What does this control sign indicate?', 'The road turning to the left is a one-way road to the left.', 'Turning left is prohibited.', 'You should turn left.', 'C', '/images/code10/test2/2c10.3.img.png', '2c10.3.img.png'),
    (v_course_id, 2, 'When control number 9 is used, the distance it takes the vehicle to stop is: (i) longer on a wet road than on a dry road, (ii) longer if the vehicle is travelling at a higher speed, (iii) longer if the vehicle is loaded. SELECT THE CORRECT COMBINATION', 'None of the above are correct', 'Only (i) is correct', 'All of the above are correct', 'C', '/images/code10/test2/2c10.4.img.png', '2c10.4.img.png'),
    (v_course_id, 2, 'This road sign shows that…', 'goods vehicles are not allowed to use this road.', 'goods vehicles are not allowed in the right-hand lane.', 'only goods vehicles must use the right-hand lane.', 'B', '/images/code10/test2/2c10.5.img.png', '2c10.5.img.png'),
    (v_course_id, 2, 'You must stop your vehicle: (i) On a public road at the signal of a person herding sheep, (ii) On a freeway when directed to do so by a traffic officer, (iii) On any road to avoid an accident. SELECT THE CORRECT COMBINATION', 'Only (ii) and (iii) are correct', 'Only (iii) is correct', 'All of the above are correct', 'C', NULL, NULL),
    (v_course_id, 2, 'What should the driver of a vehicle do when following another vehicle at night?', 'Flash the main beam occasionally', 'Dip the main beam', 'Make sure the main beam is on', 'B', NULL, NULL),
    (v_course_id, 2, 'When you are involved in an accident, you: (i) Must immediately stop your vehicle, (ii) Must determine the damage to the vehicles, (iii) May refuse to give your name and address to anyone except the police. SELECT THE CORRECT COMBINATION', 'All of the above are correct', '(i) and (ii) only are correct', '(ii) only is correct', 'B', NULL, NULL),
    (v_course_id, 2, 'What does this road sign inform road users of?', 'A pick-up OR drop-off area reserved for a bus belonging to a specific company or organisation.', 'A lane reserved for a vehicle belonging to a specific company or organisation.', 'A parking spot reserved for buses.', 'A', '/images/code10/test2/2c10.7.img.png', '2c10.7.img.png'),
    (v_course_id, 2, 'The appropriate reaction to this sign would be to…', 'turn right at the next intersection.', 'keep left.', 'be on the lookout for vehicles doing lane changes, especially from the left.', 'C', '/images/code10/test2/2c10.8.img.png', '2c10.8.img.png'),
    (v_course_id, 2, 'While the vehicle is in motion, a driver may...', 'type an SMS.', 'hold a cell phone provided the driver keeps at least one hand on the steering wheel.', 'not hold a cell phone with any other part of the body.', 'C', NULL, NULL),
    (v_course_id, 2, 'A temporary sign...', 'has the same legal significance as a permanent sign.', 'need not be taken seriously at all times of the day.', 'is of less consequence to road users than a permanent sign.', 'A', NULL, NULL),
    (v_course_id, 2, 'Which one of these signs says you must turn right?', 'B', 'A', 'C', 'B', '/images/code10/test2/2c10.9.img.png', '2c10.9.img.png'),
    (v_course_id, 2, 'When the traffic light is red and the green arrow flashes to the right, it shows you that:', 'Only pedestrians may walk.', 'If you want to turn right, you may go.', 'All traffic must turn right there.', 'B', '/images/code10/test2/2c10.10.img.png', '2c10.10.img.png'),
    (v_course_id, 2, 'When do you have the right of way? (i) When you are within a traffic circle, (ii) When you have stopped first at a four-way stop, (iii) When you want to turn right at an intersection in a two-way road. SELECT THE CORRECT COMBINATION', '(i) and (ii) only are correct', 'All of the above are correct', '(i) only is correct', 'A', NULL, NULL),
    (v_course_id, 2, 'What type of brakes must be fitted on a heavy motor vehicle?', 'Parking brakes only.', 'Service brakes, parking brakes and emergency brakes.', 'Service brakes only.', 'B', NULL, NULL),
    (v_course_id, 2, 'You may not: (i) Leave the engine running unattended, (ii) Use your vehicle without a cap on the fuel tank, (iii) Spin the wheels of your vehicle when pulling off. SELECT THE CORRECT COMBINATION', '(ii) only is correct', '(i) only is correct', 'All of the above are correct', 'C', NULL, NULL),
    (v_course_id, 2, 'A safe following distance means that if the vehicle in front of you suddenly stops, you can...', 'Stop without swerving', 'Swerve and stop next to it', 'Swerve and pass', 'A', NULL, NULL),
    (v_course_id, 2, 'If travelling in a goods vehicle towing a trailer, how many emergency warning signs (triangles) must you carry?', 'A minimum of two warning signs (triangles).', 'Only one.', 'Warning triangles are not compulsory.', 'A', NULL, NULL),
    (v_course_id, 2, 'When flags are used to indicate load projections...', 'They must be any sized red flag.', 'They may be any colour as long as they are visible.', 'They must be red, and at least 300 mm x 300 mm.', 'C', NULL, NULL),
    (v_course_id, 2, 'This road sign shows that…', 'all heavy vehicles may drive here during the times shown on the sign', 'vehicles carrying hazardous products may only use the road during the times shown on the sign', 'tankers must use this road during the times shown on the sign', 'B', '/images/code10/test2/2c10.11.img.png', '2c10.11.img.png'),
    (v_course_id, 2, 'If you come across an emergency vehicle on the road sounding a siren, you must…', 'Give right of way to the emergency vehicle', 'Flash your headlights to warn other traffic', 'Switch on your vehicle''s emergency lights and blow your hooter', 'A', NULL, NULL),
    (v_course_id, 2, 'The background of temporary signs is usually...', 'white.', 'black.', 'yellow.', 'C', NULL, NULL),
    (v_course_id, 2, 'You may not drive into an intersection when...', 'The traffic light is yellow and you are already in the intersection.', 'There is not enough space in the intersection to turn right without blocking other traffic.', 'The vehicle in front of you wants to turn right and the road is wide enough to pass on the left side.', 'B', NULL, NULL),
    (v_course_id, 2, 'This road marking shows you a lane that…', 'you may follow if you want to go to an airport', 'is reserved for aeroplanes', 'is reserved for faulty aeroplanes', 'A', '/images/code10/test2/2c10.11.1.img.png', '2c10.11.1.img.png'),
    (v_course_id, 2, 'This road sign shows that…', 'heavy motor vehicles with a GVM less than 5 tons are not allowed to turn left ahead.', 'heavy motor vehicles with a GVM of 5 tons or more are not allowed to turn left ahead.', 'all heavy motor vehicles are not allowed to turn left ahead.', 'B', '/images/code10/test2/2c10.12.img.png', '2c10.12.img.png'),
    (v_course_id, 2, 'Where may you legally stop with your vehicle?', '5 m from a pedestrian crossing', '4 m from a tunnel', '6 m from a railway crossing', 'C', NULL, NULL),
    (v_course_id, 2, 'This road sign shows you that…', 'Vehicles longer than 15 m may not drive past this sign.', 'No vehicles with trailers may drive past this sign.', 'The road is only 15 m wide past this sign.', 'A', '/images/code10/test2/2c10.12.1.img.png', '2c10.12.1.img.png'),
    (v_course_id, 2, 'When you encounter this road marking, the correct reaction would be to…', 'yield only to traffic from the right.', 'stop over the line and then proceed when it is safe to do so.', 'yield right of way to any vehicle which crosses any yield line before you.', 'C', '/images/code10/test2/2c10.13.img.png', '2c10.13.img.png'),
    (v_course_id, 2, 'If you come to a traffic light and the red light flashes, you must…', 'Stop and wait for the light to change to green before you go.', 'Look out for a roadblock as the light shows you a police stop.', 'Stop and go only if it is safe to do so.', 'C', NULL, NULL),
    (v_course_id, 2, 'What is the purpose of this information sign?', 'To count down the distance to the next exit on a freeway.', 'To count down the distance to the next on-ramp to a freeway.', 'To count down the distance to the next town.', 'A', '/images/code10/test2/2c10.14.img.png', '2c10.14.img.png'),
    (v_course_id, 2, 'When may you stop in front of this sign?', 'Never.', 'Only when picking up passengers.', 'Only when you want to look at the scenery.', 'A', '/images/code10/test2/2c10.15.img.png', '2c10.15.img.png'),
    (v_course_id, 2, 'What does this road sign inform drivers of?', 'An exit ahead on a freeway in good time.', 'To turn left to enter a freeway.', 'An on-ramp to a freeway in good time.', 'A', '/images/code10/test2/2c10.16.img.png', '2c10.16.img.png'),
    (v_course_id, 2, 'What is this road sign called?', 'An advance trailblazer', 'An alternative route marker', 'A map-type trailblazer', 'A', '/images/code10/test2/2c10.17.img.png', '2c10.17.img.png'),
    (v_course_id, 2, 'This sign warns a driver that…', 'a T-junction is ahead.', 'a skew T-junction is ahead.', 'a side road junction from the right is ahead.', 'B', '/images/code10/test2/2c10.17.1.img.png', '2c10.17.1.img.png'),
    (v_course_id, 2, 'When may a driver disobey a rule of the road?', 'Under no circumstances', 'Only when directed to do so by a traffic officer.', 'If you are driving in an emergency situation.', 'B', NULL, NULL),
    (v_course_id, 2, 'What are the requirements for a vehicle being used with excessive noise?', 'Excessive noise is acceptable during festive periods, Christmas, and New Year.', 'No person shall operate a vehicle on a public road that causes any excessive noise.', 'There are no requirements with regards to excessive noise on a vehicle.', 'B', NULL, NULL),
    (v_course_id, 2, 'This sign shows you that…', 'only cars may enter.', 'the road ends ahead.', 'there is a one-way ahead.', 'C', '/images/code10/test2/2c10.18.img.png', '2c10.18.img.png'),
    (v_course_id, 2, 'When seeing this sign you should know that…', 'there is a public phone ahead.', 'there is no cell phone reception for the next 500 m.', 'there is an emergency phone 500 m ahead on the road.', 'C', '/images/code10/test2/2c10.19.img.png', '2c10.19.img.png'),
    (v_course_id, 2, 'The use of a temporary sign implies that for some reason...', 'the rules of the road do not apply.', 'circumstances on the roadway are not normal.', 'traffic has to move slowly.', 'B', NULL, NULL),
    (v_course_id, 2, 'The only instance where you may stop on a freeway is...', 'For a rest during a tiring journey', 'To obey a road traffic sign', 'To pick up hitch-hikers', 'B', NULL, NULL),
    (v_course_id, 2, 'Where do you find this direction sign?', 'On any freeway, indicating dedicated exit lanes.', 'Only in towns or suburbs.', 'On any public road indicating single exit lanes.', 'A', '/images/code10/test2/2c10.20.img.png', '2c10.20.img.png'),
    (v_course_id, 2, 'What is this road worker signaling drivers to do?', 'To proceed with caution.', 'To stop.', 'To turn back.', 'B', '/images/code10/test2/2c10.21.img.png', '2c10.21.img.png'),
    (v_course_id, 2, 'The road marking next to the black arrow tells you that…', 'you may stop adjacent to the red line.', 'you may not stop there at all times.', 'you may not stop there between certain periods indicated by another appropriate road sign.', 'B', '/images/code10/test2/2c10.22.img.png', '2c10.22.img.png'),
    (v_course_id, 2, 'An accident in which no one has been injured must be reported within ... hours', '36', '48', '24', 'C', NULL, NULL),
    (v_course_id, 2, 'What colour and size must flags be to indicate load projections on a vehicle on a public road?', 'They can be any size as long as they are red.', 'They must be red and at least 300 mm x 300 mm.', 'They may be any colour as long as they are visible.', 'B', NULL, NULL),
    (v_course_id, 2, 'When are you allowed to drive your vehicle on the right-hand side of a road with traffic moving in both directions?', 'Under no circumstances', 'When a traffic officer shows you to do so', 'When you switch the emergency lights of your vehicle on', 'B', NULL, NULL);

  RAISE NOTICE 'Inserted % questions for course_id=%', 54, v_course_id;
END $$;