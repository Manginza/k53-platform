/**
 * Seed script — DLTC Centers
 * Run AFTER migration 15: node scripts/seed-dltc-centers.mjs
 *
 * Coordinates are approximate (within ~2 km) — accurate enough for
 * proximity ranking without needing any external geocoding API.
 */

const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var first.')
  process.exit(1)
}

// [name, province, address, phone, lat, lng, isSmartHub]
const CENTERS = [
  // ─── GAUTENG ──────────────────────────────────────────────────────────────
  ['Sandton Testing Station',        'Gauteng', 'c/o 8th and 9th Street, Marlboro Gardens, Marlboro',                          '011 321-6372',     -26.0966, 28.1055, false],
  ['Waltloo Testing Station',        'Gauteng', '312 Petroleum Street, Waltloo',                                               '012 358-1262',     -25.7232, 28.3245, false],
  ['Centurion Test Ground',          'Gauteng', 'Nellmapius Drive, Irene, Centurion',                                         '012 665-2808',     -25.9021, 28.1927, false],
  ['Akasia Service Delivery Centre', 'Gauteng', 'Station Square Building, Cnr Daan De Wet Nel & Willem Cruywagen Streets',    '012 358-9999',     -25.6834, 28.1234, false],
  ['Saambou Service Delivery Centre','Gauteng', '227 Andries Street, Pretoria Central',                                       null,               -25.7485, 28.1875, false],
  ['Bronkhorstspruit Testing Station','Gauteng','Church Street, Bronkhorstspruit',                                             '013 932-6282',     -25.8083, 28.7438, false],
  ['Rayton Testing Station',         'Gauteng', 'c/o Oakley and Montrose Streets, Rayton',                                    '012 734-4501',     -25.7266, 28.5497, false],
  ['Midrand Testing Station',        'Gauteng', 'c/o Dale and Rainbow Road, Glen Austin, Midrand',                            '011 545-0900',     -25.9849, 28.0976, false],
  ['Randburg Testing Station',       'Gauteng', 'c/o Hans Strydom/Hans Schoeman Street, Malanshof, Randburg',                 '011 793-3792',     -26.0894, 27.9744, false],
  ['Randburg Licensing Department',  'Gauteng', '165 Hendrick Verwoerd Avenue, Randburg',                                     '011 886-0778',     -26.0960, 27.9990, false],
  ['Alberton Testing Station',       'Gauteng', 'c/o Bosworth and Fuchs Streets, Alrode, Alberton',                          '011 864-4602',     -26.2768, 28.1242, false],
  ['Babelegi Licensing Department',  'Gauteng', '14 Stand, NWDC Building, First Street, Babelegi',                           '012 719-8172',     -25.5100, 28.3500, false],
  ['Bedfordview Test Centre',        'Gauteng', 'Nicole Road, Bedfordview',                                                   '011 622-1410',     -26.1862, 28.1308, false],
  ['Benoni Testing Station',         'Gauteng', 'c/o Victoria and Tom Jones Road, Benoni',                                    '011 741-6530',     -26.1882, 28.3137, false],
  ['Boksburg Testing Centre',        'Gauteng', 'Reservoir Street, Boksburg',                                                 '011 899-4112',     -26.2148, 28.2400, false],
  ['Brakpan Testing Centre',         'Gauteng', '12 Short Street, Vulcania, Brakpan',                                        '011 741-2302',     -26.2385, 28.3642, false],
  ['Diepkloof Testing Station',      'Gauteng', '8642 Immik Drive, Funda Park, Zone 6, Diepkloof, Soweto',                   '011 933-3975',     -26.2449, 27.9268, false],
  ['East Rand Testing Station',      'Gauteng', '141 Northrand Road, Boksburg',                                               '011 894-6465',     -26.1800, 28.2150, false],
  ['Edenvale Testing Station',       'Gauteng', 'Van Riebeck Avenue, Edenvale',                                               '011 456-0174',     -26.1456, 28.1550, false],
  ['Esselen Park Testing Station',   'Gauteng', 'Road P91-1 (off R25), Esselenpark',                                         '011 929-1200',     -26.0300, 28.6800, false],
  ['Germiston Testing Station',      'Gauteng', 'Osborne Avenue, Wadeville, Germiston',                                      '011 874-5900',     -26.2400, 28.1600, false],
  ['Heidelberg Testing Station',     'Gauteng', '1 Louw Street, c/o Louw and HF Verwoerd, Heidelberg, Gauteng',             '016 340-4436',     -26.5011, 28.3577, false],
  ['Kempton Park Testing Station',   'Gauteng', 'Kelvin Street, Spartan, Kempton Park',                                      '011 921-2340',     -26.0872, 28.2238, false],
  ['Krugersdorp Testing Station',    'Gauteng', 'c/o Cartel and Miller Street, Krugersdorp',                                  '011 660-2207',     -26.0895, 27.7739, false],
  ['Langlaagte Testing Station',     'Gauteng', 'Main Reef Road, Langlaagte, Johannesburg',                                   '011 837-5527',     -26.2100, 27.9700, false],
  ['Meyerton Testing Station',       'Gauteng', 'Arie Norvall Street, Meyerton',                                              '016 360-7512',     -26.5592, 28.0119, false],
  ['Randfontein Testing Station',    'Gauteng', 'Retief Street, Westergloor, Randfontein',                                    '011 411-0161',     -26.1783, 27.7020, false],
  ['Springs Testing Centre',         'Gauteng', 'Diesel Road, Springs',                                                       '011 360-2417',     -26.2553, 28.4539, false],
  ['Vanderbijlpark Testing Centre',  'Gauteng', '2 Frederic Meyer Boulevard, Vanderbijlpark',                                 '016 950-5283',     -26.7022, 27.8333, false],
  ['Vereeniging Testing Station',    'Gauteng', 'Newton Street, Duncanville, Vereeniging',                                    '016 450-3013',     -26.6736, 27.9300, false],
  ['Westhoven Test Station',         'Gauteng', '27 Whitehall Street, Hursthill, Johannesburg',                               '011 495-2600',     -26.1879, 27.9741, false],
  ['Kliptown Testing Centre',        'Gauteng', 'Kliptown, Soweto',                                                           '011 342-4842',     -26.2726, 27.8981, false],
  ['Xavier Junction Testing Centre', 'Gauteng', 'Xavier Junction, Ormonde, Johannesburg',                                     '011 496-1960',     -26.2494, 27.9552, false],
  ['Tembisa Licensing Centre',       'Gauteng', 'Tembisa, Ekurhuleni',                                                        '011 256-8570',     -25.9970, 28.2285, false],
  ['Carletonville Testing Centre',   'Gauteng', 'Carletonville',                                                              '018 788-9739',     -26.3602, 27.3979, false],
  ['Florida DLTC',                   'Gauteng', 'Florida, Roodepoort',                                                        '011 758-6840',     -26.1744, 27.9092, false],
  ['Fochville Testing Centre',       'Gauteng', 'Fochville',                                                                  '018 788-9739',     -26.4814, 27.4855, false],
  ['Roodepoort Testing Station',     'Gauteng', 'Roodepoort',                                                                 '011 763-5439',     -26.1607, 27.8694, false],
  ['Sebokeng Testing Station',       'Gauteng', 'Sebokeng, Vereeniging',                                                      '016 450-3347',     -26.5766, 27.8294, false],
  ['Temba DLTC',                     'Gauteng', 'Temba, Hammanskraal',                                                        '012 717-2115',     -25.3942, 28.2755, false],
  ['Ekurhuleni Driver\'s Licence Office','Gauteng','Ekurhuleni',                                                              '011 999-3274',     -26.1673, 28.3041, false],
  ['RTMC NaTIS Facility',            'Gauteng', '13 Howick Close, Waterfall Park, Bekker Road, Midrand',                     '+27 11 266-2000',  -25.9989, 28.0884, false],
  // Gauteng Smart Hubs
  ['Umphakathi Mall Smart Hub',      'Gauteng', 'Umphakathi Mall, West Rand',                                                 null,               -26.1500, 27.8500, true],
  ['Denlyn Mall Smart Hub',          'Gauteng', 'Denlyn Mall, Mamelodi, Tshwane',                                             null,               -25.7700, 28.3800, true],
  ['Atteridgeville Mall Smart Hub',  'Gauteng', 'Atteridgeville Mall, Tshwane',                                               null,               -25.7893, 28.0671, true],
  ['Protea Glen Smart Hub',          'Gauteng', 'Protea Glen, Soweto, Johannesburg',                                          null,               -26.2927, 27.8437, true],
  ['Maponya Mall Smart Hub',         'Gauteng', 'Maponya Mall, Soweto, Johannesburg',                                         null,               -26.2696, 27.8982, true],
  ['Gautrain Midrand Station Smart Hub','Gauteng','Gautrain Midrand Station',                                                  null,               -25.9981, 28.1269, true],
  ['Gautrain Sandton Station Smart Hub','Gauteng','Gautrain Sandton Station',                                                  null,               -26.1064, 28.0543, true],
  ['Gautrain Centurion Station Smart Hub','Gauteng','Gautrain Centurion Station',                                              null,               -25.8616, 28.1887, true],

  // ─── WESTERN CAPE ─────────────────────────────────────────────────────────
  ['Stock Road DLTC',                'Western Cape','Stock Road, Bellville, Cape Town',                                       null,               -33.8924, 18.6124, false],
  ['Albertina DLTC',                 'Western Cape','60 Main Road, Riversdale',                                               '028 713-8000',     -34.0979, 21.2546, false],
  ['Ashton Traffic Office',          'Western Cape','Main Road, Ashton',                                                      '023 615-8000',     -33.8284, 20.0644, false],
  ['Atlantis DLTC',                  'Western Cape','Cnr Charel Uys Drive & Ivan Hampshire Road, Atlantis',                   '021 573-7900',     -33.5600, 18.4838, false],
  ['Beaufort-West DLTC',             'Western Cape','88 New Street, Beaufort-West',                                           '023 414-8159',     -32.3493, 22.5857, false],
  ['Bellville Bellrail DLTC',        'Western Cape','Station Road, Bellville, Cape Town',                                     '021 918-2041',     -33.9065, 18.6303, false],
  ['Bishop Lavis DLTC',              'Western Cape','Myrtle Road 100, Bishop Lavis, Cape Town',                               '021 935-0182',     -33.9466, 18.5734, false],
  ['Bonnievale DLTC',                'Western Cape','Main Road, Bonnievale',                                                  '023 616-2105',     -33.9655, 20.1048, false],
  ['Brackenfell DLTC',               'Western Cape','Cnr Reservoir & Kruis Road, Brackenfell, Cape Town',                     '021 980-1299',     -33.8728, 18.6932, false],
  ['Bredasdorp / Cape Agulhas DLTC', 'Western Cape','Cnr Ou Meule & Fabriek Street, Bredasdorp',                             '028 425-5500',     -34.5326, 20.0411, false],
  ['Caledon / Theewaterskloof DLTC', 'Western Cape','Cemetery Road, Caledon',                                                 '028 214-3300',     -34.2230, 19.4187, false],
  ['Calitzdorp DLTC',                'Western Cape','Voortrekker Road, Calitzdorp',                                           '044 213-3312',     -33.5325, 21.6879, false],
  ['Cape Town Gallows Hill DLTC',    'Western Cape','Somerset Road, Green Point, Cape Town',                                   '021 406-8819',     -33.9060, 18.4167, false],
  ['Ceres / Witzenberg DLTC',        'Western Cape','Voortrekker Road, Ceres',                                                '023 316-1997',     -33.3654, 19.3155, false],
  ['Citrusdal DLTC',                 'Western Cape','Lutz Street, Citrusdal',                                                 '022 921-2181',     -32.5883, 19.0149, false],
  ['Clanwilliam / Cederberg DLTC',   'Western Cape','2 Voortrekker Road, Clanwilliam',                                        '027 482-8000',     -32.1778, 18.8948, false],
  ['De Doorns DLTC',                 'Western Cape','Retiefstraat, De Doorns',                                                '023 356-3006',     -33.4742, 19.6712, false],
  ['Durbanville DLTC',               'Western Cape','De Villiers Drive, Durbanville, Cape Town',                               '021 970-3137',     -33.8350, 18.6470, false],
  ['Eastridge DLTC (Mitchell\'s Plain)','Western Cape','c/o Katdoring Street & 5th Ave, Eastridge, Mitchell\'s Plain, Cape Town','021 370-1521', -34.0408, 18.6212, false],
  ['Elsies River DLTC',              'Western Cape','Cnr Oasis & Ramone Street, Elsies River, Cape Town',                     '021 592-1158',     -33.9257, 18.5594, false],
  ['Franschhoek DLTC',               'Western Cape','Hugenote Street, Franschhoek',                                           '021 808-8700',     -33.9094, 19.1210, false],
  ['George / Pacaltsdorp DLTC',      'Western Cape','Mission Street, Pacaltsdorp, George',                                    '044 878-2400',     -33.9881, 22.4378, false],
  ['Gene Louw Traffic College',      'Western Cape','Brackenfell Boulevard, Brackenfell, Cape Town',                          '021 983-1500',     -33.8500, 18.7000, false],
  ['Goodwood DLTC',                  'Western Cape','Frans Conradie Drive, Goodwood, Cape Town',                              '021 590-1755',     -33.9019, 18.5495, false],
  ['Gordon\'s Bay DLTC',             'Western Cape','Grens Road, Gordon\'s Bay',                                              '021 856-2135',     -34.1639, 18.8592, false],
  ['Grabouw DLTC',                   'Western Cape','Ou Kaapweg, Grabouw',                                                    '021 859-2507',     -34.1536, 19.0094, false],
  ['Heidelberg DLTC (WC)',           'Western Cape','Niekerk Street, Heidelberg, Western Cape',                               '028 713-7886',     -34.0927, 20.9583, false],
  ['Hermanus / Overstrand DLTC',     'Western Cape','Mussel Street, Hermanus',                                                '028 313-8175',     -34.4215, 19.2360, false],
  ['Hillstar DLTC',                  'Western Cape','Plantation Road, Wetton, Cape Town',                                     '021 799-5113',     -34.0009, 18.5039, false],
  ['Knysna DLTC',                    'Western Cape','Clyde Street, Knysna',                                                   '044 302-6551',     -34.0370, 23.0430, false],
  ['Kuils River DLTC',               'Western Cape','Fabriek Street, Kuils River, Cape Town',                                 '021 900-1500',     -33.9300, 18.7270, false],
  ['Laingsburg Traffic Department',  'Western Cape','1 Van Riebeeck Street, Laingsburg',                                      '023 551-1110',     -33.1954, 20.8614, false],
  ['Lambertsbaai DLTC',              'Western Cape','Kerkstraat 42, Lambertsbaai',                                            '027 432-1112',     -32.0511, 18.3055, false],
  ['Lingelethu West DLTC',           'Western Cape','Resource Centre, Makhabane Road, Khayelitsha, Cape Town',                '021 364-0127',     -34.0406, 18.6846, false],
  ['Lutzville DLTC',                 'Western Cape','Du Toitstraat, Lutzville',                                               '027 213-1045',     -31.5610, 18.3576, false],
  ['Malmesbury / Swartland DLTC',    'Western Cape','Church Street, Malmesbury',                                              '022 482-2996',     -33.4597, 18.7288, false],
  ['Milnerton DLTC',                 'Western Cape','William Penn Drive, Milnerton, Cape Town',                               '021 550-1370',     -33.8690, 18.4980, false],
  ['Moorreesburg DLTC',              'Western Cape','Cnr Retief & Plein Street, Moorreesburg',                                '022 433-2246',     -33.1516, 18.6686, false],
  ['Mossel Bay DLTC',                'Western Cape','29 George Road, Mossel Bay',                                             '044 691-2051',     -34.1797, 22.1436, false],
  ['Murraysburg DLTC',               'Western Cape','23 Beaufort Street, Murraysburg',                                        '049 844-0007',     -31.9712, 23.7482, false],
  ['Prince Albert Traffic Department','Western Cape','Municipal Traffic Department, Prince Albert',                            '023 541-1648',     -33.2201, 22.0297, false],
  ['Robertson Traffic Office',       'Western Cape','Langeberg, Robertson',                                                   '023 626-8200',     -33.7994, 19.8752, false],
  ['Paarl Testing Station',          'Western Cape','Paarl, Drakenstein',                                                     '021 807-6200',     -33.7298, 18.9581, false],
  ['Saldanha Bay DLTC',              'Western Cape','Saldanha, Saldanha Bay',                                                 '022 701-7000',     -32.9812, 17.9461, false],
  ['Somerset West DLTC',             'Western Cape','Victoria Street, Somerset West',                                         '0860 103-089',     -34.0814, 18.8437, false],
  ['Stellenbosch DLTC',              'Western Cape','Stellenbosch',                                                           '021 808-8111',     -33.9321, 18.8602, false],
  ['Swellendam DLTC',                'Western Cape','Swellendam',                                                             '028 514-8500',     -34.0239, 20.4397, false],

  // ─── EASTERN CAPE ─────────────────────────────────────────────────────────
  ['Korsten DLTC',                   'Eastern Cape','Korsten, Gqeberha (Port Elizabeth)',                                     '041 506-1100',     -33.9614, 25.5900, false],
  ['Sidwell Traffic Department',     'Eastern Cape','Sidwell, Gqeberha (Port Elizabeth)',                                     '041 402-1000',     -33.9752, 25.6170, false],
  ['Kariega Traffic Department',     'Eastern Cape','Uitenhage, Kariega',                                                     '041 995-2700',     -33.7516, 25.3913, false],
  ['East London Traffic Department', 'Eastern Cape','East London',                                                            '043 705-9333',     -32.9952, 27.8920, false],
  ['Gonubie Traffic Department',     'Eastern Cape','Gonubie, East London',                                                   '043 705-9734',     -32.9478, 27.9720, false],
  ['Mdantsane Traffic Department',   'Eastern Cape','Mdantsane, East London',                                                 '043 705-9909',     -32.9540, 27.7733, false],
  ['Wilsonia Provincial Station',    'Eastern Cape','Wilsonia, East London',                                                  '043 745-2313',     -33.0182, 27.9023, false],
  ['King Williams Town Traffic',     'Eastern Cape','King Williams Town',                                                     '043 624-3628',     -32.8750, 27.3970, false],
  ['Kouga Traffic Department',       'Eastern Cape','Humansdorp, Kouga',                                                      '042 200-8350',     -34.0211, 24.7729, false],
  ['Butterworth Traffic Centre',     'Eastern Cape','Butterworth',                                                            '047 401-2400',     -32.3329, 28.1510, false],
  ['Makhanda Traffic Department',    'Eastern Cape','Grahamstown, Makhanda',                                                  '046 603-6067',     -33.3027, 26.5290, false],
  ['KSD Drivers Licence Testing Centre','Eastern Cape','Buttercup Road, Ngangelizwe, Mthatha',                               '047 501-4000',     -31.5839, 28.7900, false],
  ['Port Alfred Traffic Department', 'Eastern Cape','Port Alfred',                                                            '046 604-5569',     -33.5946, 26.8890, false],
  ['Cacadu Lady Frere DLTC',         'Eastern Cape','Indwe Road, Lady Frere, Emalahleni',                                    null,               -31.6987, 27.2319, false],

  // ─── KWAZULU-NATAL ────────────────────────────────────────────────────────
  ['Verulam DLTC',                   'KwaZulu-Natal','Lotusville, Verulam, Durban',                                           '031 311-2954',     -29.6435, 31.0467, false],
  ['Pinetown DLTC',                  'KwaZulu-Natal','1 Stockville Road, Tollgate, Pinetown, Durban',                         '031 792-6860',     -29.8213, 30.8549, false],
  ['KwaDukuza DLTC',                 'KwaZulu-Natal','King Shaka and Chota Road, KwaDukuza',                                  '032 437-5072',     -29.3167, 31.2833, false],
  ['Ballito DLTC',                   'KwaZulu-Natal','10 Leonora Drive, Ballito',                                             null,               -29.5390, 31.2054, false],
  ['Amanzimtoti DLTC',               'KwaZulu-Natal','Kingsway Street, Winklespruit, eManzimtoti',                            '031 916-7134',     -30.0547, 30.8754, false],
  ['Pietermaritzburg DLTC',          'KwaZulu-Natal','6 Van Eck Place, Mkondeni, Pietermaritzburg',                           '066 416-9742',     -29.6356, 30.3961, false],
  ['Richards Bay / Empangeni DLTC',  'KwaZulu-Natal','3 Bronze Street, Kuleka, Empangeni',                                    '035 787-1464',     -28.7200, 31.9000, false],
  ['Port Shepstone DLTC',            'KwaZulu-Natal','53 Wooley Street, Port Shepstone',                                      '039 688-2000',     -30.7430, 30.4530, false],
  ['Impendle DLTC',                  'KwaZulu-Natal','Thusong Centre, 21 Mafahleni Street, Impendle',                         '033 996-6000',     -29.6000, 29.9000, false],
  ['Alfred Duma / Ladysmith DLTC',   'KwaZulu-Natal','411 Murchison Street, Ladysmith',                                       '036 631-1777',     -28.5590, 29.7778, false],
  ['Dundee DLTC',                    'KwaZulu-Natal','Civic Centre, 64 Victoria Street, Dundee',                              '034 212-2121',     -28.1680, 30.2350, false],
  ['Newcastle DLTC',                 'KwaZulu-Natal','9 Industria Street, Newcastle',                                         '034 312-7161',     -27.7540, 29.9313, false],
  ['Abaqulusi DLTC (Vryheid)',        'KwaZulu-Natal','20 High Street, Vryheid',                                               '084 602-6522',     -27.7680, 30.7910, false],
  ['Dannhauser DLTC',                'KwaZulu-Natal','8 Church Street, Dannhauser',                                           '034 621-2666',     -28.0320, 30.0650, false],
  ['Edumbe DLTC (Paulpietersburg)',   'KwaZulu-Natal','Cnr Kambula & Natal Spa Road, Paulpietersburg',                         '034 995-1650',     -27.4300, 30.8110, false],
  ['Emadlangeni DLTC (Utrecht)',      'KwaZulu-Natal','Cnr Hoog & Van Rooyen Street, Utrecht',                                 '034 331-4180',     -27.6588, 30.3217, false],
  ['Mandeni DLTC',                   'KwaZulu-Natal','No. 2 Nkonjane Road, Sundumbili, Mandeni',                              '078 550-2247',     -29.1300, 31.3860, false],
  ['Greater Kokstad DLTC',           'KwaZulu-Natal','75 Hope Street, Kokstad',                                               '039 797-6603',     -30.5512, 29.4242, false],
  ['Mthonjaneni DLTC (Melmoth)',      'KwaZulu-Natal','Melmoth Area',                                                          '035 450-2614',     -28.6000, 31.3980, false],
  ['Umzinto Testing Ground',         'KwaZulu-Natal','Umzinto',                                                               '039 974-1120',     -30.3171, 30.6744, false],
  ['Scottburgh DLTC',                'KwaZulu-Natal','Scottburgh',                                                            '039 976-1202',     -30.2882, 30.7630, false],
  ['South Coast Test Centre',        'KwaZulu-Natal','South Coast Region, KwaZulu-Natal',                                     '039 315-0416',     -30.4000, 30.6000, false],
  ['Estcourt Traffic Department',    'KwaZulu-Natal','Estcourt',                                                              '036 342-7800',     -29.0048, 29.8868, false],
  ['Himeville / Underberg DLTC',     'KwaZulu-Natal','Himeville',                                                             '033 702-1060',     -29.7600, 29.5210, false],
  ['Hluhluwe Testing Station',       'KwaZulu-Natal','Hluhluwe',                                                              '035 562-3187',     -28.0167, 32.2756, false],
  ['Mtubatuba Traffic Department',   'KwaZulu-Natal','Mtubatuba',                                                             '035 550-0168',     -28.4130, 32.1670, false],
  ['Mkuze Department of Transport',  'KwaZulu-Natal','Mkuze',                                                                 '035 573-1071',     -27.6260, 32.0430, false],
  ['St Lucia Traffic Department',    'KwaZulu-Natal','St Lucia',                                                              '035 571-0021',     -28.3820, 32.4220, false],
  ['Umhlabuyalingana DLTC',          'KwaZulu-Natal','Sodwana Bay, Umhlabuyalingana',                                         '035 571-0574',     -27.5250, 32.7060, false],
  ['KwaZulu Test Centre',            'KwaZulu-Natal','Mobeni East, Durban',                                                   '031 467-3608',     -29.9700, 30.9800, false],

  // ─── FREE STATE ───────────────────────────────────────────────────────────
  ['Frankfort Traffic Department',   'Free State', 'Frankfort',                                                               '058 813-1860',     -27.2780, 28.4940, false],
  ['Heilbron Traffic Department',    'Free State', 'Heilbron',                                                                '058 853-1056',     -27.2692, 27.9680, false],
  ['Koppies Traffic Department',     'Free State', 'Koppies',                                                                 '056 777-1799',     -27.2302, 27.5827, false],
  ['Kroonstad Traffic Department',   'Free State', 'Kroonstad',                                                               '056 212-2178',     -27.6490, 27.2313, false],
  ['Parys Traffic Department',       'Free State', 'Parys',                                                                   '056 817-7172',     -26.9051, 27.4574, false],
  ['Sasolburg Traffic Department',   'Free State', 'Sasolburg',                                                               '016 976-0058',     -26.8139, 27.8147, false],
  ['Steynsrus Traffic Department',   'Free State', 'Steynsrus',                                                               '056 471-0003',     -27.6280, 28.0350, false],
  ['Viljoenskroon Traffic Department','Free State','Viljoenskroon',                                                            '056 343-2405',     -27.1864, 26.9659, false],
  ['Villiers Traffic Department',    'Free State', 'Villiers',                                                                '058 821-0010',     -27.0357, 28.5971, false],
  ['Vredefort Traffic Department',   'Free State', 'Vredefort',                                                               '056 931-0451',     -27.0044, 27.3672, false],
  ['Bethlehem Traffic Department',   'Free State', 'Bethlehem',                                                               '058 303-4802',     -28.2333, 28.3000, false],
  ['Clocolan Traffic Department',    'Free State', 'Clocolan',                                                                '051 943-0642',     -28.9273, 27.5785, false],
  ['Ficksburg Traffic Department',   'Free State', 'Ficksburg',                                                               '051 933-6095',     -28.8744, 27.8757, false],
  ['Fouriesburg Traffic Department', 'Free State', 'Fouriesburg',                                                             '058 223-0796',     -28.6200, 28.2100, false],
  ['Harrismith Traffic Department',  'Free State', 'Harrismith',                                                              '058 623-1968',     -28.2776, 29.1233, false],
  ['Kestell Traffic Department',     'Free State', 'Kestell',                                                                 '058 653-1327',     -28.3193, 28.6918, false],
  ['Lindley Traffic Department',     'Free State', 'Lindley',                                                                 '058 463-0241',     -27.8776, 27.9332, false],
  ['Marquard Traffic Department',    'Free State', 'Marquard',                                                                '051 991-0611',     -28.6600, 27.4350, false],
  ['Paul Roux Traffic Department',   'Free State', 'Paul Roux',                                                               '058 471-0323',     -28.3100, 27.9900, false],
  ['Petrus Steyn Traffic Department','Free State', 'Petrus Steyn',                                                            '058 871-3204',     -27.6700, 28.1400, false],
  ['Phuthaditjhaba Traffic Department','Free State','Phuthaditjhaba',                                                         '058 713-6824',     -28.5225, 28.8949, false],
  ['Reitz Traffic Department',       'Free State', 'Reitz',                                                                   null,               -27.7980, 28.4300, false],

  // ─── NORTHERN CAPE ────────────────────────────────────────────────────────
  ['Colesburg Traffic Department',   'Northern Cape','Colesburg',                                                              '054 753-8400',     -30.7161, 25.0954, false],
  ['De Aar Licencing & Traffic',     'Northern Cape','De Aar',                                                                 '053 632-9140',     -30.6500, 24.0142, false],
  ['Hopetown Traffic Testing',       'Northern Cape','Hopetown',                                                               '053 203-0008',     -29.6214, 24.0611, false],
  ['Orania Traffic Department',      'Northern Cape','Orania',                                                                 '053 207-0062',     -29.8105, 24.4099, false],
  ['Prieska Traffic Department',     'Northern Cape','Prieska',                                                                '053 492-3394',     -29.6680, 22.7450, false],
  ['Richmond Traffic Offices',       'Northern Cape','Richmond, Northern Cape',                                                '053 693-0652',     -29.8727, 23.9382, false],

  // ─── MPUMALANGA ───────────────────────────────────────────────────────────
  ['Piet Retief DLTC',               'Mpumalanga','44 Mark Street, Piet Retief',                                              null,               -27.0013, 30.8131, false],
  ['Secunda DLTC',                   'Mpumalanga','1 Manie Maritz Street, Secunda',                                           '017 620-6000',     -26.5256, 29.1714, false],
  ['Sabie DLTC',                     'Mpumalanga','Sabie Test Ground, Sabie',                                                 '013 764-1165',     -25.1010, 30.7859, false],
  ['Lydenburg DLTC',                 'Mpumalanga','78 Voortrekker Street, Lydenburg',                                         '013 235-2335',     -25.0987, 30.4581, false],
  ['Elukwatini DLTC',                'Mpumalanga','Elukwatini-A, Elukwatini',                                                 '082 101-0011',     -25.8533, 31.1289, false],
  ['White River DLTC',               'Mpumalanga','1 Indus Road, White River',                                                null,               -25.3286, 31.0050, false],
  ['Nelspruit / Mbombela DLTC',      'Mpumalanga','10 Suikerriet Street, Mbombela, Nelspruit',                                '013 690-6383',     -25.4715, 30.9853, false],
  ['Delmas DLTC',                    'Mpumalanga','Delmas',                                                                   '013 665-6000',     -26.1378, 28.6862, false],
  ['Standerton DLTC',                'Mpumalanga','75 Walter Sisulu Drive, Standerton',                                       '013 766-8027',     -26.9468, 29.2408, false],
  ['Malelane DLTC',                  'Mpumalanga','Malelane',                                                                 null,               -25.4720, 31.5483, false],
  ['Belfast DLTC',                   'Mpumalanga','80 Boult Street, eMakhazeni, Belfast',                                     '013 253-7600',     -25.6969, 30.0402, false],
  ['Libangeni DLTC',                 'Mpumalanga','R568 Road, Libangeni',                                                     '013 973-1101',     -24.7500, 31.7000, false],

  // ─── LIMPOPO ──────────────────────────────────────────────────────────────
  ['Mokopane DLTC',                  'Limpopo',   'Plot 82, Makhalakha Skop, N1 Road, Mokopane',                              '082 561-9077',     -24.0948, 28.9837, false],
  ['Mokopane Traffic Station',       'Limpopo',   '88 Oorlogsfontein, Mokopane',                                              '066 366-3964',     -24.1815, 29.0165, false],
  ['Polokwane DLTC',                 'Limpopo',   'Corner Rissik & Potgieter Street, Polokwane',                              null,               -23.9045, 29.4688, false],
  ['Polokwane Traffic Station',      'Limpopo',   'Polokwane',                                                                '066 473-8606',     -23.8960, 29.4499, false],
  ['Sibasa / Thohoyandou DLTC',      'Limpopo',   'Punda Maria Road, Sibasa, Thohoyandou',                                    '066 473-8661',     -22.9526, 30.4742, false],
  ['Makhado DLTC',                   'Limpopo',   '34 Erasmus Street, Makhado (Louis Trichardt)',                             '066 302-1409',     -23.1000, 29.9000, false],
  ['Northam DLTC',                   'Limpopo',   '24 Venter Street, Northam',                                                null,               -24.9389, 27.6583, false],
  ['Seshego DLTC',                   'Limpopo',   '9 Zone 4, Seshego, Polokwane',                                            '015 295-2599',     -23.8699, 29.4072, false],
  ['Lephalale Traffic Station',      'Limpopo',   '01 O R Tambo Drive, Lephalale',                                            '082 220-7200',     -23.6756, 27.7073, false],
  ['Driekop Traffic Station',        'Limpopo',   'Driekop',                                                                  '072 384-0990',     -24.4000, 30.0400, false],
  ['Moutse Traffic Station',         'Limpopo',   'Moutse',                                                                   '066 485-0264',     -24.8000, 29.6500, false],
  ['Pienaarsriver Traffic Station',  'Limpopo',   'N1 Road, Pienaarsriver',                                                   '066 366-3924',     -25.3400, 28.5600, false],

  // ─── NORTH WEST ───────────────────────────────────────────────────────────
  ['Mahikeng Traffic Department',    'North West','2559 Modiri Molema Street, Montshiwa Unit 2, Mahikeng',                    '018 384-0293',     -25.8555, 25.6450, false],
  ['Zeerust DLTC',                   'North West','Henryville, Zeerust',                                                      null,               -25.5477, 26.0748, false],
]

async function seed() {
  const rows = CENTERS.map(([name, province, address, phone, lat, lng, isSmartHub]) => ({
    name, province, address, phone: phone || null, lat, lng, is_smart_hub: isSmartHub,
  }))

  console.log(`Upserting ${rows.length} centers…`)

  const res = await fetch(`${SUPABASE_URL}/rest/v1/dltc_centers`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Seed failed:', err)
    process.exit(1)
  }

  console.log(`Done. HTTP ${res.status}`)
}

seed()
