"use client"

interface Translation {
  title: string
  intro: string
  visionTitle: string
  vision: string
  whyTitle: string
  whyPoints: string[]
}

const TRANSLATIONS: Record<string, Translation> = {
  en: {
    title: 'About Us',
    intro: `Welcome to the K53 Learner's Licence Platform! Our mission is to provide the most accessible, comprehensive, and easy-to-use study materials for the South African K53 Learner's Licence test.`,
    visionTitle: 'Our Vision',
    vision: `We believe that learning the rules of the road should be an engaging and straightforward experience. By combining high-quality study notes with interactive quizzes, we ensure our users are fully prepared to pass their tests on the first try.`,
    whyTitle: 'Why Choose Us?',
    whyPoints: [
      'Comprehensive Coverage: From road signs to vehicle controls, we cover everything.',
      'Interactive Quizzes: Test your knowledge with our timed, exam-style questions.',
      'Accessible Anywhere: Study on your phone, tablet, or computer.',
    ],
  },
  af: {
    title: 'Oor Ons',
    intro: `Welkom by die K53 Leerderslisensie-platform! Ons missie is om die mees toeganklike, omvattende en maklik-om-te-gebruik studiemateriaal vir die Suid-Afrikaanse K53 leerderslisensietoets te bied.`,
    visionTitle: 'Ons Visie',
    vision: `Ons glo dat die leer van die reëls van die pad 'n boeiende en eenvoudige ervaring behoort te wees. Deur hooggehalte studienotas met interaktiewe vasvrae te kombineer, verseker ons dat ons gebruikers ten volle voorbereid is om hul toetse die eerste keer te slaag.`,
    whyTitle: 'Waarom Ons Kies?',
    whyPoints: [
      'Omvattende Dekking: Van padtekens tot voertuigbeheer, ons dek alles.',
      'Interaktiewe Vasvrae: Toets jou kennis met ons tydbepaalde eksamenstylvrae.',
      'Oral Toeganklik: Studeer op jou foon, tablet of rekenaar.',
    ],
  },
  zu: {
    title: 'Mayelana Nathi',
    intro: `Siyakwamukela esizindeni seK53 Layisensi Yomfundi! Umgomo wethu ukuhlinzeka izinsiza zokufunda ezifinyelekayo, eziphelele futhi ezilula ukusetshenziswa zokuhlola i-K53 Layisensi Yomfundi yaseNingizimu Afrika.`,
    visionTitle: 'Umbono Wethu',
    vision: `Sikholelwa ukuthi ukufunda imithetho yomgwaqo kufanele kube ulwazi olujabulisayo nokwenza kalula. Ngokuhlanganiselana izinhlelo zokufunda ezinamandla nemibuzo yokuzivocavoca, siqinisekisa ukuthi abasebenzisi bethu bakulungele ngokuphelele ukudlula izivivinyo zabo okokuqala.`,
    whyTitle: 'Kungani Ukukhetha Thina?',
    whyPoints: [
      'Ukuphathwa Okugcwele: Kusuka emibalweni yomgwaqo kuya kulawulo lwezimoto, sikhuluma konke.',
      'Imibuzo Yokuzivocavoca: Hlola ulwazi lwakho ngemibuzo yethu yesikhathi, esikhathini sokuhlolwa.',
      'Ifikelekeka Noma Kuphi: Funda ngeselula lakho, ithabulethi noma ikhompuyutha.',
    ],
  },
  xh: {
    title: 'Malunga Nathi',
    intro: `Wamkelekile kwiqonga leLayisensi yoFundi weK53! Umsebenzi wethu kukubonelela ngezixhobo zokufunda ezifikelekayo, ezipheleleyo kwaye zilula ukusetyenziswa zomvavanyo weLayisensi yoFundi weK53 wase-Mzantsi Afrika.`,
    visionTitle: 'Umbono Wethu',
    vision: `Sikholelwa ukuba ukufunda imithetho yeendlela kufuneka kube yinto enokuchulumancisa enobulula. Ngokudibanisa amaxwebhu afanelekileyo nezifundo ezidlalisanayo, siqinisekisa ukuba abasebenzisi bethu balungele ngokupheleleyo ukudlula kuvavanyo lwabo lokuqala.`,
    whyTitle: 'Kutheni Ukukhetha Thina?',
    whyPoints: [
      'Ukufakelwa Ngokupheleleyo: Ukusuka kwizimpawu zeendlela ukuya kulawulo lwezithuthi, sithimba yonke into.',
      'Imibuzo Edlalisanayo: Vavanyo ulwazi lwakho ngembuzo yethu ebekiweyo yesivavanyo.',
      'Ifikelekeka Naphina: Funda ngomnxeba wakho, ithebhulethi okanye ikhompyutha.',
    ],
  },
  sot: {
    title: 'Mabapi le Rona',
    intro: `Re a leboha ho fihla lapeng la Laesense ya Moithuti wa K53! Maikemisetso a rona ke ho fana ka thepa ya ho ithuta e fihlellehang, e phethehileng le e bonolo ho sebetsa bakeng sa tlhatlhebo ya Laesense ya Moithuti wa K53 ya Afrika Borwa.`,
    visionTitle: 'Pono ya Rona',
    vision: `Re dumela hore ho ithuta melao ya tsela ho lokela ho ba boiphihlelo bo thabisang le bo bonolo. Ka ho kopanya dintlha tsa ho ithuta tse holimo le dipotso tsa ho itlwaetsa, re netefatsa hore basebedisi ba rona ba itokiselitse ka botlalo ho feta ditlhatlhebo tsa bona ka lekgetlo la pele.`,
    whyTitle: 'Hobaneng o Kgetha Rona?',
    whyPoints: [
      'Kakaretso e Phethehileng: Ho tswa meaho ya tsela ho ya taolo ya dikoloi, re akaretsa ntho tsohle.',
      'Dipotso tsa ho Itlwaetsa: Leka tsebo ya hao ka dipotso tsa rona tsa nako, mokgwa wa tlhatlhebo.',
      'E Fihlellehang Hohle: Ithuta ka mohala wa hao, thebeleteng kapa khomphiuthereng.',
    ],
  },
  ve: {
    title: 'Nga Ha Rine',
    intro: `Ri a livhuwa u swika kha ndangulo ya Layisensi ya Mutannu wa K53! Ndivho yashu ndi u nea zwithu zwa u ithuta zwi re khagala, zwi kwamaho na zwi pfufhaho kha u sedzulusa Layisensi ya Mutannu wa K53 ya Afrika Tshipembe.`,
    visionTitle: 'Pfanelo Yashu',
    vision: `Ri tenda uri u ithuta milayo ya nḓila zwi fanela u vha tshikolodo tshi fhatutshedziswaho na tshi pfufhaho. Nga u tshikaṋa maṅwalwa a ithuta a vhukuma na mbudziso dza u itela, ri tikedza uri vashumisi washu vho lungiselela nga u ḓifhaho u fhiwa khethululo dzavho lwa u thoma.`,
    whyTitle: 'Ndi Ngani U Khetha Rine?',
    whyPoints: [
      'U Kwamwa Nga u Ḓifha: U Bva kha zwiṅwalwa zwa nḓila u swika kha u langula tshikepe, ri kwama zwithu zwoṱhe.',
      'Mbudziso Dza u Itela: Linga nḓivho yau nga mbudziso dzashu dza tshifhinga, lwa u sedzulusiwa.',
      'I Kwamiwa Khavhuḓi: Ithuta nga foni yau, tabhulethe kana khomphyutha.',
    ],
  },
  ts: {
    title: 'Hi Hina',
    intro: `Mi amukeriwa eka ndhawu ya Layisensi ya Mudzidzi wa K53! Xikongomelo xa hina i ku nyika swifaniso swa ku dyondza leswi kumekaka, leswi heleleke naswona swi olova ku tirhisa eka nhlahluvo wa Layisensi ya Mudzidzi wa K53 wa Afrika-Dzonga.`,
    visionTitle: 'Vuhloxi Bya Hina',
    vision: `Hi tshembeka leswaku ku dyondza milawu ya ndlela hi fanele ku va ndlela yo tsakisa no olova. Hi ku hlanganisa tinhlamuselo ta ku dyondza ta nhlohlovo na swivutiso swa ku ringeta, hi tirhisa leswaku vashumisi va hina va lava ku lungela ku hlula ti-exam ta vona hi xikhetwa xa vutlhoni.`,
    whyTitle: 'Xana Wa Xana Hina?',
    whyPoints: [
      'Ku Katsa Hi Ku Helela: Ku sukela swivumbeko swa ndlela ku ya eka ku lawula tifambisi, hi kata swilo hinkwaswo.',
      'Swivutiso Swa ku Ringeta: Linga vutivi bya wena hi swivutiso swa hina swa nkarhi, ndhawu ya nhlahluvo.',
      'Yi Kumeka Nangampe: Dyondza hi foni ya wena, thaburethi kumbe khomputha.',
    ],
  },
  tn: {
    title: 'Ka Ga Rona',
    intro: `Re a amogela kwa Setlhaketlhakeng sa Laesense ya Moithuti wa K53! Maikaelelo a rona ke go naya disupa tsa go ithuta tse di fihlelelwang, tse di akaretsang le tse di bonolo go di dirisa go ya ka tlhatlhobo ya Laesense ya Moithuti wa K53 ya Aforika Borwa.`,
    visionTitle: 'Pono ya Rona',
    vision: `Re dumela gore go ithuta melao ya tsela go tshwanetse go nna maitemogelo a a itumedisang le a bonolo. Ka go kopanya dikwalo tsa go ithuta tse di kwa godimo le dipotso tsa go itlwaetsa, re netefatsa gore basebedisi ba rona ba itokiselitswe ka botlalo go feta ditshekatsheko tsa bone go simolola.`,
    whyTitle: 'Ke Goreng o Kgethile Rona?',
    whyPoints: [
      'Kakaretso e e Akaretsang: Go tswa go disupo tsa tsela go ya go taolo ya dikoloi, re akaretsa dilo tsotlhe.',
      'Dipotso tsa go Itlwaetsa: Leka kitso ya gago ka dipotso tsa rona tsa nako, mokgwa wa tlhatlhobo.',
      'E Fitlhelelwa Gongwe Goothe: Ithuta ka mogala wa gago, thebeleteng kana khomphiuthereng.',
    ],
  },
  nso: {
    title: 'Ka Ga Rena',
    intro: `Re a le amogela go Setseta sa Laesente ya Moithuti wa K53! Maikemišetšo a rena ke go fa dithuto tše di fihlelelwago, tše di phethagalago le tše di bonolo go di šomiša bakeng sa tlhatlhobo ya Laesente ya Moithuti wa K53 ya Afrika Borwa.`,
    visionTitle: 'Pono ya Rena',
    vision: `Re dumela gore go ithuta melao ya tsela go swanetše go ba maitemogelo a a kgahlišago le a bonolo. Ka go kopanya dingwalwa tša go ithuta tše di kwa godimo le dipotšišo tša go itlwaetša, re netefatša gore basomišedi ba rena ba itokišeditše gabotse go feta ditlemo tša bona lwa mathomo.`,
    whyTitle: 'Ke Goreng o Kgetha Rena?',
    whyPoints: [
      'Kakaretšo ye e Phethagalago: Go tswa go disupo tša tsela go ya go taolo ya dikoloi, re akaretša dilo tšohle.',
      'Dipotšišo tša go Itlwaetša: Leka tsebo ya gago ka dipotšišo tša rena tša nako, mokgwa wa tlhatlhobo.',
      'E Fihlelelwa Kwa Gongwe: Ithuta ka mogala wa gago, thabuleteng goba khomphiuthareng.',
    ],
  },
  ss: {
    title: 'Mayelana Nathi',
    intro: `Siyakwamukela ku-Platform yeLayisensi yeMfundi weK53! Inhloso yethu kuniketa tinsita tekufundza letifinyelelekako, letiphelele naleta lula kusetjentiswa lekuhlolwa kweLayisensi yeMfundi weK53 yaseNingizimu Afrika.`,
    visionTitle: 'Umbono Wetfu',
    vision: `Sikholwa kutsi kufundza imitsetfo yetigceme kufanele kube lwati lolutfokotisako nalolula. Ngekuhlanganyela tinchubomfundo letinhle nemibuzo yekuzijwayeza, siqinisekisa kutsi basebentisi betfu balungiselele ngokuphelele kudlula kuhlolwa kwabo mara yekucala.`,
    whyTitle: 'Indzaba Yakhetha Thina?',
    whyPoints: [
      'Kubandakanywa Lokuphelele: Kusukela emaphawu etigceme kuya ekulawuleni kwetimoto, sikhuluma konkhe.',
      'Imibuzo Yekuzijwayeza: Vivinya lwati lwakho ngemibuto yetfu yesikhathi, indlela yevivinyo.',
      'Ifinyeleleka Noma Kuphi: Fundza ngeselula lakho, ithabuleti noma ikhompyutha.',
    ],
  },
}

function getFor(lang: string): Translation {
  return TRANSLATIONS[lang] ?? TRANSLATIONS['en']
}

export default function TranslatableAbout({ lang }: { lang: string }) {
  const t = getFor(lang)

  return (
    <div className="prose prose-blue max-w-none text-gray-600">
      <p className="mb-4">{t.intro}</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">{t.visionTitle}</h2>
      <p className="mb-4">{t.vision}</p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">{t.whyTitle}</h2>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        {t.whyPoints.map(p => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  )
}
