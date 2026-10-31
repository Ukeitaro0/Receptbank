/* Startrecept. Alla mängder i "lines" är gram per MALLPORTION (en vuxen enligt mallen).
 * Appen skalar till hushållet (standard 3 vuxna + 2 matlådor + Viggo).
 * role: protein | fat | main | side | carb | other      raw: true = serveras rå
 * kid: kolhydrattillbehör – gram per barnportion (child) och per "vanlig" vuxen/storbarn (big).
 * steps: { t: text, wait: 'dötid – vad du kan göra' }
 */
window.SEED_RECIPES = [
  {
    id: 'lax-broccoli-palsternacka',
    title: 'Ugnslax med citron, rostad broccoli & palsternacka',
    why: 'Allt på en plåt, 10 min aktiv tid. Fryst laxfilé direkt från frysen funkar.',
    active: 10, total: 30, tags: ['fisk', 'en plåt'],
    lines: [
      { id: 'lax', g: 125, role: 'protein' },
      { id: 'olivolja', g: 15, role: 'fat', note: 'ringlas över grönsakerna före rostning' },
      { id: 'broccoli', g: 130, role: 'main' },
      { id: 'palsternacka', g: 100, role: 'carb' },
      { id: 'citron', g: 15, role: 'side' },
      { id: 'dill', g: 3, role: 'side', raw: true },
      { id: 'ruccola', g: 20, role: 'side', raw: true },
      { id: 'salt', g: 1, role: 'other' }
    ],
    kid: { id: 'potatis', child: 120, big: 250, how: 'Koka i saltat vatten ca 20 min medan plåten står i ugnen.' },
    steps: [
      { t: 'Ugnen på 225°. Sätt potatisvattnet på.' },
      { t: 'Skala och skär palsternackan i stavar, dela broccolin i buketter. Lägg på plåt, ringla över oljan, salta.' },
      { t: 'In i ugnen 10 min.', wait: '10 min – lägg i potatisen, duka.' },
      { t: 'Lägg laxen mitt på plåten, citronskivor ovanpå. In igen 12–15 min (fryst lax: 20 min, 175° i stället för 225° de sista 10 min).', wait: '12–15 min – Viggo-tid.' },
      { t: 'Toppa med dill och ruccola. Häll av potatisen.' }
    ],
    temp: 'Lax: 52–54° kärntemp (saftig), 56° om du vill ha den helt genomstekt.',
    box: 'Bra. Håller 2 dagar i kyl. Värm lax försiktigt (micro 50 %, 2 min) eller ät kall. Ruccola packas separat.',
    boxOk: true,
    upgrade: 'Rör ihop 1 msk kapris, citronzest och dill med lite olivolja och toppa laxen.',
    double: 'Rosta dubbelt med palsternacka – blir sallad till lunch dagen efter.',
    mageSwap: 'Byt broccolin mot haricots verts eller zucchini (samma ugnstid).'
  },
  {
    id: 'kyckling-rodcurry',
    title: 'Kycklingcurry med cashew, tomat, paprika & haricots verts',
    why: 'En gryta, 25 min. Krämig utan grädde eller kokos – mandelsmöret gör jobbet.',
    active: 20, total: 25, tags: ['gryta', 'kyckling'],
    lines: [
      { id: 'kycklingfile', g: 125, role: 'protein' },
      { id: 'rapsolja', g: 15, role: 'fat', note: 'stekning' },
      { id: 'cashew', g: 20, role: 'fat', note: 'rostade, strös över' },
      { id: 'mandelsmor', g: 10, role: 'fat', note: 'rörs ut i såsen' },
      { id: 'paprika', g: 80, role: 'main' },
      { id: 'haricots', g: 60, role: 'main' },
      { id: 'krossadetomater', g: 60, role: 'side' },
      { id: 'salladslok', g: 10, role: 'side', raw: true },
      { id: 'lime', g: 10, role: 'side' },
      { id: 'koriander', g: 3, role: 'side', raw: true },
      { id: 'ingefara', g: 5, role: 'side' },
      { id: 'vitlok', g: 3, role: 'side' },
      { id: 'currypasta', g: 8, role: 'other' },
      { id: 'fisksas', g: 5, role: 'other' }
    ],
    kid: { id: 'ris', child: 40, big: 90, how: 'Koka jasminriset först (12 min + 5 min vila under lock).' },
    steps: [
      { t: 'Sätt på riset.' },
      { t: 'Skär kycklingen i bitar, paprikan i strimlor. Riv ingefära och vitlök.' },
      { t: 'Rosta cashewnötterna torrt i grytan, häll upp.' },
      { t: 'Hetta oljan, fräs currypasta, ingefära och vitlök 1 min. Bryn kycklingen 3–4 min.' },
      { t: 'Rör ut mandelsmöret i de krossade tomaterna + ca 1 dl vatten per 4 portioner. Häll i med paprika och haricots verts. Sjud under lock 8 min.', wait: '8 min – plocka undan, duka.' },
      { t: 'Smaka av med fisksås och lime. Toppa med salladslök, koriander och nötter.' },
      { t: 'Viggo: ta upp hans portion innan chili/fisksås om det behövs.' }
    ],
    temp: 'Kyckling: 72° kärntemp i den tjockaste biten.',
    box: 'Mycket bra – blir godare dag 2. Håller 3 dagar. Packa nötter och koriander separat.',
    boxOk: true,
    upgrade: 'Toppa med thaibasilika och en klick turkisk yoghurt med limezest.',
    double: 'Laga dubbel sats kyckling – grytan fryser bra (utan nötter).'
  },
  {
    id: 'farsbiffar-spetskal',
    title: 'Färsbiffar (nöt + kyckling) med stekt spetskål, morötter & senapsrödlök',
    why: 'Husmanskost på 30 min. Halva färsen kyckling halverar det mättade fettet – smakar ändå biff.',
    active: 25, total: 30, tags: ['husman', 'budget'],
    lines: [
      { id: 'notfars', g: 62.5, role: 'protein' },
      { id: 'kycklingfars', g: 62.5, role: 'protein' },
      { id: 'rapsolja', g: 30, role: 'fat', note: 'hälften till biffarna, hälften till kålen' },
      { id: 'spetskal', g: 150, role: 'main' },
      { id: 'morot', g: 100, role: 'carb' },
      { id: 'rodlok', g: 20, role: 'side', raw: true },
      { id: 'persilja', g: 3, role: 'side', raw: true },
      { id: 'senap', g: 5, role: 'other' },
      { id: 'vinager', g: 5, role: 'other' },
      { id: 'salt', g: 1, role: 'other' }
    ],
    kid: { id: 'potatis', child: 120, big: 250, how: 'Kokas i samma kastrull som morötterna – morötterna i de sista 10 min.' },
    steps: [
      { t: 'Sätt på potatisen. Skiva rödlöken tunt, blanda med vinäger, senap och en nypa salt.' },
      { t: 'Blanda färserna, salta och peppra, forma biffar (ca 60 g styck).' },
      { t: 'Stek biffarna i hälften av oljan, 3–4 min per sida. Håll varma i ugn 100°.', wait: 'Medan biffarna steks: skär moroten och lägg den i potatisvattnet.' },
      { t: 'Strimla spetskålen, stek i resten av oljan i samma panna 4–5 min – den ska få färg men ha tugg kvar.' },
      { t: 'Servera med senapslöken och persilja.' }
    ],
    temp: 'Färs: 72° kärntemp.',
    box: 'Bra. Biffarna håller 3 dagar och fryser fint. Kålen blir mjukare men god.',
    boxOk: true,
    upgrade: 'Gör en snabb skysås: 1 dl buljong + 1 msk crème fraiche i stekpannan.',
    double: 'Dubbla biffarna och frys hälften – snabbmiddag en annan vecka.',
    mageSwap: 'Byt spetskålen mot haricots verts och rödlöken mot gräslök.'
  },
  {
    id: 'torsk-brynt-smor',
    title: 'Torsk med varm mandel- & kaprisolja och rostad blomkål',
    why: 'Restaurangkänsla på vardagspris, utan smör. Blomkålen rostar medan du gör annat.',
    active: 15, total: 30, tags: ['fisk', 'vardagslyx'],
    lines: [
      { id: 'torsk', g: 125, role: 'protein' },
      { id: 'olivolja', g: 15, role: 'fat', note: 'på blomkålen' },
      { id: 'olivolja', g: 15, role: 'fat', note: 'värms med mandel, kapris och citron' },
      { id: 'mandel', g: 10, role: 'fat', note: 'rostas i oljan' },
      { id: 'blomkal', g: 140, role: 'main' },
      { id: 'potatis', g: 50, role: 'carb' },
      { id: 'citron', g: 15, role: 'side' },
      { id: 'persilja', g: 3, role: 'side', raw: true },
      { id: 'kapris', g: 5, role: 'other' }
    ],
    kid: { id: 'potatis', child: 120, big: 250, how: 'Koka all potatis (även er 50 g) i samma kastrull.' },
    steps: [
      { t: 'Ugnen på 225°. Dela blomkålen i buketter, blanda med olivolja och salt, rosta 20–25 min.', wait: '20 min – sätt på potatisen, duka.' },
      { t: 'Lägg torsken i en smord form, salta, in i ugnen de sista 12–15 min (fryst: 20 min).' },
      { t: 'Värm oljan i en liten kastrull och rosta mandeln 1 min tills den är gyllene. Av från värmen, pressa i citron, rör ner kapris.' },
      { t: 'Ös oljan över fisk och blomkål, toppa med persilja.' }
    ],
    temp: 'Torsk: 50–52° kärntemp.',
    box: 'Okej, inte toppen – fisken torkar lätt. Packa oljan separat, värm på 50 % effekt.',
    boxOk: true,
    upgrade: 'Riv över pepparrot, eller brynt smör i stället för olja som helglyx (≈ +7 g mättat fett/portion).',
    mageSwap: 'Byt blomkålen mot rostad zucchini eller fänkål.'
  },
  {
    id: 'flaskfile-champinjon',
    title: 'Fläskfilé med champinjon- & dijonsky, haricots verts & rotselleri',
    why: 'Fläskfilé är snabbt, magert och oftast på extrapris. 30 min.',
    active: 25, total: 30, tags: ['kött', 'sås'],
    lines: [
      { id: 'flaskfile', g: 125, role: 'protein' },
      { id: 'olivolja', g: 30, role: 'fat', note: '1 msk stekning + 1 msk vispas in i skyn' },
      { id: 'haricots', g: 130, role: 'main' },
      { id: 'rotselleri', g: 100, role: 'carb' },
      { id: 'champinjoner', g: 60, role: 'side' },
      { id: 'gullok', g: 20, role: 'side' },
      { id: 'persilja', g: 2, role: 'side', raw: true },
      { id: 'buljong', g: 2, role: 'other' },
      { id: 'senap', g: 5, role: 'other' },
      { id: 'kryddor', g: 1, role: 'other', note: 'timjan' }
    ],
    kid: { id: 'potatis', child: 120, big: 250, how: 'Kokas parallellt, ca 20 min.' },
    steps: [
      { t: 'Ugnen på 200°. Skär rotsellerin i 2 cm tärningar, rosta 25 min med en skvätt av oljan och salt. Sätt på potatisen.', wait: '25 min – resten görs under tiden.' },
      { t: 'Bryn fläskfilén runt om i olja, 4–5 min. Lägg i ugnen bredvid rotsellerin tills 62°.' },
      { t: 'Stek champinjoner och hackad lök i samma panna. Häll på 1,5 dl vatten per 4 portioner, buljong, timjan och dijon. Koka ihop 5 min, vispa i resten av oljan på slutet.' },
      { t: 'Koka/ånga haricots verts 4 min.' },
      { t: 'Låt köttet vila 5 min, skiva, servera med såsen.' }
    ],
    temp: 'Fläskfilé: 62–65° kärntemp, vila 5 min.',
    box: 'Bra. Skiva köttet tunt, sås i egen burk. Håller 3 dagar.',
    boxOk: true,
    upgrade: 'En skvätt konjak eller portvin i skyn och färsk timjan. Grädde går, men ger ≈ +6 g mättat fett/portion.'
  },
  {
    id: 'halloumi-kikartor',
    title: 'Varm kikärtssallad med halloumi, ägg & rostad zucchini',
    why: 'Vegetarisk middag som mättar på riktigt. Billig, 25 min.',
    active: 15, total: 25, tags: ['vego', 'budget'],
    lines: [
      { id: 'kikartor', g: 100, role: 'protein' },
      { id: 'halloumi', g: 25, role: 'protein' },
      { id: 'agg', g: 55, role: 'protein' },
      { id: 'rapsolja', g: 15, role: 'fat', note: 'rostning + dressing' },
      { id: 'zucchini', g: 80, role: 'main' },
      { id: 'paprika', g: 60, role: 'main' },
      { id: 'tomat', g: 50, role: 'side', raw: true },
      { id: 'gurka', g: 40, role: 'side', raw: true },
      { id: 'rodlok', g: 15, role: 'side', raw: true },
      { id: 'persilja', g: 3, role: 'side', raw: true },
      { id: 'citron', g: 10, role: 'side' },
      { id: 'kryddor', g: 1, role: 'other', note: 'spiskummin, paprikapulver' }
    ],
    kid: { id: 'couscous', child: 30, big: 80, how: 'Häll kokande vatten över (1:1), lock på 5 min.' },
    steps: [
      { t: 'Ugnen på 225°. Skär zucchini och paprika i bitar, blanda med kikärtorna, 2/3 av oljan och kryddorna.' },
      { t: 'Rosta 20 min.', wait: '20 min – hacka tomat, gurka, rödlök, persilja.' },
      { t: 'Koka äggen 8 min, kyl i kallt vatten. Gör couscousen.' },
      { t: 'Skiva halloumin och stek den torrt i het panna, 1–2 min per sida.' },
      { t: 'Blanda allt, toppa med delade ägg, ringla över resten av oljan och citron.' }
    ],
    box: 'Bra kall som lunchsallad. Halloumin blir seg kall – värm den kort eller byt mot feta i lådan.',
    boxOk: true,
    upgrade: 'Granatäppelkärnor och en klick tahini-yoghurt.',
    mageSwap: 'Halvera kikärtorna och skölj dem väl, byt rödlöken mot gräslök.'
  },
  {
    id: 'korv-langpanna',
    title: 'Långpanna med kycklingklubbor, paprika, zucchini & sötpotatis',
    why: 'Billigaste kycklingen, allt i ugnen, 10 min aktiv tid. Perfekt en stökig tisdag.',
    active: 10, total: 45, tags: ['en plåt', 'budget', 'barnvänlig'],
    lines: [
      { id: 'kycklingklubba', g: 150, role: 'protein' },
      { id: 'rapsolja', g: 15, role: 'fat', note: 'på klubbor och grönsaker' },
      { id: 'paprika', g: 70, role: 'main' },
      { id: 'zucchini', g: 70, role: 'main' },
      { id: 'sotpotatis', g: 50, role: 'carb' },
      { id: 'rodlok', g: 30, role: 'side' },
      { id: 'persilja', g: 3, role: 'side', raw: true },
      { id: 'chili', g: 2, role: 'side' },
      { id: 'kryddor', g: 2, role: 'other', note: 'rökt paprika, oregano' }
    ],
    kid: { id: 'potatis', child: 120, big: 250, how: 'Potatisklyftor på en egen plåt samtidigt (lite olja, salt).' },
    steps: [
      { t: 'Ugnen på 225°. Skär sötpotatis i tärningar och potatis i klyftor (egen plåt).' },
      { t: 'Gnid in klubborna med hälften av oljan, salt och kryddorna. Lägg på plåten med sötpotatisen, in i ugnen.' },
      { t: 'Rosta 20 min.', wait: '20 min – skär paprika, zucchini och rödlök grovt.' },
      { t: 'Lägg i grönsakerna med resten av oljan, rosta 20 min till.', wait: '20 min – ledig tid.' },
      { t: 'Toppa med persilja och chili (chilin vid bordet för Viggo).' }
    ],
    temp: 'Kycklingklubbor: 80–85° vid benet.',
    box: 'Mycket bra. Håller 3 dagar, värms i micro 2 min.',
    boxOk: true,
    upgrade: 'Klick aioli på turkisk yoghurt + vitlök, och fetaostsmul.'
  },
  {
    id: 'notfarswok',
    title: 'Thaiwok med kycklingfärs, haricots verts & basilika',
    why: '15 min i stekpannan – snabbaste vardagsrätten i banken.',
    active: 15, total: 20, tags: ['snabb', 'wok'],
    lines: [
      { id: 'kycklingfars', g: 125, role: 'protein' },
      { id: 'sesamolja', g: 15, role: 'fat', note: 'stekning' },
      { id: 'cashew', g: 20, role: 'fat', note: 'rostade, strös över' },
      { id: 'haricots', g: 80, role: 'main' },
      { id: 'paprika', g: 60, role: 'main' },
      { id: 'salladslok', g: 15, role: 'side', raw: true },
      { id: 'vitlok', g: 5, role: 'side' },
      { id: 'chili', g: 3, role: 'side' },
      { id: 'basilika', g: 4, role: 'side', raw: true },
      { id: 'lime', g: 10, role: 'side' },
      { id: 'soja', g: 10, role: 'other' },
      { id: 'fisksas', g: 5, role: 'other' }
    ],
    kid: { id: 'ris', child: 40, big: 90, how: 'Koka riset först, 12 min + vila.' },
    steps: [
      { t: 'Sätt på riset. Rosta cashew torrt i pannan, häll upp.' },
      { t: 'Hetta sesamoljan rejält. Stek färsen smulig och med stekyta, 5 min.' },
      { t: 'Lägg i vitlök, chili, haricots och paprika, woka 4 min.' },
      { t: 'Soja, fisksås, lime. Av från värmen, vänd ner basilika och salladslök. Toppa med nötter.' }
    ],
    temp: 'Färs: genomstekt (72°).',
    box: 'Mycket bra. Håller 3 dagar. Nötter separat.',
    boxOk: true,
    upgrade: 'Ett stekt ägg med krispig kant ovanpå (gör "pad kra pao").',
    double: 'Stek dubbel sats färs – hälften blir taco/köttfärssås senare i veckan.'
  },
  {
    id: 'kycklinglar-fankal',
    title: 'Citronkyckling (lårfilé) med rostad fänkål, broccoli & morötter',
    why: 'Lårfilé blir aldrig torr – förlåtande för en stressig kväll.',
    active: 10, total: 35, tags: ['en plåt', 'kyckling'],
    lines: [
      { id: 'kycklinglar', g: 150, role: 'protein' },
      { id: 'olivolja', g: 15, role: 'fat', note: 'på plåten' },
      { id: 'fankal', g: 80, role: 'main' },
      { id: 'broccoli', g: 60, role: 'main' },
      { id: 'morot', g: 100, role: 'carb' },
      { id: 'citron', g: 20, role: 'side' },
      { id: 'vitlok', g: 5, role: 'side' },
      { id: 'kryddor', g: 1, role: 'other', note: 'timjan' }
    ],
    kid: { id: 'couscous', child: 30, big: 80, how: 'Kokande vatten över (1:1), lock på 5 min, precis innan servering.' },
    steps: [
      { t: 'Ugnen på 225°. Skär fänkål och morot i klyftor/stavar.' },
      { t: 'Lägg kyckling, fänkål, morot, citronklyftor och hela vitlöksklyftor på plåt. Olja, salt, timjan.' },
      { t: 'Rosta 25 min. Lägg broccolin på plåten de sista 10 min.', wait: '25 min – fri tid.' },
      { t: 'Gör couscousen. Pressa de rostade citronerna över allt.' }
    ],
    temp: 'Kycklinglår: 78–82° (då blir det mört).',
    box: 'Mycket bra. Håller 3 dagar. Funkar kallt.',
    boxOk: true,
    upgrade: 'Strö över fetaost och oliver de sista 5 min.',
    double: 'Lägg en extra plåt lårfilé – 0 min extra arbete, protein till två luncher.'
  },
  {
    id: 'fredagsburgare',
    title: 'Fredagsburgare med avokado, coleslaw & sötpotatisklyftor',
    why: 'Helgfredag som fortfarande följer mallen. Vi vuxna skippar brödet.',
    active: 30, total: 35, tags: ['fredag', 'barnvänlig'],
    lyx: true,
    lines: [
      { id: 'notfars', g: 62.5, role: 'protein' },
      { id: 'kycklingfars', g: 62.5, role: 'protein' },
      { id: 'avokado', g: 60, role: 'fat', note: 'skivad på burgaren' },
      { id: 'majonnas', g: 10, role: 'fat', note: 'i coleslawen' },
      { id: 'olivolja', g: 5, role: 'fat', note: 'på sötpotatisen' },
      { id: 'zucchini', g: 70, role: 'main', note: 'stekta skivor' },
      { id: 'spetskal', g: 60, role: 'main', raw: true, note: 'coleslaw' },
      { id: 'sotpotatis', g: 50, role: 'carb' },
      { id: 'romansallad', g: 20, role: 'side', raw: true },
      { id: 'tomat', g: 40, role: 'side', raw: true },
      { id: 'gurka', g: 30, role: 'side', raw: true },
      { id: 'rodlok', g: 10, role: 'side', raw: true },
      { id: 'salt', g: 1, role: 'other' }
    ],
    kid: { id: 'hamburgerbrod', child: 60, big: 120, how: 'Värm bröden i ugnen sista 3 min.' },
    steps: [
      { t: 'Ugnen på 225°. Sötpotatis i klyftor med oljan och salt, 25 min.', wait: '25 min – resten görs under tiden.' },
      { t: 'Coleslaw: strimla spetskålen fint, blanda med majonnäs, en skvätt vinäger och salt.' },
      { t: 'Blanda färserna, forma burgare (ca 125 g/vuxen, 50 g Viggo). Tryck platta.' },
      { t: 'Stek zucchiniskivor torrt i het panna, lägg åt sidan. Stek burgarna 3 min/sida.' },
      { t: 'Bygg: salladsblad som "bröd" för oss, bröd för barnen.' }
    ],
    temp: 'Färsburgare: 72°.',
    box: 'Dålig som matlåda – burgare + sallad blir sladdrigt. Gör i stället: stek 2 extra burgare och lägg dem på en matlådesallad med coleslaw separat.',
    boxOk: false,
    upgrade: 'Karamelliserad lök (15 min i stekpanna). En skiva lagrad cheddar går också – ≈ +5 g mättat fett.',
    mageSwap: 'Byt coleslawen mot en extra rad stekt zucchini och gurka.'
  },
  {
    id: 'vitloksrakor',
    title: 'Vitlöks- & chiliräkor med broccoli och zucchini',
    why: 'Frysta räkor + 15 min. Kändes som semester, kostar som vardag (nästan).',
    active: 15, total: 20, tags: ['snabb', 'fisk', 'vardagslyx'],
    lines: [
      { id: 'rakor', g: 150, role: 'protein' },
      { id: 'olivolja', g: 37.5, role: 'fat', note: 'stekning + ringlas över vid servering' },
      { id: 'broccoli', g: 80, role: 'main' },
      { id: 'zucchini', g: 60, role: 'main' },
      { id: 'vitlok', g: 5, role: 'side' },
      { id: 'chili', g: 3, role: 'side' },
      { id: 'citron', g: 15, role: 'side' },
      { id: 'persilja', g: 4, role: 'side', raw: true }
    ],
    kid: { id: 'pasta', child: 40, big: 100, how: 'Koka pastan (spaghetti) först. Viggo får räkor + pasta med lite av oljan, utan chili.' },
    steps: [
      { t: 'Tina räkorna i kallt vatten i ett durkslag. Sätt på pastavattnet.' },
      { t: 'Skär broccoli i små buketter och zucchini i halvmånar. Stek i hälften av oljan 5 min.' },
      { t: 'Skjut åt sidan, lägg i resten av oljan, skivad vitlök och chili, 30 sek. Lägg i räkorna, 2 min – bara varma.' },
      { t: 'Ringla över resten av oljan, pressa citron, toppa med persilja. Klart.' }
    ],
    box: 'Okej i 1 dag. Räkorna blir gummiaktiga vid hård uppvärmning – ät ljummen eller kall.',
    boxOk: true,
    upgrade: 'En skvätt vitt vin i pannan + chiliflakes och citronzest.'
  },
  {
    id: 'sej-fankal-tomat',
    title: 'Ugnsbakad sej med fänkål, tomat, oliver & mandelgremolata',
    why: 'Billigaste fisken i frysdisken, 10 min aktiv tid. Medelhavsfräsch.',
    active: 10, total: 30, tags: ['fisk', 'budget', 'en form'],
    lines: [
      { id: 'sej', g: 125, role: 'protein' },
      { id: 'olivolja', g: 30, role: 'fat', note: '1 msk i formen + 1 msk i gremolatan' },
      { id: 'mandel', g: 10, role: 'fat', note: 'hackad i gremolatan' },
      { id: 'fankal', g: 70, role: 'main' },
      { id: 'zucchini', g: 70, role: 'main' },
      { id: 'korsbarstomat', g: 60, role: 'side' },
      { id: 'oliver', g: 10, role: 'side' },
      { id: 'citron', g: 10, role: 'side' },
      { id: 'persilja', g: 3, role: 'side', raw: true },
      { id: 'vitlok', g: 3, role: 'side' }
    ],
    kid: { id: 'pasta', child: 40, big: 100, how: 'Koka orzo/liten pasta medan formen står i ugnen.' },
    steps: [
      { t: 'Ugnen på 200°. Skiva fänkål och zucchini tunt, lägg i en form med tomater, oliver, hälften av oljan och salt. In 10 min.', wait: '10 min – gör gremolatan: hacka mandel, persilja, vitlök, riv citronskal, blanda med resten av oljan.' },
      { t: 'Lägg sejen ovanpå, salta. In 15 min (fryst: 25 min).', wait: '15 min – koka pastan.' },
      { t: 'Toppa med gremolatan.' }
    ],
    temp: 'Sej: 50–52° kärntemp.',
    box: 'Bra. Håller 2 dagar. Gremolata separat.',
    boxOk: true,
    upgrade: 'Byt sejen mot torskrygg och lägg en tsk kapris i formen.'
  },
  {
    id: 'flaskkotlett-vitkal-apple',
    title: 'Fläskkotlett med stekt vitkål, äpple & rostade valnötter',
    why: 'Höstklassiker, billigast i banken. Vitkål och äpple är som billigast nu.',
    active: 25, total: 30, tags: ['höst', 'budget', 'husman'],
    lines: [
      { id: 'flaskkotlett', g: 125, role: 'protein' },
      { id: 'rapsolja', g: 15, role: 'fat', note: 'stekning kött + kål' },
      { id: 'valnot', g: 20, role: 'fat', note: 'rostade, över kålen' },
      { id: 'vitkal', g: 150, role: 'main' },
      { id: 'apple', g: 100, role: 'carb' },
      { id: 'gullok', g: 30, role: 'side' },
      { id: 'persilja', g: 2, role: 'side', raw: true },
      { id: 'senap', g: 5, role: 'other' },
      { id: 'kryddor', g: 1, role: 'other', note: 'kummin eller timjan' }
    ],
    kid: { id: 'potatis', child: 120, big: 250, how: 'Koka potatisen parallellt, ca 20 min.' },
    steps: [
      { t: 'Sätt på potatisen. Strimla vitkål och lök, skär äpplet i klyftor.' },
      { t: 'Stek kål och lök i hälften av oljan på medelvärme 10 min, äpplet de sista 3 min. Salta, kummin.', wait: 'Rör då och då – rosta valnötterna torrt i en annan panna.' },
      { t: 'Skär bort fettkanten på kotletterna. Stek i resten av oljan, 3 min per sida. Vila 3 min.' },
      { t: 'Toppa kålen med valnötterna, servera med en klick dijon.' }
    ],
    temp: 'Fläskkotlett: 63–65°.',
    box: 'Bra. Kålen blir godare dagen efter. Håller 3 dagar.',
    boxOk: true,
    upgrade: 'En klick crème fraiche rörd med senap (≈ +5 g mättat fett) eller färsk timjan stekt i oljan.',
    mageSwap: 'Byt vitkålen mot haricots verts eller zucchini och skippa löken.'
  },
  {
    id: 'rod-linssoppa',
    title: 'Röd linssoppa med paprika, tomat & smulad feta',
    why: 'Vego som fryser perfekt – laga en sats, ha 4 lådor i frysen.',
    active: 15, total: 35, tags: ['vego', 'soppa', 'budget', 'frys'],
    lines: [
      { id: 'linser', g: 25, role: 'protein' },
      { id: 'fetaost', g: 50, role: 'protein' },
      { id: 'rapsolja', g: 15, role: 'fat', note: 'fräsning' },
      { id: 'paprika', g: 80, role: 'main' },
      { id: 'blomkal', g: 60, role: 'main' },
      { id: 'krossadetomater', g: 100, role: 'side' },
      { id: 'gullok', g: 30, role: 'side' },
      { id: 'vitlok', g: 5, role: 'side' },
      { id: 'ingefara', g: 5, role: 'side' },
      { id: 'citron', g: 10, role: 'side' },
      { id: 'koriander', g: 3, role: 'side', raw: true },
      { id: 'buljong', g: 2, role: 'other' },
      { id: 'kryddor', g: 2, role: 'other', note: 'spiskummin, paprika' }
    ],
    kid: { id: 'surdegsbrod', child: 40, big: 100, how: 'Rostat bröd – inget att laga.' },
    steps: [
      { t: 'Fräs hackad lök, vitlök, ingefära och kryddor i oljan 3 min.' },
      { t: 'Lägg i paprika, blomkål, linser, krossade tomater, buljong och ca 2 dl vatten per portion.' },
      { t: 'Sjud under lock 20 min.', wait: '20 min – fri tid.' },
      { t: 'Mixa slät (eller låt vara rustik), smaka av med citron och salt.' },
      { t: 'Toppa med smulad feta och koriander.' }
    ],
    box: 'Utmärkt. Håller 4 dagar i kyl, fryser i 3 månader. Feta separat.',
    boxOk: true,
    upgrade: 'Toppa med chiliolja och rostade pumpafrön.',
    mageSwap: 'Byt blomkålen mot zucchini. Linserna är bara 25 g/portion – oftast snällt.'
  }
];

/* Färdiga förslag till Bygg din tallrik (gram per din portion). */
window.PLATE_PRESETS = {
  frukost: [
    { name: 'Min frukost: kvarg, valnötter, blåbär & BetaVivo', fav: true, items: [['kvarg', 175], ['valnot', 30], ['blabar', 50], ['bgflingor', 20]] },
    { name: 'Min frukost med yoghurt i stället för kvarg', items: [['yoghurt05', 175], ['valnot', 30], ['blabar', 50], ['bgflingor', 20]] },
    { name: 'Havregrynsgröt med blåbär & valnötter', items: [['havregryn', 40], ['havrekli', 10], ['blabar', 100], ['valnot', 15], ['havredryck', 150]] },
    { name: 'Turkisk yoghurt, hallon & pumpafrön', items: [['turkyog', 150], ['hallon', 100], ['pumpafron', 15]] },
    { name: 'Kvarg med äpple, kanel & mandel', items: [['kvarg', 200], ['apple', 100], ['mandel', 15]] },
    { name: 'Två ägg, avokado & tomat', items: [['agg', 110], ['avokado', 60], ['tomat', 100]] },
    { name: 'Knäcke med ägg & gurka', items: [['knackebrod', 24], ['agg', 55], ['gurka', 50], ['smor', 5]] }
  ],
  lunch: [
    { name: 'Tonfisksallad med ägg', items: [['tonfisk', 125], ['agg', 55], ['romansallad', 60], ['tomat', 100], ['gurka', 60], ['olivolja', 15]] },
    { name: 'Rökt makrill, rödbetor & ägg', items: [['roktmakrill', 125], ['rodbeta', 100], ['romansallad', 50], ['olivolja', 5]] },
    { name: 'Kikärtssallad med feta', items: [['kikartor', 100], ['fetaost', 50], ['gurka', 60], ['tomat', 100], ['olivolja', 15]] },
    { name: 'Linssoppa (fryslåda)', items: [['linser', 25], ['fetaost', 50], ['paprika', 80], ['krossadetomater', 100], ['olivolja', 15]] }
  ],
  middag: [
    { name: 'Kycklingfilé, broccoli & avokado', items: [['kycklingfile', 125], ['broccoli', 150], ['avokado', 60], ['olivolja', 15]] },
    { name: 'Lax med haricots verts', items: [['lax', 125], ['haricots', 150], ['olivolja', 15]] }
  ]
};
