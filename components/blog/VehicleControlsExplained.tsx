import type { BlogPost } from '@/lib/blog'
import BlogArticle, { A, H2, type FaqItem } from './Article'

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'How many vehicle-controls questions are there?',
    a: 'Eight. You need at least six. Two wrong answers is a fail for the section, even if you passed rules and signs.',
  },
  {
    q: 'Are the numbers the same on every diagram?',
    a: 'No. The official test uses a numbered diagram for the category you booked, and you should not assume the numbers match a diagram you saw elsewhere. Learn what each control does. On SK Driving’s free light-vehicle diagram the numbers are listed in the article so you can practise that picture.',
  },
  {
    q: 'Which pedal stops the car, and which holds it when parked?',
    a: 'The foot brake (the service brake) slows and stops a moving vehicle. The parking brake holds a vehicle that is already standing still. Neutral does not hold the vehicle.',
  },
  {
    q: 'Do automatic cars have a clutch?',
    a: 'No. An automatic has no clutch pedal. The clutch is the control that disconnects the engine from the gearbox on a manual vehicle.',
  },
]

export default function VehicleControlsExplained({ post }: { post: BlogPost }) {
  return (
    <BlogArticle post={post} faqs={FAQ_ITEMS}>
      <p>
        Vehicle controls is the shortest part of the learner’s test and the part people leave until the last evening.
        There are eight questions and you need six. Two mistakes fail the section. The questions show a numbered
        diagram and ask which number does a job: stopping, selecting a gear, indicating, seeing behind you, keeping a
        parked vehicle still. You are not asked to name a part for its own sake. You are asked which control you
        would use.
      </p>
      <p>
        The official diagram depends on the category you booked, and its numbers will not necessarily match a picture
        in a book or on a website. Learn the job of each control so you can read any diagram. The numbers in this
        article are the ones on SK Driving’s free light-vehicle practice diagram, published with the{' '}
        <A href="/k53-questions-and-answers">free K53 questions</A>. Use them to practise that picture. On test day,
        read the diagram you are given.
      </p>

      <H2>The light-vehicle practice diagram</H2>
      <p>
        On that practice diagram the numbers are: 1 rear-view mirror, 2 windscreen wipers, 3 side mirrors, 4 steering
        wheel, 5 indicator lever, 6 gear lever, 7 parking brake, 8 clutch, 9 foot brake, 10 accelerator and 11 hooter.
        A useful way to remember the groups is: 1 and 3 show you what is behind, 4 steers, 5 tells other drivers you
        are about to turn or change lane, 6 selects a gear, 7 holds the vehicle when it is parked, 8 is the clutch,
        9 stops the moving vehicle, 10 makes it go faster, 2 clears the windscreen and 11 warns other road users.
      </p>
      <p>
        Cover the caption and point at each number until you can say the job without the list. Then do the opposite:
        read a job, such as “show that you want to turn”, and say the number. The test questions are written in that
        second direction. They rarely ask “what is number 5?”. They ask which number you use to do something.
      </p>

      <H2>Brakes: stopping is not the same as parking</H2>
      <p>
        Number 9, the foot brake, is the service brake. You use it to slow down and to stop. Number 7, the parking
        brake, holds a vehicle that is already standing still so it does not roll. The questions separate them on
        purpose. “Which number is used to stop the vehicle?” is the foot brake. “To make sure your parked vehicle does
        not move, you use…” is the parking brake.
      </p>
      <p>
        Leaving the gear lever in neutral does not hold the vehicle. Neutral lets it roll. Holding the service brake
        with your foot works only while your foot is there. The control designed to keep a stationary vehicle still
        is the parking brake. If a question says the vehicle is standing still and asks how the driver makes sure it
        does not move, choose the parking brake, not neutral and not “keep your foot on the brake”.
      </p>

      <H2>The clutch, and why automatics do not have one</H2>
      <p>
        The clutch disconnects the engine from the gearbox. You use it to change gear and to keep the engine from
        stalling as the vehicle comes to a stop. On the practice diagram that is number 8. A question that asks which
        control stops the vehicle stalling just before it comes to a complete standstill is asking for the clutch,
        not the accelerator and not the parking brake.
      </p>
      <p>
        The clutch is not a way to slow the vehicle down, and it is not there so you can freewheel down a hill.
        Freewheeling — coasting with the clutch down or the gear in neutral — is unsafe because you have less control.
        If the question asks for the function of a clutch, the accurate answer is that it disconnects the engine from
        the transmission.
      </p>
      <p>
        An automatic vehicle has no clutch pedal. On this diagram, the number an automatic does not have is 8. It
        still has wipers and a steering wheel. That question is checking whether you know which control is the clutch,
        not whether you have driven an automatic. If you are writing a Code 1 motorcycle learner’s, the diagram will
        show motorcycle controls instead of car pedals. The idea is the same: learn the picture for the category on
        your LL1 form. Categories are explained in <A href="/learners-licence-codes">learner’s licence codes</A>.
      </p>

      <H2>Seeing, signalling and selecting a gear</H2>
      <p>
        You see behind you with the rear-view mirror and the side mirrors, numbers 1 and 3 on the practice diagram.
        The wipers are not mirrors. A question that pairs “2 and 3” is mixing the wipers with a mirror. Steering is
        the wheel, number 4, not the accelerator and not a mirror.
      </p>
      <p>
        The indicator, number 5, is how you show that you intend to turn left or right or to change lane. You use it
        in good time, before the manoeuvre, which is the same rule as in the rules section. The gear lever, number 6,
        selects the gear. It does not steer and it does not indicate. Candidates who rush the diagram swap 5 and 6
        because both sit near the steering column in their memory of a real car. On the diagram, trust the number you
        learned, not where you think the stalk is in your uncle’s bakkie.
      </p>

      <H2>Wipers, hooter and accelerator</H2>
      <p>
        The windscreen wipers, number 2, are the control you use in the rain so you can see. The mirrors do not clear
        water off the glass, and the indicator does not either. The accelerator, number 10, is what makes the vehicle
        gain speed. It is not a brake and it is not the control you press to avoid a stall at the last moment. That
        last job is the clutch.
      </p>
      <p>
        The hooter, number 11, is a warning. It is not a substitute for the indicator, and it is not the right response
        to an emergency vehicle. An emergency vehicle with its siren and lights on gets right of way. You move over.
        You do not hoot at it. Controls questions and rules questions meet at that point. If you have read{' '}
        <A href="/blog/k53-rules-of-the-road-explained">the rules explained</A>, this one is easier.
      </p>

      <H2>How to practise the eight questions</H2>
      <p>
        Print or open the practice diagram and drill it in both directions for ten minutes, then answer the controls
        questions without looking back. Mark only this section. Five out of eight fails you even if the other 56
        questions went well. When you miss one, say the job of the number you chose and the job of the number that was
        right. “I used the parking brake to stop a moving car” is the lesson. “I picked B” is not.
      </p>
      <p>
        Do a second set the next day before you look at the first set’s answers. The <A href="/courses">practice
        tests</A> include controls with the other two sections, which is how the real test is sat. Use them once the
        diagram feels dull. Dull is what you want. On the day, the centre supplies the screen or the paper. You do
        not take your own diagram in. Everything you need has to be in your head, tied to the picture they show you.
      </p>
    </BlogArticle>
  )
}
