/* Ingrediensdatabas – delas av Recept, Mallbyggare och Bygg din tallrik.
 *
 * n = näring per 100 g: [kcal, protein g, fett g, kolhydrat g, mättat fett g, kolesterol mg, betaglukan g]
 * p = ordinarie pris kr/kg (konventionellt), grova uppskattningar från vanlig svensk butik 2026.
 *
 * Valfria fält:
 *   g     proteingrupp 1–4          pg   mallens proteinmängd (g/portion)
 *   g4    mängd när den används som "plus"-protein i grupp 4 (ost/ägg)
 *   fu    gram per 1 × fettkälla    veg  'main' | 'side'
 *   carb  'rot' (100 g) | 'sot' (50 g) | 'gra50' (50 g) | 'gra20' (20 g)
 *   kid   true = kolhydrattillbehör (fritt för Viggo/storbarnen)
 *   nomall true = hör inte hemma i vuxenportionen (gluten, ris, majs)
 *   mage  true = möjlig magbov       dairy true = mejeri (gråzon)
 *   eco   pris kr/kg eko/KRAV/MSC    ecoTip  kort bedömning om eko är värt det
 *   pcs   gram per styck, pcsN = enhetsnamn    msk  gram per matsked
 *   a     avdelning i inköpslistan
 */
(function () {
  const A = { kott: 'Kött & fisk', gront: 'Frukt & grönt', mejeri: 'Mejeri & ägg', skafferi: 'Skafferi', frys: 'Frys', brod: 'Bröd' };

  const L = [];
  const ing = (id, name, cat, n, p, o = {}) => L.push(Object.assign({ id, name, cat, n, p }, o));

  /* ---------- PROTEIN grupp 1 – fetare ---------- */
  ing('blandfars', 'Blandfärs', 'protein', [230, 18, 17, 0, 7, 70, 0], 99, { g: 1, pg: 125, eco: 150, a: A.kott, ecoTip: 'Svensk räcker långt – eko är ett plus men inte nödvändigt.' });
  ing('flaskfars', 'Fläskfärs', 'protein', [220, 17, 17, 0, 6.5, 70, 0], 85, { g: 1, pg: 125, eco: 140, a: A.kott });
  ing('flaskkarre', 'Fläskkarré', 'protein', [200, 19, 14, 0, 5, 70, 0], 99, { g: 1, pg: 125, eco: 170, a: A.kott });
  ing('korv', 'Korv, hög kötthalt utan socker', 'protein', [250, 15, 21, 1, 8, 60, 0], 120, { g: 1, pg: 125, eco: 170, a: A.kott, ecoTip: 'Läs ingredienslistan – kötthalt ≥ 85 % och inget socker viktigare än eko.' });
  ing('roktmakrill', 'Rökt makrill', 'protein', [220, 19, 16, 0, 3.5, 70, 0], 180, { g: 1, pg: 125, a: A.kott });
  ing('lax', 'Lax, odlad filé (fryst)', 'protein', [200, 20, 13, 0, 2.5, 55, 0], 199, { g: 1, pg: 125, eco: 299, a: A.frys, ecoTip: 'ASC räcker oftast. KRAV-lax kostar ~50 % mer.' });
  ing('oring', 'Öring/fjällröding', 'protein', [160, 20, 8, 0, 2, 55, 0], 230, { g: 1, pg: 125, a: A.kott });
  ing('kycklinglar', 'Kycklinglårfilé', 'protein', [170, 18, 11, 0, 3, 95, 0], 110, { g: 1, pg: 150, eco: 220, a: A.kott, ecoTip: 'Kyckling är där eko/KRAV gör störst skillnad för djuren – men dubbla priset.' });
  ing('kycklingklubba', 'Kycklingklubbor', 'protein', [180, 18, 12, 0, 3.3, 95, 0], 60, { g: 1, pg: 150, eco: 120, a: A.kott, ecoTip: 'Billigaste kycklingen – vikten inkl. ben, räkna 150 g per portion.' });
  ing('agg', 'Ägg', 'protein', [140, 12.5, 10, 0.5, 2.8, 370, 0], 73, { g: 1, pg: 165, g4: 110, pcs: 55, pcsN: 'st', eco: 110, a: A.mejeri, ecoTip: 'Eko-ägg ~2 kr mer/st – billig uppgradering, värd det.' });
  ing('bacon', 'Bacon', 'protein', [300, 14, 27, 0, 10, 70, 0], 150, { g: 1, pg: 90, a: A.kott });

  /* ---------- PROTEIN grupp 2 – medel ---------- */
  ing('notfars', 'Nötfärs 12 %', 'protein', [190, 19, 12, 0, 5, 65, 0], 115, { g: 2, pg: 125, eco: 170, a: A.kott, ecoTip: 'Svensk nötfärs är redan bra. Gräsbete/eko om budgeten tillåter.' });
  ing('kycklingfars', 'Kycklingfärs', 'protein', [150, 18, 8, 0, 2.5, 80, 0], 105, { g: 2, pg: 125, a: A.kott });
  ing('kalkonfars', 'Kalkonfärs', 'protein', [140, 19, 7, 0, 2.2, 70, 0], 110, { g: 2, pg: 125, a: A.kott });
  ing('lammfars', 'Lammfärs', 'protein', [230, 17, 18, 0, 8, 75, 0], 160, { g: 2, pg: 125, a: A.kott });
  ing('flaskfile', 'Fläskfilé', 'protein', [110, 21, 3, 0, 1, 60, 0], 130, { g: 2, pg: 125, eco: 230, a: A.kott });
  ing('flaskkotlett', 'Fläskkotlett', 'protein', [180, 20, 11, 0, 4, 65, 0], 89, { g: 2, pg: 125, eco: 160, a: A.kott });
  ing('hogrev', 'Högrev', 'protein', [200, 19, 14, 0, 6, 65, 0], 170, { g: 2, pg: 125, a: A.kott });
  ing('entrecote', 'Entrecôte', 'protein', [230, 20, 17, 0, 7.5, 70, 0], 349, { g: 2, pg: 125, a: A.kott });
  ing('makrilltomat', 'Makrill i tomatsås (burk)', 'protein', [190, 13, 13, 5, 3, 60, 0], 120, { g: 2, pg: 125, a: A.skafferi });
  ing('sardiner', 'Sardiner i olivolja (avrunna)', 'protein', [210, 24, 12, 0, 2.5, 100, 0], 160, { g: 2, pg: 125, a: A.skafferi });

  /* ---------- PROTEIN grupp 3 – magert ---------- */
  ing('kycklingfile', 'Kycklingfilé', 'protein', [110, 23, 1.5, 0, 0.5, 60, 0], 120, { g: 3, pg: 125, eco: 260, a: A.kott, ecoTip: 'Eko-filé kostar dubbelt. Svensk konventionell är rimlig kompromiss.' });
  ing('kalkonfile', 'Kalkonfilé', 'protein', [105, 23, 1, 0, 0.4, 55, 0], 150, { g: 3, pg: 125, a: A.kott });
  ing('innanlar', 'Nötinnanlår', 'protein', [120, 22, 3.5, 0, 1.5, 60, 0], 240, { g: 3, pg: 125, a: A.kott });
  ing('algfars', 'Älgfärs', 'protein', [120, 22, 3, 0, 1.2, 60, 0], 260, { g: 3, pg: 125, a: A.frys });
  ing('torsk', 'Torskfilé (fryst, MSC)', 'protein', [75, 17, 0.7, 0, 0.1, 45, 0], 149, { g: 3, pg: 125, a: A.frys });
  ing('sej', 'Sejfilé (fryst, MSC)', 'protein', [80, 18, 0.8, 0, 0.15, 55, 0], 109, { g: 3, pg: 125, a: A.frys, ecoTip: 'Sej är vardagens billigaste vita fisk – MSC-märkt finns nästan alltid.' });
  ing('tonfisk', 'Tonfisk i vatten (avrunnen)', 'protein', [110, 25, 1, 0, 0.3, 45, 0], 150, { g: 3, pg: 125, a: A.skafferi });
  ing('rakor', 'Räkor, skalade (frysta)', 'protein', [90, 20, 1, 0, 0.2, 170, 0], 210, { g: 3, pg: 150, a: A.frys });

  /* ---------- PROTEIN grupp 4 – vegetariskt ---------- */
  ing('kikartor', 'Kikärtor, kokta (burk, avrunna)', 'protein', [140, 8, 2.5, 18, 0.3, 0, 0], 42, { g: 4, pg: 100, mage: true, a: A.skafferi });
  ing('svartabonor', 'Svarta bönor, kokta (avrunna)', 'protein', [130, 8, 0.5, 17, 0.1, 0, 0], 42, { g: 4, pg: 100, mage: true, a: A.skafferi });
  ing('linser', 'Röda linser, torra', 'protein', [340, 24, 1.5, 48, 0.2, 0, 0.1], 40, { g: 4, pg: 25, mage: true, a: A.skafferi });
  ing('fetaost', 'Fetaost/fårost', 'protein', [260, 14, 21, 1, 14, 70, 0], 120, { g4: 50, fu: 25, dairy: true, a: A.mejeri });
  ing('halloumi', 'Halloumi/grillost', 'protein', [320, 22, 25, 2, 16, 80, 0], 160, { g4: 50, fu: 25, dairy: true, a: A.mejeri });
  ing('mozzarella', 'Mozzarella', 'protein', [250, 18, 19, 1, 12, 60, 0], 110, { g4: 50, fu: 25, dairy: true, a: A.mejeri });
  ing('parmesan', 'Parmesan', 'fat', [390, 35, 27, 0, 17, 90, 0], 260, { g4: 35, fu: 25, dairy: true, a: A.mejeri });

  /* ---------- FETT ---------- */
  ing('olivolja', 'Olivolja', 'fat', [884, 0, 100, 0, 14, 0, 0], 120, { fu: 15, msk: 15, a: A.skafferi });
  ing('smor', 'Smör', 'fat', [740, 0.6, 82, 0.6, 52, 215, 0], 105, { fu: 15, msk: 15, dairy: true, eco: 140, a: A.mejeri });
  ing('ghee', 'Ghee', 'fat', [900, 0, 100, 0, 62, 256, 0], 300, { fu: 15, msk: 15, a: A.skafferi });
  ing('kokosolja', 'Kokosolja', 'fat', [860, 0, 99, 0, 82, 0, 0], 160, { fu: 15, msk: 15, a: A.skafferi });
  ing('sesamolja', 'Sesamolja, rostad', 'fat', [884, 0, 100, 0, 14, 0, 0], 250, { fu: 15, msk: 15, a: A.skafferi });
  ing('avokadoolja', 'Avokadoolja', 'fat', [884, 0, 100, 0, 12, 0, 0], 300, { fu: 15, msk: 15, a: A.skafferi });
  ing('majonnas', 'Majonnäs, egengjord', 'fat', [700, 1.5, 77, 0.5, 8, 60, 0], 80, { fu: 15, msk: 15, a: A.skafferi });
  ing('mandel', 'Mandel/mandelspån', 'fat', [600, 21, 52, 6, 4, 0, 0], 180, { fu: 20, msk: 10, a: A.skafferi });
  ing('cashew', 'Cashewnötter', 'fat', [580, 18, 46, 27, 8, 0, 0], 160, { fu: 20, msk: 10, a: A.skafferi });
  ing('valnot', 'Valnötter', 'fat', [690, 15, 65, 4, 6, 0, 0], 200, { fu: 20, msk: 10, a: A.skafferi });
  ing('pumpafron', 'Pumpafrön', 'fat', [560, 30, 47, 5, 9, 0, 0], 120, { fu: 20, msk: 10, a: A.skafferi });
  ing('solrosfron', 'Solrosfrön', 'fat', [600, 21, 51, 10, 5, 0, 0], 60, { fu: 20, msk: 10, a: A.skafferi });
  ing('sesamfron', 'Sesamfrön', 'fat', [590, 18, 50, 10, 7, 0, 0], 100, { fu: 20, msk: 10, a: A.skafferi });
  ing('chiafron', 'Chiafrön', 'fat', [490, 17, 31, 8, 3.3, 0, 0], 150, { fu: 20, msk: 10, a: A.skafferi });
  ing('tahini', 'Tahini', 'fat', [610, 17, 54, 10, 7.5, 0, 0], 120, { fu: 20, msk: 15, a: A.skafferi });
  ing('mandelsmor', 'Mandelsmör', 'fat', [620, 21, 55, 7, 4.5, 0, 0], 300, { fu: 20, msk: 15, a: A.skafferi });
  ing('vispgradde', 'Vispgrädde', 'fat', [340, 2, 36, 3, 23, 110, 0], 50, { fu: 25, msk: 15, dairy: true, a: A.mejeri });
  ing('cremefraiche', 'Crème fraiche 34 %', 'fat', [320, 2.4, 34, 3, 21, 100, 0], 60, { fu: 25, msk: 15, dairy: true, a: A.mejeri });
  ing('farskost', 'Färskost', 'fat', [250, 6, 24, 3, 16, 70, 0], 100, { fu: 25, msk: 15, dairy: true, a: A.mejeri });
  ing('hardost', 'Hårdost 28 % (präst/herrgård)', 'fat', [350, 27, 28, 0, 18, 85, 0], 110, { fu: 25, g4: 50, dairy: true, a: A.mejeri });
  ing('cheddar', 'Cheddar', 'fat', [400, 25, 33, 0, 21, 100, 0], 150, { fu: 25, dairy: true, a: A.mejeri });
  ing('kokosmjolk', 'Kokosmjölk', 'fat', [190, 1.8, 19, 3, 17, 0, 0], 45, { fu: 50, msk: 15, a: A.skafferi });
  ing('turkyog', 'Turkisk yoghurt 10 %', 'fat', [120, 4, 10, 4, 6.5, 30, 0], 45, { fu: 50, msk: 15, dairy: true, a: A.mejeri });
  ing('avokado', 'Avokado', 'fat', [160, 2, 15, 2, 2.1, 0, 0], 75, { fu: 60, pcs: 140, pcsN: 'st', a: A.gront });

  /* ---------- HUVUDGRÖNSAKER ---------- */
  ing('broccoli', 'Broccoli', 'veg', [34, 3, 0.4, 4, 0.1, 0, 0], 40, { veg: 'main', mage: true, pcs: 400, pcsN: 'huvud', eco: 70, a: A.gront, ecoTip: 'Sällan värt eko-priset.' });
  ing('broccolifryst', 'Broccoli, fryst', 'veg', [30, 3, 0.4, 3.5, 0.1, 0, 0], 32, { veg: 'main', mage: true, a: A.frys });
  ing('blomkal', 'Blomkål', 'veg', [25, 2, 0.3, 3, 0.1, 0, 0], 35, { veg: 'main', mage: true, pcs: 700, pcsN: 'huvud', a: A.gront });
  ing('haricots', 'Haricots verts (frysta)', 'veg', [30, 2, 0.2, 4, 0.05, 0, 0], 45, { veg: 'main', a: A.frys });
  ing('vaxbonor', 'Vaxbönor (frysta)', 'veg', [30, 2, 0.2, 4, 0.05, 0, 0], 45, { veg: 'main', a: A.frys });
  ing('paprika', 'Paprika', 'veg', [30, 1, 0.3, 5, 0.05, 0, 0], 50, { veg: 'main', pcs: 160, pcsN: 'st', a: A.gront });
  ing('zucchini', 'Zucchini', 'veg', [17, 1.2, 0.3, 2, 0.1, 0, 0], 30, { veg: 'main', pcs: 300, pcsN: 'st', a: A.gront });
  ing('spetskal', 'Spetskål', 'veg', [25, 1.3, 0.2, 4, 0.05, 0, 0], 25, { veg: 'main', mage: true, pcs: 800, pcsN: 'huvud', a: A.gront });
  ing('vitkal', 'Vitkål', 'veg', [25, 1.3, 0.1, 4, 0.05, 0, 0], 15, { veg: 'main', mage: true, a: A.gront });
  ing('rodkal', 'Rödkål', 'veg', [29, 1.4, 0.2, 5, 0.05, 0, 0], 20, { veg: 'main', mage: true, a: A.gront });
  ing('brysselkal', 'Brysselkål', 'veg', [43, 3.4, 0.3, 5, 0.1, 0, 0], 50, { veg: 'main', mage: true, a: A.gront });
  ing('gronkal', 'Grönkål', 'veg', [50, 4, 0.9, 5, 0.1, 0, 0], 60, { veg: 'main', mage: true, a: A.gront });
  ing('fankal', 'Fänkål', 'veg', [31, 1.2, 0.2, 4, 0.05, 0, 0], 50, { veg: 'main', pcs: 300, pcsN: 'st', a: A.gront });
  ing('sparris', 'Sparris, grön', 'veg', [20, 2.2, 0.1, 2, 0.05, 0, 0], 120, { veg: 'main', a: A.gront });
  ing('pakchoi', 'Pak choi', 'veg', [13, 1.5, 0.2, 1.2, 0.05, 0, 0], 70, { veg: 'main', a: A.gront });
  ing('aubergine', 'Aubergine', 'veg', [24, 1, 0.2, 4, 0.05, 0, 0], 40, { veg: 'main', a: A.gront });

  /* ---------- SIDOGRÖNSAKER ---------- */
  ing('spenat', 'Bladspenat, färsk', 'veg', [23, 2.9, 0.4, 1.1, 0.1, 0, 0], 80, { veg: 'side', a: A.gront });
  ing('ruccola', 'Ruccola', 'veg', [25, 2.6, 0.7, 2, 0.1, 0, 0], 150, { veg: 'side', a: A.gront });
  ing('romansallad', 'Romansallad/hjärtsallad', 'veg', [15, 1.2, 0.3, 2, 0.05, 0, 0], 50, { veg: 'side', a: A.gront });
  ing('gurka', 'Gurka', 'veg', [12, 0.6, 0.1, 2, 0.02, 0, 0], 25, { veg: 'side', pcs: 350, pcsN: 'st', a: A.gront });
  ing('tomat', 'Tomat', 'veg', [18, 0.9, 0.2, 3, 0.03, 0, 0], 35, { veg: 'side', pcs: 100, pcsN: 'st', a: A.gront });
  ing('korsbarstomat', 'Körsbärstomater', 'veg', [20, 0.9, 0.2, 3.5, 0.03, 0, 0], 60, { veg: 'side', a: A.gront });
  ing('krossadetomater', 'Krossade tomater (burk)', 'veg', [25, 1.2, 0.2, 4, 0.03, 0, 0], 25, { veg: 'side', a: A.skafferi });
  ing('gullok', 'Gul lök', 'veg', [40, 1.1, 0.1, 8, 0.02, 0, 0], 15, { veg: 'side', mage: true, pcs: 100, pcsN: 'st', a: A.gront });
  ing('rodlok', 'Rödlök', 'veg', [40, 1.1, 0.1, 8, 0.02, 0, 0], 20, { veg: 'side', mage: true, pcs: 100, pcsN: 'st', a: A.gront });
  ing('purjo', 'Purjolök', 'veg', [31, 1.5, 0.3, 5, 0.04, 0, 0], 35, { veg: 'side', mage: true, pcs: 300, pcsN: 'st', a: A.gront });
  ing('salladslok', 'Salladslök', 'veg', [32, 1.8, 0.2, 5, 0.03, 0, 0], 80, { veg: 'side', mage: true, pcs: 15, pcsN: 'st', a: A.gront });
  ing('vitlok', 'Vitlök', 'veg', [150, 6, 0.5, 30, 0.1, 0, 0], 80, { veg: 'side', mage: true, pcs: 5, pcsN: 'klyfta', a: A.gront });
  ing('champinjoner', 'Champinjoner', 'veg', [22, 3, 0.3, 0.5, 0.05, 0, 0], 50, { veg: 'side', a: A.gront });
  ing('citron', 'Citron', 'veg', [30, 1, 0.3, 6, 0.04, 0, 0], 30, { veg: 'side', pcs: 100, pcsN: 'st', a: A.gront });
  ing('lime', 'Lime', 'veg', [30, 0.7, 0.2, 7, 0.02, 0, 0], 50, { veg: 'side', pcs: 70, pcsN: 'st', a: A.gront });
  ing('dill', 'Dill', 'veg', [43, 3.5, 1, 4, 0.05, 0, 0], 400, { veg: 'side', a: A.gront });
  ing('persilja', 'Persilja', 'veg', [36, 3, 0.8, 4, 0.1, 0, 0], 400, { veg: 'side', a: A.gront });
  ing('koriander', 'Koriander', 'veg', [23, 2, 0.5, 2, 0.01, 0, 0], 400, { veg: 'side', a: A.gront });
  ing('basilika', 'Basilika', 'veg', [23, 3, 0.6, 1, 0.04, 0, 0], 400, { veg: 'side', a: A.gront });
  ing('graslok', 'Gräslök', 'veg', [30, 3, 0.7, 2, 0.1, 0, 0], 400, { veg: 'side', a: A.gront });
  ing('ingefara', 'Ingefära', 'veg', [80, 1.8, 0.8, 15, 0.2, 0, 0], 60, { veg: 'side', a: A.gront });
  ing('chili', 'Chili, färsk', 'veg', [40, 1.9, 0.4, 7, 0.04, 0, 0], 120, { veg: 'side', pcs: 10, pcsN: 'st', a: A.gront });
  ing('radisa', 'Rädisor', 'veg', [16, 0.7, 0.1, 2, 0.01, 0, 0], 60, { veg: 'side', a: A.gront });
  ing('surkal', 'Surkål', 'veg', [20, 1, 0.1, 3, 0.02, 0, 0], 60, { veg: 'side', a: A.skafferi });
  ing('oliver', 'Oliver (kalamata)', 'veg', [140, 1, 14, 0, 2, 0, 0], 130, { veg: 'side', a: A.skafferi });
  ing('selleri', 'Stjälkselleri', 'veg', [16, 0.7, 0.2, 2, 0.04, 0, 0], 40, { veg: 'side', a: A.gront });
  ing('sockerartor', 'Sockerärtor/sugar snaps', 'veg', [42, 2.8, 0.2, 7, 0.04, 0, 0], 130, { veg: 'side', a: A.gront });

  /* ---------- KOLHYDRAT enligt mallen ---------- */
  ing('morot', 'Morot', 'carb', [41, 0.9, 0.2, 8, 0.03, 0, 0], 15, { carb: 'rot', a: A.gront });
  ing('palsternacka', 'Palsternacka', 'carb', [75, 1.2, 0.3, 15, 0.05, 0, 0], 35, { carb: 'rot', a: A.gront });
  ing('rotselleri', 'Rotselleri', 'carb', [42, 1.5, 0.3, 7, 0.05, 0, 0], 30, { carb: 'rot', a: A.gront });
  ing('rodbeta', 'Rödbeta', 'carb', [43, 1.6, 0.2, 8, 0.03, 0, 0], 20, { carb: 'rot', a: A.gront });
  ing('kalrot', 'Kålrot', 'carb', [30, 1, 0.2, 6, 0.03, 0, 0], 15, { carb: 'rot', a: A.gront });
  ing('jordartskocka', 'Jordärtskocka', 'carb', [70, 2, 0.1, 15, 0.01, 0, 0], 80, { carb: 'rot', a: A.gront });
  ing('pumpa', 'Pumpa (butternut)', 'carb', [45, 1, 0.1, 10, 0.02, 0, 0], 30, { carb: 'rot', a: A.gront });
  ing('apple', 'Äpple', 'carb', [52, 0.3, 0.2, 12, 0.03, 0, 0], 25, { carb: 'rot', pcs: 150, pcsN: 'st', a: A.gront });
  ing('blabar', 'Blåbär (frysta)', 'carb', [44, 0.7, 0.3, 9, 0.03, 0, 0], 70, { carb: 'rot', a: A.frys });
  ing('hallon', 'Hallon (frysta)', 'carb', [42, 1.2, 0.3, 7, 0.02, 0, 0], 80, { carb: 'rot', a: A.frys });
  ing('sotpotatis', 'Sötpotatis', 'carb', [86, 1.6, 0.1, 18, 0.02, 0, 0], 35, { carb: 'sot', a: A.gront });
  ing('banan', 'Banan', 'carb', [90, 1.1, 0.3, 20, 0.1, 0, 0], 25, { carb: 'sot', pcs: 120, pcsN: 'st', a: A.gront });
  ing('potatis', 'Potatis', 'carb', [75, 2, 0.1, 16, 0.02, 0, 0], 15, { carb: 'gra50', kid: true, a: A.gront });
  ing('havregryn', 'Havregryn', 'carb', [370, 13, 7, 58, 1.2, 0, 4.5], 25, { carb: 'gra20', a: A.skafferi });
  ing('quinoa', 'Quinoa, torr', 'carb', [370, 14, 6, 64, 0.7, 0, 0], 70, { carb: 'gra20', a: A.skafferi });
  ing('bovete', 'Bovete, torr', 'carb', [345, 13, 3.4, 68, 0.7, 0, 0], 60, { carb: 'gra20', a: A.skafferi });
  ing('linspasta', 'Lins-/kikärtspasta, torr', 'carb', [340, 23, 2, 50, 0.3, 0, 0], 70, { carb: 'gra20', mage: true, a: A.skafferi });

  /* ---------- TILLBEHÖR Viggo / storbarnen ---------- */
  ing('ris', 'Jasminris, torrt', 'kid', [350, 7, 0.6, 78, 0.2, 0, 0], 30, { kid: true, nomall: true, a: A.skafferi });
  ing('pasta', 'Pasta, torr', 'kid', [355, 12, 1.5, 72, 0.3, 0, 0.2], 25, { kid: true, nomall: true, a: A.skafferi });
  ing('couscous', 'Couscous, torr', 'kid', [360, 12, 1.5, 72, 0.3, 0, 0.1], 30, { kid: true, nomall: true, a: A.skafferi });
  ing('bulgur', 'Bulgur, torr', 'kid', [350, 12, 1.5, 70, 0.3, 0, 0.3], 35, { kid: true, nomall: true, a: A.skafferi });
  ing('nudlar', 'Äggnudlar, torra', 'kid', [360, 13, 3, 70, 0.8, 40, 0], 50, { kid: true, nomall: true, a: A.skafferi });
  ing('surdegsbrod', 'Surdegsbröd', 'kid', [250, 8, 1.5, 48, 0.3, 0, 0.3], 60, { kid: true, nomall: true, a: A.brod });
  ing('hamburgerbrod', 'Hamburgerbröd', 'kid', [280, 9, 5, 48, 1.5, 0, 0], 55, { kid: true, nomall: true, pcs: 60, pcsN: 'st', a: A.brod });
  ing('tortilla', 'Tortillabröd', 'kid', [300, 8, 6, 50, 2, 0, 0], 60, { kid: true, nomall: true, pcs: 40, pcsN: 'st', a: A.brod });
  ing('pitabrod', 'Pitabröd', 'kid', [270, 9, 1.5, 55, 0.3, 0, 0], 50, { kid: true, nomall: true, pcs: 70, pcsN: 'st', a: A.brod });
  ing('knackebrod', 'Knäckebröd, råg', 'kid', [340, 9, 2, 60, 0.3, 0, 1.5], 50, { kid: true, nomall: true, pcs: 12, pcsN: 'st', a: A.brod });
  ing('havrebrod', 'Havrebröd (fullkorn)', 'kid', [240, 9, 4, 40, 0.6, 0, 1.2], 60, { kid: true, nomall: true, pcs: 35, pcsN: 'skiva', a: A.brod });

  /* ---------- ÖVRIGT (smak, frukost, lunch) ---------- */
  ing('salt', 'Salt & peppar', 'other', [0, 0, 0, 0, 0, 0, 0], 20, { a: A.skafferi });
  ing('soja', 'Japansk soja', 'other', [60, 8, 0, 6, 0, 0, 0], 90, { msk: 15, a: A.skafferi });
  ing('fisksas', 'Fisksås', 'other', [35, 5, 0, 4, 0, 0, 0], 100, { msk: 15, a: A.skafferi });
  ing('currypasta', 'Röd currypasta', 'other', [120, 2, 6, 15, 1, 0, 0], 300, { msk: 15, a: A.skafferi });
  ing('tomatpure', 'Tomatpuré', 'other', [80, 4, 0.5, 15, 0.1, 0, 0], 80, { msk: 15, a: A.skafferi });
  ing('senap', 'Dijonsenap', 'other', [100, 6, 7, 3, 0.4, 0, 0], 90, { msk: 15, a: A.skafferi });
  ing('kapris', 'Kapris', 'other', [25, 2, 0.9, 5, 0.2, 0, 0], 200, { msk: 10, a: A.skafferi });
  ing('buljong', 'Buljong (tärning/fond)', 'other', [100, 5, 5, 8, 2, 0, 0], 150, { pcs: 10, pcsN: 'tärning', a: A.skafferi });
  ing('kryddor', 'Torkade kryddor (paprika, spiskummin, timjan …)', 'other', [300, 12, 10, 40, 1.5, 0, 0], 300, { a: A.skafferi });
  ing('vinager', 'Vinäger/äppelcidervinäger', 'other', [20, 0, 0, 1, 0, 0, 0], 40, { msk: 15, a: A.skafferi });
  ing('mjolk', 'Mjölk 1,5 %', 'other', [46, 3.5, 1.5, 4.8, 0.9, 5, 0], 15, { dairy: true, a: A.mejeri });
  ing('havredryck', 'Havredryck', 'other', [45, 1, 1.5, 6.5, 0.2, 0, 0.4], 22, { a: A.mejeri });
  ing('kvarg', 'Kvarg, naturell', 'other', [60, 11, 0.2, 3.5, 0.1, 5, 0], 50, { dairy: true, a: A.mejeri });
  ing('filmjolk', 'Filmjölk 3 %', 'other', [60, 3.5, 3, 4.5, 1.9, 10, 0], 18, { dairy: true, a: A.mejeri });
  ing('havrekli', 'Havrekli', 'other', [380, 17, 7, 50, 1.3, 0, 8], 45, { a: A.skafferi });
  ing('kaffe', 'Kaffe med mjölkskvätt', 'other', [10, 0.5, 0.5, 0.7, 0.3, 2, 0], 12, { a: A.skafferi });

  window.DB = { list: L, aisles: A };
})();
