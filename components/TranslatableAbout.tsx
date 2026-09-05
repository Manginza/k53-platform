'use client'

const CONTENT: Record<string, { heading: string; paragraphs: string[] }> = {
  en: {
    heading: 'Welcome to SK Driving',
    paragraphs: [
      'SK Driving is South Africa’s trusted online platform for Learner’s Licence test preparation. We help thousands of learners pass their K53 exam on the first attempt.',
      'Our platform offers comprehensive practice tests covering Rules of the Road, Road Signs, and Vehicle Controls — aligned with the official K53 curriculum used by South African driving licence testing centres.',
      'With daily live YouTube sessions at 8pm, detailed Live Notes, and unlimited practice quizzes, we give you everything you need to walk into your test with confidence.',
      'Whether you’re preparing for a Code 8 (light motor vehicle) or Code 10 (heavy motor vehicle) learner’s licence, SK Driving has you covered.',
    ],
  },
  zu: {
    heading: 'Siyakwamukela ku-SK Driving',
    paragraphs: [
      'I-SK Driving yinkundla yeinthanethi ethembekile yaseNingizimu Afrika yokulungiselela ukuhlolwa kweLayisensi Yokufunda. Sisiza izinkulungwane zabafundi ukuthi baphumelele isivivinyo sabo se-K53 ngokokuqala.',
      'Inkundla yethu ihlinzeka ngezivivinyo zokuprakthiza ezihlanganisa Imithetho Yomgwaqo, Izimpawu Zomgwaqo, kanye Nokulawula Izimoto — kuhambisana nekharikhulamu esemthethweni ye-K53.',
      'Ngezifundo ezisemhlabeni wonke ku-YouTube ngo-8 ntambama, Amanothi Okuphila anenemininingwane, kanye nezivivinyo zokuprakthiza ezingenamkhawulo, sikunika konke okudingayo.',
      'Noma ngabe ulungiselela ikhodi 8 noma ikhodi 10, i-SK Driving ikubhekelele.',
    ],
  },
  xh: {
    heading: 'Wamkelekile ku-SK Driving',
    paragraphs: [
      'I-SK Driving liqonga le-intanethi elithembekileyo loMzantsi Afrika lokulungiselela uvavanyo lweLayisenisi yokuFunda. Sinceda amawaka abafundi ukuba baphumelele uviwo lwabo lwe-K53 ngokuqala.',
      'Iqonga lethu linikeza uvavanyo lokuziqhelanisa olupheleleyo olugubungela iMithetho yeNdlela, iiMpawu zeNdlela, noLawulo lweZithuthi.',
      'Ngezifundo eziphilayo ze-YouTube ngo-8 ngokuhlwa, amaQaphelo aPhilayo aneenkcukacha, novavanyo lokuziqhelanisa olungenamkhawulo, sikunika yonke into oyidingayo.',
      'Nokuba ulungiselela ikhowudi ye-8 okanye ikhowudi ye-10, i-SK Driving ikugubungele.',
    ],
  },
  af: {
    heading: 'Welkom by SK Driving',
    paragraphs: [
      'SK Driving is Suid-Afrika se betroubare aanlyn platform vir Leerlinglisensie-toetsvoorbereiding. Ons help duisende leerders om hul K53-eksamen die eerste keer te slaag.',
      'Ons platform bied omvattende oefentoetse wat Reëls van die Pad, Padtekens en Voertuigkontroles dek — in lyn met die amptelike K53-kurrikulum.',
      'Met daaglikse regstreekse YouTube-sessies om 20:00, gedetailleerde Lewendige Notas en onbeperkte oefenvraestelle, gee ons jou alles wat jy nodig het.',
      'Of jy nou vir ’n Kode 8 of Kode 10 leerlinglisensie voorberei, SK Driving het jou gedek.',
    ],
  },
  st: {
    heading: 'Re o amohela ho SK Driving',
    paragraphs: [
      'SK Driving ke setsha sa inthanete se tshepehang sa Afrika Borwa sa ho itokisetsa tlhahlobo ya Laesense ya ho Ithuta. Re thusa diketekete tsa baithuti ho feta tlhahlobo ya bona ya K53 ka lekgetlo la pele.',
      'Setsha sa rona se fana ka ditlhahlobo tsa boikwetliso tse akaretsang Melao ya Tsela, Matshwao a Tsela, le Taolo ya Dikoloi.',
      'Ka dithuto tse phetseng tsa YouTube ka 8 mantsibuya, Lintlha tse Phelang tse nang le dintlha, le ditlhahlobo tsa boikwetliso tse sa lekanyetswang, re o fa tsohle tseo o di hlokang.',
      'Leha o itokisetsa khoutu ya 8 kapa khoutu ya 10, SK Driving o o sireleleditse.',
    ],
  },
  tn: {
    heading: 'Re go amogela go SK Driving',
    paragraphs: [
      'SK Driving ke setlhogo sa inthanete se se ikanyegang sa Aforika Borwa sa go ipaakanyetsa Teko ya Laesense ya go Ithuta. Re thusa dikete tsa baithuti go feta teko ya bone ya K53 ka lekgetlo la ntlha.',
      'Setlhogo sa rona se fana ka diteko tsa go ikatisa tse di akaretsang Melao ya Tsela, Matshwao a Tsela, le Taolo ya Dikoloi.',
      'Ka dithuto tse di tshelang tsa YouTube ka 8 maitseboa, Dintlha tse di Tshelang tse di nang le dintlha, le diteko tsa go ikatisa tse di sa lekanyetswang, re go fa tsotlhe tse o di tlhokang.',
      'Le fa o ipaakanyetsa khoutu ya 8 kgotsa khoutu ya 10, SK Driving o go sireleditse.',
    ],
  },
}

export default function TranslatableAbout({ lang }: { lang: string }) {
  const c = CONTENT[lang] || CONTENT.en

  return (
    <article className="prose prose-gray max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{c.heading}</h2>
      {c.paragraphs.map((p, i) => (
        <p key={i} className="text-gray-700 leading-relaxed mb-4">
          {p}
        </p>
      ))}
    </article>
  )
}
