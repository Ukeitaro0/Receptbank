/* Receptbank – vardagsmiddagar enligt måltidsmallen + Bygg din tallrik.
 * Ren JS utan beroenden. All data sparas i webbläsarens localStorage.
 */
(() => {
  'use strict';

  /* ================= Grund ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString('sv-SE', { maximumFractionDigits: d });
  const kr = (x) => `${Math.round(x).toLocaleString('sv-SE')} kr`;
  const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'recept';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const KEY = 'receptbank.v1';
  const KID = 0.4; // Viggos portion av huvudrätten, i vuxenportioner
  const FAT_REQ = { 1: 1, 2: 2, 3: 2.5, 4: 1 };
  const GROUP_NAME = { 1: 'Fetare', 2: 'Medel', 3: 'Magert', 4: 'Vegetariskt' };
  const CARB_G = { rot: 100, sot: 50, gra50: 50, gra20: 20 };
  const CARB_NAME = { rot: 'rotfrukt/frukt/bär 100 g', sot: 'sötare rotfrukt/frukt 50 g', gra50: 'gråzon 50 g', gra20: 'gråzon 20 g' };
  const ROLE_NAME = { protein: 'Protein', fat: 'Fett', main: 'Huvudgrönsak', side: 'Sidogrönsak', carb: 'Kolhydrat', other: 'Övrigt' };
  const MEALS = ['frukost', 'lunch', 'middag'];
  const MEAL_NAME = { frukost: 'Frukost', lunch: 'Lunch', middag: 'Middag' };
  const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

  const DEFAULT_STATE = {
    v: 1,
    profile: {
      hh: { adults: 3, boxes: 2, kids: 1, big: 0 },
      likes: [],
      avoid: ['Aubergine'],
      allergies: [],
      viggo: [],
      equipment: ['Ugn', 'Stekpanna', 'Stektermometer'],
      ldl: true, satDinner: 7.5,
      satBudget: 19, cholGoal: 300, bgGoal: 3,
      costMin: 25, costMax: 45
    },
    recipes: {}, hidden: [], plan: {}, plates: {}, customIng: [], shop: {}
  };

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v) {
        const m = Object.assign(clone(DEFAULT_STATE), s);
        m.profile = Object.assign(clone(DEFAULT_STATE.profile), s.profile || {});
        m.profile.hh = Object.assign(clone(DEFAULT_STATE.profile.hh), (s.profile || {}).hh || {});
        return m;
      }
    } catch (e) { /* trasig data – börja om */ }
    return clone(DEFAULT_STATE);
  }
  let S = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* lagring saknas (t.ex. förhandsvisning) */ } };

  /* ================= Datum ================= */
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  const today = () => iso(new Date());
  const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
  const wdIdx = (s) => (parseISO(s).getDay() + 6) % 7;
  const dayName = (s) => DAYS[wdIdx(s)];
  const shortDate = (s) => parseISO(s).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  const mondayOf = (s) => addDays(s, -wdIdx(s));
  const weekDays = (offset = 0) => { const m = addDays(mondayOf(today()), offset * 7); return [...Array(7)].map((_, i) => addDays(m, i)); };
  function isoWeek(s) {
    const d = parseISO(s); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const w1 = new Date(d.getFullYear(), 0, 4, 12);
    return 1 + Math.round(((d - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  }

  /* ================= Ingredienser ================= */
  let ING = {};
  function rebuildIng() { ING = {}; DB.list.forEach((i) => (ING[i.id] = i)); S.customIng.forEach((i) => (ING[i.id] = i)); }
  rebuildIng();
  const ing = (id) => ING[id] || { id, name: `${id} (okänd)`, n: [0, 0, 0, 0, 0, 0, 0], p: 0, cat: 'other' };
  const allIng = () => Object.values(ING);
  const N0 = () => [0, 0, 0, 0, 0, 0, 0];
  function addN(acc, id, g, f = 1) { const n = ing(id).n; for (let i = 0; i < 7; i++) acc[i] += (n[i] * g * f) / 100; return acc; }
  const lineCost = (id, g, eco) => { const i = ing(id); return (((eco && i.eco) || i.p) * g) / 1000; };
  /* LDL-balans: fettkällor graderas efter mättat fett per 1 × fettkälla. */
  const satPerUnit = (i) => (i.n[4] * (i.fu || 15)) / 100;
  const fatTier = (i) => { const x = satPerUnit(i); return x <= 2.5 ? 'green' : x <= 5.5 ? 'yellow' : 'red'; };
  const TIER_NAME = { green: 'grönt – omättat', yellow: 'gult – ost/mejeri, max 1 × per dag', red: 'rött – mättat, bara smaksättning' };
  const tierDot = (i) => `<span class="fatdot t-${fatTier(i)}" title="${TIER_NAME[fatTier(i)]}: ${fmt(satPerUnit(i))} g mättat per fettkälla"></span>`;

  function roundG(g) {
    if (g <= 0) return 0;
    if (g < 10) return Math.max(1, Math.round(g));
    if (g < 100) return Math.round(g / 5) * 5;
    if (g < 1000) return Math.round(g / 10) * 10;
    return Math.round(g / 50) * 50;
  }
  const half = (x) => Math.round(x * 2) / 2;
  function amount(id, g) {
    const i = ing(id); const r = roundG(g);
    const w = r >= 1000 ? `${fmt(r / 1000, 2)} kg` : `${r} g`;
    if (i.msk && g <= 200) {
      const m = half(g / i.msk);
      if (m >= 0.5 && m <= 6) return `${fmt(m)} msk <span class="muted">(${w})</span>`;
    }
    if (i.pcs) {
      const p = i.pcs <= 15 ? Math.max(1, Math.round(g / i.pcs)) : half(g / i.pcs);
      const PL = { klyfta: 'klyftor', 'tärning': 'tärningar', skiva: 'skivor', huvud: 'huvuden' };
      if (p >= 0.5) return `${w} <span class="muted">(≈ ${fmt(p)} ${p > 1 ? PL[i.pcsN] || i.pcsN || 'st' : i.pcsN || 'st'})</span>`;
    }
    return w;
  }
  const amountText = (id, g) => amount(id, g).replace(/<[^>]+>/g, '');

  /* ================= Recept ================= */
  function allRecipes() {
    const m = {};
    SEED_RECIPES.forEach((r) => (m[r.id] = Object.assign({ seed: true }, r)));
    Object.values(S.recipes).forEach((r) => (m[r.id] = Object.assign({ seed: !!m[r.id], edited: !!m[r.id] }, r)));
    S.hidden.forEach((id) => delete m[id]);
    return Object.values(m).sort((a, b) => a.title.localeCompare(b.title, 'sv'));
  }
  const getRecipe = (id) => allRecipes().find((r) => r.id === id);
  const portions = (hh) => hh.adults + hh.boxes + hh.big + hh.kids * KID;

  function profileTokens() {
    return [...S.profile.avoid, ...S.profile.allergies].map((t) => t.trim().toLowerCase()).filter((t) => t.length >= 3);
  }
  function avoidHits(r) {
    const toks = profileTokens(); if (!toks.length) return [];
    const ids = [...(r.lines || []).map((l) => l.id), r.kid && r.kid.id].filter(Boolean);
    const hits = new Set();
    ids.forEach((id) => { const nm = ing(id).name.toLowerCase(); toks.forEach((t) => nm.includes(t) && hits.add(ing(id).name)); });
    toks.forEach((t) => r.title.toLowerCase().includes(t) && hits.add(t));
    return [...hits];
  }

  /* Mallcheck: räknar fram proteingrupp, fettkällor, grönsaker, kolhydrat, kostnad och flaggor. */
  function analyze(r) {
    const lines = r.lines || [];
    const n = N0(); let cost = 0, costEco = 0;
    lines.forEach((l) => { addN(n, l.id, l.g); cost += lineCost(l.id, l.g); costEco += lineCost(l.id, l.g, true); });
    const by = (role) => lines.filter((l) => l.role === role);
    const names = (ls) => ls.map((l) => `${ing(l.id).name} ${fmt(l.g, 0)} g`).join(', ');
    const rows = []; const notes = [];
    const pct = (x) => `${Math.round(x * 100)} %`;
    const inTol = (x, lo = 0.85, hi = 1.15) => x >= lo && x <= hi;

    /* Protein */
    const prot = by('protein');
    const legumes = prot.filter((l) => ing(l.id).g === 4);
    let group = null, fatReq = 0, protStatus = 'ok', protText = '';
    if (legumes.length) {
      group = 4; fatReq = FAT_REQ[4];
      const legR = legumes.reduce((s, l) => s + l.g / ing(l.id).pg, 0);
      const plus = prot.filter((l) => ing(l.id).g !== 4);
      const plusR = plus.reduce((s, l) => s + l.g / (ing(l.id).g4 || ing(l.id).pg || 50), 0);
      protText = names(prot);
      if (!inTol(legR)) { protStatus = 'warn'; notes.push(['warn', `Baljväxter ${pct(legR)} av mallens mängd (100 g kokta eller 25 g torra).`]); }
      if (!plus.length) { protStatus = 'warn'; notes.push(['warn', 'Grupp 4 ska kompletteras med ost (50 g / parmesan 35 g) eller 2 ägg.']); }
      else if (!inTol(plusR)) { protStatus = 'warn'; notes.push(['warn', `Ost/ägg-delen är ${pct(plusR)} av mallens mängd.`]); }
    } else if (prot.length) {
      const parts = prot.map((l) => { const i = ing(l.id); return { l, i, ratio: l.g / (i.pg || 125), grp: i.g || 2 }; });
      const tot = parts.reduce((s, p) => s + p.ratio, 0);
      fatReq = parts.reduce((s, p) => s + p.ratio * FAT_REQ[p.grp], 0) / (tot || 1);
      fatReq = Math.round(fatReq * 4) / 4;
      const main = parts.filter((p) => p.i.id !== 'bacon').sort((a, b) => b.ratio - a.ratio)[0] || parts[0];
      group = main.grp;
      protText = names(prot);
      const grps = new Set(parts.map((p) => p.grp));
      if (grps.size > 1 && !parts.some((p) => p.i.id === 'bacon')) notes.push(['info', 'Blandar proteingrupper – fettbehovet är viktat efter mängd.']);
      if (!inTol(tot)) { protStatus = 'warn'; notes.push(['warn', `Proteinmängden är ${pct(tot)} av mallen (${parts.map((p) => `${p.i.name} ${p.i.pg || 125} g`).join(' / ')}).`]); }
    } else { protStatus = 'err'; protText = 'Inget protein valt'; }
    rows.push({ k: 'Protein', v: group ? `<b>Grupp ${group}</b> ${GROUP_NAME[group].toLowerCase()} · ${esc(protText)}` : esc(protText), s: protStatus });

    /* Fett */
    const fats = by('fat');
    const fatUnits = fats.reduce((s, l) => s + l.g / (ing(l.id).fu || 15), 0);
    const fatOk = Math.abs(fatUnits - fatReq) <= 0.26;
    rows.push({ k: 'Fett', v: `<b>${fmt(fatUnits, 2)} av ${fmt(fatReq, 2)}</b> × fettkälla · ${fats.map((l) => tierDot(ing(l.id)) + esc(ing(l.id).name)).join(', ') || '–'}`, s: !fats.length && fatReq ? 'err' : fatOk ? 'ok' : 'warn' });
    if (!fatOk && fatReq) notes.push(['warn', fatUnits < fatReq ? `För lite fett: ${fmt(fatReq - fatUnits, 2)} fettkälla saknas per portion (t.ex. ${fmt((fatReq - fatUnits) * 15)} g olivolja).` : `För mycket fett: ${fmt(fatUnits - fatReq, 2)} fettkälla för mycket per portion.`]);

    /* Huvudgrönsak */
    const mains = by('main'); const carbs = by('carb');
    const mainG = mains.reduce((s, l) => s + l.g, 0);
    const [lo, hi] = carbs.length ? [100, 150] : [100, 300];
    let mStatus = mainG >= lo * 0.9 && mainG <= hi * 1.1 ? 'ok' : 'warn';
    if (!mains.length) mStatus = 'err';
    if (mains.length > 2) { mStatus = 'warn'; notes.push(['warn', 'Mallen säger 1–2 huvudgrönsaker.']); }
    if (mains.length && mStatus === 'warn' && mains.length <= 2) notes.push(['warn', `Huvudgrönsak ${roundG(mainG)} g/portion – mallen säger ${lo}–${hi} g${carbs.length ? '' : ' (utan kolhydrat får den vara upp till 300 g)'}.`]);
    const veg = [...mains, ...by('side')];
    if (veg.length && veg.every((l) => l.raw)) notes.push(['warn', 'Minst en grönsak ska vara tillagad.']);
    rows.push({ k: 'Huvudgrönsak', v: `<b>${fmt(mainG, 0)} g</b> · ${esc(mains.map((l) => ing(l.id).name).join(', ') || '–')}`, s: mStatus });

    /* Sidogrönsak */
    const sides = by('side');
    rows.push({ k: 'Sidogrönsak', v: esc(sides.map((l) => ing(l.id).name).join(', ') || '–'), s: sides.length ? 'ok' : 'info' });
    if (!sides.length) notes.push(['info', 'Ingen sidogrönsak – örter, citron eller sallad ger färg och crunch.']);

    /* Kolhydrat */
    let cStatus = 'ok', cText = '– (ingen, frivilligt)';
    if (carbs.length) {
      cText = carbs.map((l) => `${ing(l.id).name} ${fmt(l.g, 0)} g`).join(', ');
      if (carbs.length > 1) { cStatus = 'warn'; notes.push(['warn', 'Välj EN kolhydratkälla.']); }
      carbs.forEach((l) => {
        const i = ing(l.id);
        if (i.nomall) { cStatus = 'err'; notes.push(['err', `${i.name} hör inte hemma i er vuxenportion – lägg den som tillbehör till Viggo/storbarnen.`]); }
        else if (!i.carb) { cStatus = 'warn'; notes.push(['warn', `${i.name} finns inte på mallens kolhydratlista.`]); }
        else if (!inTol(l.g / CARB_G[i.carb], 0.8, 1.2)) { cStatus = 'warn'; notes.push(['warn', `${i.name}: mallen säger ${CARB_NAME[i.carb]}.`]); }
        if (i.carb && i.carb.startsWith('gra')) notes.push(['info', `${i.name} är gråzon i mallen.`]);
      });
      if (group === 4) { cStatus = 'warn'; notes.push(['warn', 'Vegetariskt protein (grupp 4): mallen skippar kolhydraten helt.']); }
    }
    rows.push({ k: 'Kolhydrat', v: esc(cText), s: cStatus });

    /* LDL-balans */
    if (S.profile.ldl) {
      const tgt = S.profile.satDinner;
      const sat = n[4];
      const sS = sat <= tgt ? 'ok' : sat <= tgt * 1.15 ? 'info' : 'warn';
      rows.push({ k: 'Mättat fett', v: `<b>${fmt(sat)} g</b> av max ${fmt(tgt)} g för middagen`, s: sS });
      const tierU = (t) => fats.filter((l) => fatTier(ing(l.id)) === t).reduce((a, l) => a + l.g / (ing(l.id).fu || 15), 0);
      const red = tierU('red'), yellow = tierU('yellow');
      if (red > 0.26) notes.push(['warn', `Rött fett ${fmt(red, 2)} × (smör/grädde/kokos): höjer LDL mest. Byt mot olivolja/rapsolja/nötter – ≤ 5 g som smaksättning går bra.`]);
      if (yellow > 1.01) notes.push(['info', `Gult fett ${fmt(yellow, 2)} × (ost/mejeri): sikta på max 1 × per dag.`]);
      if (sS === 'warn') notes.push(['warn', `Mättat fett ${fmt(sat)} g – över ${fmt(tgt)} g. Byt fettkälla till grönt eller välj magrare protein.`]);
      if (prot.some((l) => ing(l.id).fetkott)) notes.push(['info', 'Fett kött/chark – håll det till max 1 gång i veckan.']);
      if (n[5] > S.profile.cholGoal * 0.5) notes.push(['info', `Kolesterol ${Math.round(n[5])} mg/portion – över halva dagsmålet (${S.profile.cholGoal} mg).`]);
    }

    /* Mejeri-gråzon */
    const dairyUnits = fats.filter((l) => ing(l.id).dairy).reduce((s, l) => s + l.g / (ing(l.id).fu || 15), 0);
    const dairy = fatUnits > 0 && dairyUnits / fatUnits >= 0.5;
    if (dairy) notes.push(['info', `Mejeri-gråzon: ${fmt(dairyUnits, 2)} av ${fmt(fatUnits, 2)} fettkällor är mejeri. ${r.dairyAlt ? 'Mejerifritt: ' + r.dairyAlt : 'Byt t.ex. grädde/ost mot olivolja, kokosmjölk eller nötter.'}`]);

    /* Magkänsligt */
    const mageLines = lines.filter((l) => ing(l.id).mage);
    const mageG = mageLines.reduce((s, l) => s + l.g, 0);
    const mage = mageG >= 100;
    if (mage) {
      const nm = mageLines.map((l) => ing(l.id).name.toLowerCase());
      const gen = [nm.some((x) => /kål|broccoli/.test(x)) && 'kål → zucchini/haricots verts', nm.some((x) => /lök/.test(x)) && 'lök → gräslök', nm.some((x) => /ärt|bön|lins/.test(x)) && 'baljväxter → halvera, skölj väl'].filter(Boolean).join(', ');
      notes.push(['info', `Magkänsligt: ${nm.join(', ')} (${roundG(mageG)} g/portion). ${r.mageSwap || 'Byt ' + gen + '.'}`]);
    }

    /* Undvik / allergier */
    const avoid = avoidHits(r);
    if (avoid.length) notes.push(['err', `Innehåller något du undviker: ${avoid.join(', ')}.`]);

    /* Kostnad */
    const p = S.profile;
    if (cost > p.costMax) {
      const cur = prot[0] && ing(prot[0].id);
      let tip = '';
      if (cur && cur.g) {
        const alt = DB.list.filter((i) => i.g === cur.g && i.id !== cur.id && i.pg && (i.p * i.pg) / 1000 < lineCost(cur.id, prot[0].g) - 2)
          .sort((a, b) => a.p * a.pg - b.p * b.pg).slice(0, 2);
        if (alt.length) tip = ` Billigare i grupp ${cur.g}: ${alt.map((i) => `${i.name} (${kr((i.p * i.pg) / 1000)}/portion)`).join(', ')}.`;
      }
      notes.push(['warn', `${kr(cost)}/portion – över riktmärket ${p.costMin}–${p.costMax} kr.${tip}`]);
    }

    const level = rows.some((x) => x.s === 'err') || notes.some((x) => x[0] === 'err') ? 'err' : rows.some((x) => x.s === 'warn') || notes.some((x) => x[0] === 'warn') ? 'warn' : 'ok';
    return { n, cost, costEco, group, fatReq, fatUnits, mainG, rows, notes, dairy, mage, avoid, level };
  }

  /* ================= UI-hjälp ================= */
  const app = () => $('#app');
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  async function copyText(txt) {
    try { await navigator.clipboard.writeText(txt); toast('Kopierat'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove(); toast('Kopierat');
    }
  }
  const STATUS_ICON = { ok: '✓', info: 'ℹ', warn: '!', err: '✕' };
  const badge = (s) => `<span class="st st-${s}">${STATUS_ICON[s]}</span>`;
  const chip = (t, cls = '') => `<span class="chip ${cls}">${t}</span>`;
  const stepper = (key, val, min = 0) => `<span class="stepper" data-key="${key}"><button data-d="-1" ${val <= min ? 'disabled' : ''} aria-label="minska">−</button><b>${val}</b><button data-d="1" aria-label="öka">+</button></span>`;
  function costChip(cost) {
    const p = S.profile; const cls = cost > p.costMax ? 'chip-bad' : cost < p.costMin ? 'chip-good' : '';
    return chip(`${kr(cost)}/port`, cls);
  }
  function recipeChips(r, a) {
    const satC = S.profile.ldl ? chip(`mättat ${fmt(a.n[4])} g`, a.n[4] <= S.profile.satDinner ? 'chip-good' : a.n[4] > S.profile.satDinner * 1.15 ? 'chip-bad' : '') : '';
    return [a.group ? chip(`G${a.group} ${GROUP_NAME[a.group].toLowerCase()}`) : '', chip(`⏱ ${r.active} min aktiv`), costChip(a.cost), satC,
      r.lyx ? chip('✨ fredag', 'chip-lyx') : '', a.mage ? chip('mage', 'chip-info') : '', a.dairy ? chip('mejeri', 'chip-info') : '',
      a.avoid.length ? chip('undvik!', 'chip-bad') : '', r.boxOk === false ? chip('ej matlåda', 'chip-info') : ''].join('');
  }

  /* ================= Router ================= */
  function route() {
    const [h0, anchor] = (location.hash.replace(/^#\/?/, '') || 'vecka').split('#');
    const [path, qs] = h0.split('?');
    const parts = path.split('/').map(decodeURIComponent);
    const q = new URLSearchParams(qs || '');
    const views = { vecka: viewWeek, forslag: viewSuggest, recept: viewList, r: viewRecipe, bygg: viewBuilder, tallrik: viewPlate, inkop: viewShop, mer: viewMore };
    const v = views[parts[0]] || viewWeek;
    const tab = { r: 'recept', bygg: 'recept', inkop: 'vecka' }[parts[0]] || parts[0];
    $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
    v(parts.slice(1), q);
    const el = anchor && document.getElementById(anchor);
    if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
  }
  const go = (h) => { if (location.hash === h) route(); else location.hash = h; };

  /* ================= Vecka ================= */
  function viewWeek(_, q) {
    const off = +(q.get('w') || 0);
    const days = weekDays(off);
    let total = 0, count = 0;
    const rows = days.map((d) => {
      const r = S.plan[d] && getRecipe(S.plan[d]);
      const isToday = d === today();
      if (r) {
        const a = analyze(r); total += a.cost * portions(S.profile.hh) + kidCost(r, S.profile.hh); count++;
        return `<div class="day ${isToday ? 'today' : ''}">
          <div class="day-h"><b>${dayName(d)}</b> <span class="muted">${shortDate(d)}</span></div>
          <a class="day-r" href="#/r/${encodeURIComponent(r.id)}?d=${d}"><b>${esc(r.title)}</b><div class="chips">${recipeChips(r, a)}</div></a>
          <div class="day-a"><a class="btn sm ghost" href="#/forslag?d=${d}" title="Byt">↻</a><button class="btn sm ghost" data-unplan="${d}" title="Ta bort">✕</button></div>
        </div>`;
      }
      return `<div class="day empty ${isToday ? 'today' : ''}">
        <div class="day-h"><b>${dayName(d)}</b> <span class="muted">${shortDate(d)}</span></div>
        <div class="day-r muted">Ingen middag planerad</div>
        <div class="day-a"><a class="btn sm" href="#/forslag?d=${d}">Föreslå</a></div>
      </div>`;
    }).join('');
    app().innerHTML = `
      <div class="head-row">
        <a class="btn ghost" href="#/vecka?w=${off - 1}">‹</a>
        <h1>Vecka ${isoWeek(days[0])}${off === 0 ? '' : ''}</h1>
        <a class="btn ghost" href="#/vecka?w=${off + 1}">›</a>
      </div>
      ${off !== 0 ? `<p class="center"><a href="#/vecka">Till denna vecka</a></p>` : ''}
      <div class="days">${rows}</div>
      <div class="card sum">
        <div><span class="muted">Planerat</span><b>${count} middagar</b></div>
        <div><span class="muted">Kostnad, hela satser</span><b>${kr(total)}</b></div>
        <a class="btn" href="#/inkop?w=${off}">🛒 Inköpslista</a>
      </div>
      ${S.profile.ldl && count ? weekBalance(days) : ''}
      <p class="muted small">Satser räknas på ${hhText(S.profile.hh)} (ändras under Mer).</p>`;
    $$('[data-unplan]', app()).forEach((b) => b.onclick = () => { delete S.plan[b.dataset.unplan]; save(); route(); });
  }
  const hasP = (r, k) => r.lines.some((l) => l.role === 'protein' && ing(l.id)[k]);
  function weekBalance(days) {
    const rs = days.map((d) => S.plan[d] && getRecipe(S.plan[d])).filter(Boolean);
    const fish = rs.filter((r) => hasP(r, 'fisk')).length, fet = rs.filter((r) => hasP(r, 'fetkott')).length;
    const sat = rs.reduce((a, r) => a + analyze(r).n[4], 0) / rs.length;
    return `<div class="card balance"><h2>LDL-balans</h2><div class="kpis">
      <div class="${fish >= 2 ? 'good' : ''}"><span>Fisk</span><b>${fish} ggr</b><small>mål 2–3/vecka</small></div>
      <div class="${fet > 1 ? 'bad' : 'good'}"><span>Fett kött/chark</span><b>${fet} ggr</b><small>max 1/vecka</small></div>
      <div class="${sat > S.profile.satDinner ? 'bad' : 'good'}"><span>Mättat fett</span><b>${fmt(sat)} g</b><small>snitt/middag, max ${fmt(S.profile.satDinner)}</small></div>
    </div></div>`;
  }
  function hhText(hh) {
    const p = [`${hh.adults} vuxna`]; if (hh.boxes) p.push(`${hh.boxes} matlådor`); if (hh.kids) p.push(`${hh.kids} barn`); if (hh.big) p.push(`${hh.big} storbarn`);
    return `${p.join(' + ')} = ${fmt(portions(hh))} portioner`;
  }
  function kidCost(r, hh) { return r.kid ? lineCost(r.kid.id, kidGrams(r, hh)) : 0; }
  function kidGrams(r, hh) { return r.kid ? r.kid.child * hh.kids + r.kid.big * hh.big : 0; }

  /* ================= Förslag ================= */
  const SG = { d: null, maxTime: 40, group: 0, maxCost: 0, have: '', lyx: false, shown: [], seen: new Set(), key: '' };
  function haveTokens() { return SG.have.split(/[,\n]+|\s{2,}/).map((t) => t.trim().toLowerCase()).filter((t) => t.length >= 3); }
  function haveMatches(r) {
    const toks = haveTokens(); if (!toks.length) return [];
    const ids = [...r.lines.map((l) => l.id), r.kid && r.kid.id].filter(Boolean);
    const hit = new Set();
    ids.forEach((id) => { const nm = ing(id).name.toLowerCase(); toks.forEach((t) => (nm.includes(t) || t.includes(nm.split(/[ ,(]/)[0])) && hit.add(ing(id).name)); });
    return [...hit];
  }
  function candidates() {
    const wkOff = Math.round((parseISO(mondayOf(SG.d)) - parseISO(mondayOf(today()))) / (7 * 864e5));
    const wkOther = weekDays(wkOff).map((x) => x !== SG.d && S.plan[x] && getRecipe(S.plan[x])).filter(Boolean);
    const near = new Set(); for (let i = -10; i <= 10; i++) { const d = addDays(SG.d, i); if (i && S.plan[d]) near.add(S.plan[d]); }
    return allRecipes().map((r) => ({ r, a: analyze(r) })).filter(({ r, a }) =>
      !a.avoid.length && r.active <= SG.maxTime && (!SG.group || a.group === SG.group) && (!SG.maxCost || a.cost <= SG.maxCost))
      .map((c) => {
        const m = haveMatches(c.r);
        let score = Math.random() + m.length * 3;
        if (near.has(c.r.id)) score -= 4;
        if (SG.lyx && c.r.lyx) score += 3; if (!SG.lyx && c.r.lyx) score -= 1;
        if (wdIdx(SG.d) < 4 && c.r.active <= 15) score += 0.5;
        if (S.profile.ldl) {
          score -= Math.max(0, c.a.n[4] - S.profile.satDinner) * 0.6;
          if (hasP(c.r, 'fetkott') && wkOther.some((r) => hasP(r, 'fetkott'))) score -= 3;
          if (hasP(c.r, 'fisk') && wkOther.filter((r) => hasP(r, 'fisk')).length < 2) score += 1;
        }
        return Object.assign(c, { m, score });
      }).sort((a, b) => b.score - a.score);
  }
  function pickSuggestions() {
    const c = candidates();
    SG.shown = c.slice(0, 3).map((x) => x.r.id); SG.shown.forEach((id) => SG.seen.add(id));
  }
  function viewSuggest(_, q) {
    const d = q.get('d') || SG.d || today();
    if (d !== SG.d) { SG.d = d; SG.lyx = wdIdx(d) === 4; SG.seen = new Set(); SG.shown = []; }
    if (q.get('have') !== null && q.get('have') !== SG.have) { SG.have = q.get('have'); SG.shown = []; }
    if (!SG.shown.length) pickSuggestions();
    const days = weekDays(Math.round((parseISO(mondayOf(d)) - parseISO(mondayOf(today()))) / (7 * 864e5)));
    const cand = candidates(); const candMap = Object.fromEntries(cand.map((c) => [c.r.id, c]));
    const cards = SG.shown.map((id) => candMap[id] || (getRecipe(id) && { r: getRecipe(id), a: analyze(getRecipe(id)), m: haveMatches(getRecipe(id)) })).filter(Boolean).map(({ r, a, m }) => {
      const pick = (role) => r.lines.filter((l) => l.role === role).map((l) => ing(l.id).name).join(', ');
      return `<div class="card sugg">
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.why)}</p>
        <div class="chips">${recipeChips(r, a)}</div>
        <ul class="mini">
          <li><b>Protein</b> ${esc(pick('protein'))}</li>
          <li><b>Grönt</b> ${esc([pick('main'), pick('side')].filter(Boolean).join(' · '))}</li>
          <li><b>Kolhydrat</b> ${esc(pick('carb') || '–')}${r.kid ? ` · <span class="muted">Viggo: ${esc(ing(r.kid.id).name.toLowerCase())}</span>` : ''}</li>
        </ul>
        ${m.length ? `<p class="have">✓ Har hemma: ${esc(m.join(', '))}</p>` : ''}
        <div class="btns">
          <button class="btn primary" data-ok="${esc(r.id)}">Godkänn för ${dayName(SG.d).toLowerCase()}</button>
          <a class="btn ghost" href="#/r/${encodeURIComponent(r.id)}?d=${SG.d}&preview=1">Visa</a>
          <button class="btn ghost" data-next="${esc(r.id)}" title="Annat förslag">↻</button>
        </div>
      </div>`;
    }).join('');
    app().innerHTML = `
      <h1>Förslag</h1>
      <div class="card filters">
        <label>Dag <select id="sg-d">${days.map((x) => `<option value="${x}" ${x === SG.d ? 'selected' : ''}>${dayName(x)} ${shortDate(x)}${S.plan[x] ? ' ●' : ''}</option>`).join('')}</select></label>
        <label>Max aktiv tid <select id="sg-t">${[15, 20, 30, 40, 90].map((t) => `<option value="${t}" ${t === SG.maxTime ? 'selected' : ''}>${t === 90 ? 'Ingen gräns' : t + ' min'}</option>`).join('')}</select></label>
        <label>Protein <select id="sg-g"><option value="0">Alla</option>${[1, 2, 3, 4].map((g) => `<option value="${g}" ${g === SG.group ? 'selected' : ''}>G${g} ${GROUP_NAME[g].toLowerCase()}</option>`).join('')}</select></label>
        <label>Max kr/portion <select id="sg-c">${[0, 25, 35, 45].map((c) => `<option value="${c}" ${c === SG.maxCost ? 'selected' : ''}>${c ? c + ' kr' : 'Ingen gräns'}</option>`).join('')}</select></label>
        <label class="wide">Vad har du hemma? <input id="sg-h" placeholder="t.ex. kyckling, broccoli, paprika" value="${esc(SG.have)}"></label>
        <label class="check"><input type="checkbox" id="sg-l" ${SG.lyx ? 'checked' : ''}> Vardagslyx / fredag</label>
      </div>
      ${cards || `<div class="card empty-state"><p>Inget recept matchar filtren.</p><p><a href="#/bygg">Bygg ett eget i mallbyggaren</a></p></div>`}
      ${cand.length > 3 ? `<button class="btn ghost full" id="sg-all">↻ Tre nya förslag</button>` : ''}
      <p class="center small"><a href="#/bygg">+ Bygg eget enligt mallen</a> · <a href="#/mer#claude">Be Claude om ett nytt</a></p>`;
    const refilter = () => { SG.seen = new Set(); pickSuggestions(); route(); };
    $('#sg-d').onchange = (e) => go(`#/forslag?d=${e.target.value}`);
    $('#sg-t').onchange = (e) => { SG.maxTime = +e.target.value; refilter(); };
    $('#sg-g').onchange = (e) => { SG.group = +e.target.value; refilter(); };
    $('#sg-c').onchange = (e) => { SG.maxCost = +e.target.value; refilter(); };
    $('#sg-l').onchange = (e) => { SG.lyx = e.target.checked; refilter(); };
    $('#sg-h').onchange = (e) => { SG.have = e.target.value; refilter(); };
    const all = $('#sg-all'); if (all) all.onclick = () => {
      const c = candidates().filter((x) => !SG.seen.has(x.r.id));
      if (c.length < 3) SG.seen = new Set(SG.shown);
      SG.shown = (c.length >= 3 ? c : candidates().filter((x) => !SG.shown.includes(x.r.id))).slice(0, 3).map((x) => x.r.id);
      SG.shown.forEach((id) => SG.seen.add(id)); route();
    };
    $$('[data-next]', app()).forEach((b) => b.onclick = () => {
      let c = candidates().filter((x) => !SG.seen.has(x.r.id) && !SG.shown.includes(x.r.id));
      if (!c.length) { SG.seen = new Set(SG.shown); c = candidates().filter((x) => !SG.shown.includes(x.r.id)); }
      if (!c.length) return toast('Inga fler som matchar filtren');
      SG.shown[SG.shown.indexOf(b.dataset.next)] = c[0].r.id; SG.seen.add(c[0].r.id); route();
    });
    $$('[data-ok]', app()).forEach((b) => b.onclick = () => {
      S.plan[SG.d] = b.dataset.ok; save(); toast(`Planerad: ${dayName(SG.d)}`);
      go(`#/r/${encodeURIComponent(b.dataset.ok)}?d=${SG.d}`);
    });
  }

  /* ================= Receptlista ================= */
  let LIST_Q = '', LIST_G = 0;
  function viewList() {
    const rs = allRecipes().map((r) => ({ r, a: analyze(r) }));
    const t = LIST_Q.toLowerCase();
    const show = rs.filter(({ r, a }) => (!LIST_G || a.group === LIST_G) &&
      (!t || r.title.toLowerCase().includes(t) || r.lines.some((l) => ing(l.id).name.toLowerCase().includes(t)) || (r.tags || []).some((x) => x.includes(t))));
    app().innerHTML = `
      <div class="head-row"><h1>Recept</h1><a class="btn primary" href="#/bygg">+ Nytt</a></div>
      <input class="search" id="lq" placeholder="Sök recept, ingrediens eller tagg" value="${esc(LIST_Q)}">
      <div class="seg">${[0, 1, 2, 3, 4].map((g) => `<button data-g="${g}" class="${g === LIST_G ? 'on' : ''}">${g ? 'G' + g : 'Alla'}</button>`).join('')}</div>
      <div class="list">${show.map(({ r, a }) => `<a class="card item" href="#/r/${encodeURIComponent(r.id)}">
        <div class="item-t">${badge(a.level)} <b>${esc(r.title)}</b>${r.seed ? '' : ' <span class="muted small">(egen)</span>'}</div>
        <div class="chips">${recipeChips(r, a)}</div></a>`).join('') || '<p class="muted">Inga träffar.</p>'}</div>
      <p class="muted small center">${rs.length} recept · ✓ följer mallen · ! avvikelse att titta på</p>`;
    const lq = $('#lq'); lq.oninput = (e) => { LIST_Q = e.target.value; const pos = lq.selectionStart; viewList(); const n = $('#lq'); n.focus(); n.setSelectionRange(pos, pos); };
    $$('.seg button', app()).forEach((b) => b.onclick = () => { LIST_G = +b.dataset.g; viewList(); });
  }

  /* ================= Recept ================= */
  let VHH = clone(S.profile.hh);
  function viewRecipe(parts, q) {
    const r = getRecipe(parts[0]);
    if (!r) { app().innerHTML = '<p>Receptet finns inte.</p><a href="#/recept">Till recepten</a>'; return; }
    const d = q.get('d'); const preview = q.get('preview');
    const a = analyze(r); const P = portions(VHH);
    const totCost = a.cost * P + kidCost(r, VHH), totEco = a.costEco * P + (r.kid ? lineCost(r.kid.id, kidGrams(r, VHH), true) : 0);
    const roles = ['protein', 'fat', 'main', 'side', 'carb', 'other'];
    const ingRows = roles.map((role) => {
      const ls = r.lines.filter((l) => l.role === role); if (!ls.length) return '';
      return `<tr class="grp"><th colspan="2">${ROLE_NAME[role]}</th></tr>` + ls.map((l) => {
        const i = ing(l.id);
        return `<tr class="${role === 'fat' ? 'fatrow' : ''}"><td>${role === 'fat' ? tierDot(i) : ''}${esc(i.name)}${l.note ? ` <span class="muted small">– ${esc(l.note)}</span>` : ''}${l.raw ? ' <span class="muted small">(rå)</span>' : ''}</td><td class="num">${amount(l.id, l.g * P)}</td></tr>`;
      }).join('');
    }).join('');
    const fats = r.lines.filter((l) => l.role === 'fat');
    const fatRows = fats.map((l) => { const i = ing(l.id); const u = l.g / (i.fu || 15); return `<li>${tierDot(i)}<b>${esc(i.name)}</b> ${amount(l.id, l.g * P)}${l.note ? ` – ${esc(l.note)}` : ''} = <b>${fmt(u * P, 1)} ×</b> för satsen <span class="muted">(${fmt(u, 2)} × /portion)</span></li>`; }).join('');
    const kidG = kidGrams(r, VHH);
    const ecoTips = [...new Set([...r.lines.map((l) => l.id), r.kid && r.kid.id].filter((id) => id && ing(id).ecoTip))].map((id) => `<li><b>${esc(ing(id).name)}:</b> ${esc(ing(id).ecoTip)}</li>`).join('');
    const n = a.n; const satPct = Math.min(100, (n[4] / S.profile.satBudget) * 100);
    const planned = Object.keys(S.plan).filter((x) => S.plan[x] === r.id && x >= today()).sort()[0];

    app().innerHTML = `
      <a class="back" href="${d ? '#/vecka' : '#/recept'}">‹ ${d ? 'Veckan' : 'Recepten'}</a>
      <h1>${esc(r.title)}</h1>
      <p class="why">${esc(r.why)}</p>
      <div class="chips">${recipeChips(r, a)}${chip(`⏲ ${r.total} min totalt`)}</div>
      ${preview && d ? `<div class="card cta"><span>Passar den ${dayName(d).toLowerCase()}?</span><button class="btn primary" id="ok">Godkänn</button><a class="btn ghost" href="#/forslag?d=${d}">Tillbaka</a></div>` : ''}

      <section class="card">
        <h2>Mallcheck <span class="muted small">per vuxenportion</span></h2>
        <table class="check">${a.rows.map((x) => `<tr><td>${badge(x.s)}</td><th>${x.k}</th><td>${x.v}</td></tr>`).join('')}</table>
        ${a.notes.length ? `<ul class="notes">${a.notes.map(([s, t]) => `<li class="n-${s}">${badge(s)} ${esc(t)}</li>`).join('')}</ul>` : ''}
      </section>

      <section class="card">
        <h2>Ingredienser</h2>
        <div class="scaler">
          <label>Vuxna ${stepper('adults', VHH.adults)}</label>
          <label>Matlådor ${stepper('boxes', VHH.boxes)}</label>
          <label>Viggo ${stepper('kids', VHH.kids)}</label>
          <label>Storbarn ${stepper('big', VHH.big)}</label>
        </div>
        <p class="muted small">${hhText(VHH)} (barnportion ≈ ${KID} vuxen)</p>
        <table class="ing">${ingRows}</table>
        <div class="fatbox">
          <h3><span class="fatdot"></span> Fett i satsen – ${fmt(a.fatUnits * P, 1)} × fettkälla</h3>
          <ul>${fatRows || '<li>Inget tillsatt fett.</li>'}</ul>
          <p class="muted small">Mallen: grupp ${a.group || '–'} → ${fmt(a.fatReq, 2)} × per portion. Tillagnings- och tillbehörsfett räknas båda.${S.profile.ldl ? '<br><span class="fatdot t-green"></span>omättat <span class="fatdot t-yellow"></span>ost/mejeri <span class="fatdot t-red"></span>mättat' : ''}</p>
        </div>
      </section>

      ${r.kid ? `<section class="card">
        <h2>Tillbehör Viggo / storbarnen</h2>
        <p><b>${esc(ing(r.kid.id).name)}</b> – lagas separat, blandas aldrig i huvudrätten.</p>
        <ul class="plain">
          <li>Viggo: <b>${amount(r.kid.id, r.kid.child)}</b></li>
          <li>Storbarn/vuxen som äter "vanligt": <b>${amount(r.kid.id, r.kid.big)}</b> per person</li>
          ${kidG ? `<li>Totalt nu: <b>${amount(r.kid.id, kidG)}</b></li>` : '<li class="muted">Ingen satt till barn/storbarn just nu.</li>'}
        </ul>
        <p class="muted">${esc(r.kid.how)}</p>
      </section>` : ''}

      <section class="card">
        <h2>Gör så här</h2>
        <ol class="steps">${r.steps.map((s) => `<li>${esc(s.t)}${s.wait ? `<div class="wait">⏳ ${esc(s.wait)}</div>` : ''}</li>`).join('')}</ol>
        ${r.temp ? `<p class="temp">🌡 ${esc(r.temp)}</p>` : ''}
        ${r.double ? `<p class="double">×2 ${esc(r.double)}</p>` : ''}
      </section>

      <section class="card">
        <h2>Matlåda ${r.boxOk === false ? chip('passar dåligt', 'chip-bad') : ''}</h2>
        <p>${esc(r.box || '–')}</p>
      </section>

      <section class="card">
        <h2>Kostnad</h2>
        <div class="cost">
          <div><span class="muted">Hela satsen</span><b>${kr(totCost)}</b><span class="muted small">eko: ${kr(totEco)}</span></div>
          <div><span class="muted">Per vuxenportion</span><b>${kr(a.cost)}</b><span class="muted small">eko: ${kr(a.costEco)}</span></div>
          <div><span class="muted">Riktmärke</span><b>${S.profile.costMin}–${S.profile.costMax} kr</b><span class="small ${a.cost > S.profile.costMax ? 'bad' : 'good'}">${a.cost > S.profile.costMax ? 'Över' : 'Inom'}</span></div>
        </div>
        ${ecoTips ? `<h3>Eko – värt det?</h3><ul class="plain small">${ecoTips}</ul>` : ''}
        <p class="muted small">Ordinarie pris, grovt uppskattat. Priser kan ändras under Mer → Egna ingredienser.</p>
      </section>

      <section class="card">
        <h2>Näring per vuxenportion</h2>
        <div class="macros">
          <div><b>${Math.round(n[0])}</b><span>kcal</span></div><div><b>${fmt(n[1], 0)} g</b><span>protein</span></div>
          <div><b>${fmt(n[2], 0)} g</b><span>fett</span></div><div><b>${fmt(n[3], 0)} g</b><span>kolhydrat</span></div>
        </div>
        <div class="bar"><div style="width:${satPct}%" class="${n[4] > S.profile.satBudget * 0.5 ? 'amber' : ''}"></div></div>
        <p class="small">Mättat fett <b>${fmt(n[4])} g</b> = ${Math.round((n[4] / S.profile.satBudget) * 100)} % av dagsbudgeten ${S.profile.satBudget} g · Kolesterol ${Math.round(n[5])} mg · Betaglukan ${fmt(n[6])} g</p>
      </section>

      ${r.upgrade ? `<section class="card lyx"><h2>✨ Vardagslyx-växeln</h2><p>${esc(r.upgrade)}</p></section>` : ''}

      <div class="actions">
        <label class="planner">Planera <select id="plan-d"><option value="">välj dag…</option>${[...weekDays(0), ...weekDays(1)].map((x) => `<option value="${x}" ${x === (d || planned) ? 'selected' : ''}>${dayName(x)} ${shortDate(x)}${S.plan[x] && S.plan[x] !== r.id ? ' (upptagen)' : ''}</option>`).join('')}</select></label>
        <button class="btn" id="to-plate">🍽 Lägg på tallriken</button>
        <a class="btn ghost" href="#/bygg/${encodeURIComponent(r.id)}">✎ Redigera</a>
        <button class="btn ghost" id="cp">⧉ Kopiera som text</button>
        <button class="btn ghost" id="save-hh">Spara portioner som standard</button>
      </div>`;

    $$('.stepper', app()).forEach((s) => $$('button', s).forEach((b) => b.onclick = () => {
      VHH[s.dataset.key] = Math.max(0, VHH[s.dataset.key] + +b.dataset.d); const y = window.scrollY; route(); window.scrollTo(0, y);
    }));
    const ok = $('#ok'); if (ok) ok.onclick = () => { S.plan[d] = r.id; save(); toast(`Planerad: ${dayName(d)}`); go(`#/r/${encodeURIComponent(r.id)}?d=${d}`); };
    $('#plan-d').onchange = (e) => { if (!e.target.value) return; S.plan[e.target.value] = r.id; save(); toast(`Planerad: ${dayName(e.target.value)} ${shortDate(e.target.value)}`); };
    $('#to-plate').onclick = () => {
      const day = d || today(); const pl = plate(day);
      pl.middag = pl.middag.filter((x) => !x.r); pl.middag.push({ r: r.id, f: 1 }); save();
      toast(`Middag ${shortDate(day)} lagd på tallriken`); go(`#/tallrik?d=${day}`);
    };
    $('#cp').onclick = () => copyText(recipeText(r, a));
    $('#save-hh').onclick = () => { S.profile.hh = clone(VHH); save(); toast('Sparat som standard'); };
  }

  function recipeText(r, a) {
    const P = portions(VHH);
    const L = [`# ${r.title}`, r.why, '', '## Mallcheck'];
    a.rows.forEach((x) => L.push(`- ${x.k}: ${x.v.replace(/<[^>]+>/g, '')}`));
    a.notes.forEach(([, t]) => L.push(`- OBS: ${t}`));
    L.push('', `## Ingredienser (${hhText(VHH)})`);
    r.lines.forEach((l) => L.push(`- ${amountText(l.id, l.g * P)} ${ing(l.id).name}${l.role === 'fat' ? ` [fettkälla ${fmt((l.g / (ing(l.id).fu || 15)) * P, 1)} ×]` : ''}${l.note ? ' – ' + l.note : ''}`));
    if (r.kid) L.push('', '## Tillbehör Viggo/storbarn', `- ${ing(r.kid.id).name}: Viggo ${amountText(r.kid.id, r.kid.child)}, storbarn ${amountText(r.kid.id, r.kid.big)}/person. ${r.kid.how}`);
    L.push('', '## Gör så här'); r.steps.forEach((s, i) => L.push(`${i + 1}. ${s.t}${s.wait ? ` (⏳ ${s.wait})` : ''}`));
    if (r.temp) L.push(`Kärntemp: ${r.temp}`);
    L.push('', `## Matlåda`, r.box || '–', '', `## Kostnad`, `- Hela satsen ca ${kr(a.cost * P + kidCost(r, VHH))}, ${kr(a.cost)}/vuxenportion (eko ${kr(a.costEco)})`);
    if (r.upgrade) L.push('', `## Vardagslyx-växeln`, r.upgrade);
    return L.join('\n');
  }

  /* ================= Mallbyggare ================= */
  let DRAFT = null, DRAFT_SRC = null;
  const blankRecipe = () => ({ id: '', title: '', why: '', active: 20, total: 30, tags: [], lines: [], kid: { id: 'potatis', child: 120, big: 250, how: '' }, steps: [], box: '', boxOk: true, upgrade: '', temp: '', double: '', mageSwap: '', dairyAlt: '', lyx: false });
  const PICK = {
    protein: (i) => i.g || i.g4, fat: (i) => i.fu, main: (i) => i.veg === 'main', side: (i) => i.veg === 'side',
    carb: (i) => i.carb || i.nomall, other: () => true
  };
  function defaultGrams(role, i) {
    if (role === 'protein') return DRAFT.lines.some((l) => ing(l.id).g === 4) && i.g4 && !i.g ? i.g4 : i.pg || i.g4 || 125;
    if (role === 'fat') return i.fu || 15;
    if (role === 'main') return DRAFT.lines.some((l) => l.role === 'main') ? 60 : 120;
    if (role === 'side') return 15;
    if (role === 'carb') return CARB_G[i.carb] || 50;
    return 5;
  }
  function viewBuilder(parts) {
    const id = parts[0] || '';
    if (DRAFT_SRC !== id || !DRAFT) {
      const r = id && getRecipe(id);
      DRAFT = r ? clone(r) : blankRecipe(); DRAFT_SRC = id;
      delete DRAFT.seed; delete DRAFT.edited;
      if (!DRAFT.kid) DRAFT.kid = { id: '', child: 0, big: 0, how: '' };
    }
    const D = DRAFT;
    const section = (role, hint) => `
      <section class="card bsec" data-role="${role}">
        <h2>${ROLE_NAME[role]} <span class="muted small">${hint}</span></h2>
        <div class="blines">${D.lines.map((l, ix) => l.role !== role ? '' : `
          <div class="bline" data-ix="${ix}">
            <span class="bn">${esc(ing(l.id).name)}${role === 'fat' ? ` <span class="muted small">(1× = ${ing(l.id).fu || 15} g)</span>` : ''}</span>
            <input type="number" inputmode="decimal" min="0" step="any" value="${l.g}" data-f="g" aria-label="gram per portion"> <span class="muted">g</span>
            ${role === 'main' || role === 'side' ? `<label class="mini-check"><input type="checkbox" data-f="raw" ${l.raw ? 'checked' : ''}>rå</label>` : ''}
            <input class="bnote" placeholder="anteckning" value="${esc(l.note || '')}" data-f="note">
            <button class="btn sm ghost" data-del="${ix}" aria-label="ta bort">✕</button>
          </div>`).join('')}</div>
        <div class="picker"><input placeholder="+ Lägg till ${ROLE_NAME[role].toLowerCase()}…" data-pick="${role}"><div class="pick-res"></div></div>
      </section>`;
    const kidOpts = allIng().filter((i) => i.kid).map((i) => `<option value="${i.id}" ${D.kid.id === i.id ? 'selected' : ''}>${esc(i.name)}</option>`).join('');
    app().innerHTML = `
      <a class="back" href="${id ? '#/r/' + encodeURIComponent(id) : '#/recept'}">‹ Avbryt</a>
      <h1>${id ? 'Redigera recept' : 'Mallbyggaren'}</h1>
      <p class="muted small">Alla mängder i gram per <b>en vuxenportion</b> enligt mallen. Appen skalar till hushållet.</p>
      <div class="card sticky" id="bcheck"></div>
      <section class="card">
        <label class="wide">Namn <input id="b-title" value="${esc(D.title)}" placeholder="t.ex. Ugnsbakad sej med…"></label>
        <label class="wide">Varför just i kväll? <input id="b-why" value="${esc(D.why)}" placeholder="tid, säsong, budget"></label>
        <div class="row">
          <label>Aktiv tid <input type="number" id="b-active" value="${D.active}"> min</label>
          <label>Totalt <input type="number" id="b-total" value="${D.total}"> min</label>
          <label class="check"><input type="checkbox" id="b-lyx" ${D.lyx ? 'checked' : ''}> Fredag/lyx</label>
        </div>
        <label class="wide">Taggar <input id="b-tags" value="${esc((D.tags || []).join(', '))}" placeholder="fisk, budget, en plåt"></label>
      </section>
      ${section('protein', 'välj EN grupp')}
      ${section('fat', 'mängd styrs av proteinet')}
      ${section('main', '1–2 st, 100–150 g')}
      ${section('side', 'valfri mängd')}
      ${section('carb', 'frivilligt, EN')}
      ${section('other', 'kryddor, soja, buljong…')}
      <section class="card">
        <h2>Tillbehör Viggo / storbarn</h2>
        <div class="row">
          <label>Vad <select id="k-id"><option value="">– inget –</option>${kidOpts}</select></label>
          <label>Viggo <input type="number" id="k-child" value="${D.kid.child}"> g</label>
          <label>Storbarn <input type="number" id="k-big" value="${D.kid.big}"> g</label>
        </div>
        <label class="wide">Hur det lagas parallellt <input id="k-how" value="${esc(D.kid.how)}"></label>
      </section>
      <section class="card">
        <h2>Gör så här</h2>
        <p class="muted small">Ett steg per rad. Dötid skrivs efter <code>||</code>, t.ex. <code>Rosta 20 min || duka och bada Viggo</code>.</p>
        <textarea id="b-steps" rows="7">${esc(D.steps.map((s) => s.t + (s.wait ? ' || ' + s.wait : '')).join('\n'))}</textarea>
        <label class="wide">Kärntemp (stektermometer) <input id="b-temp" value="${esc(D.temp || '')}"></label>
        <label class="wide">Laga dubbelt? <input id="b-double" value="${esc(D.double || '')}"></label>
      </section>
      <section class="card">
        <label class="wide">Matlåda – hur den håller, värms, packas <textarea id="b-box" rows="2">${esc(D.box || '')}</textarea></label>
        <label class="check"><input type="checkbox" id="b-boxok" ${D.boxOk !== false ? 'checked' : ''}> Funkar som matlåda</label>
        <label class="wide">✨ Vardagslyx-växeln <input id="b-upgrade" value="${esc(D.upgrade || '')}"></label>
        <label class="wide">Bytesförslag om magkänsligt <input id="b-mage" value="${esc(D.mageSwap || '')}"></label>
        <label class="wide">Mejerifritt alternativ <input id="b-dairy" value="${esc(D.dairyAlt || '')}"></label>
      </section>
      <div class="actions">
        <button class="btn primary" id="b-save">Spara recept</button>
        ${id && S.recipes[id] && SEED_RECIPES.some((x) => x.id === id) ? '<button class="btn ghost" id="b-reset">Återställ original</button>' : ''}
        ${id ? '<button class="btn ghost danger" id="b-del">Ta bort</button>' : ''}
      </div>`;
    renderCheck();

    const bind = (sel, fn) => { const el = $(sel); el.addEventListener('input', () => { fn(el); renderCheck(); }); el.addEventListener('change', () => { fn(el); renderCheck(); }); };
    bind('#b-title', (e) => (D.title = e.value)); bind('#b-why', (e) => (D.why = e.value));
    bind('#b-active', (e) => (D.active = +e.value || 0)); bind('#b-total', (e) => (D.total = +e.value || 0));
    bind('#b-lyx', (e) => (D.lyx = e.checked)); bind('#b-tags', (e) => (D.tags = e.value.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)));
    bind('#k-id', (e) => (D.kid.id = e.value)); bind('#k-child', (e) => (D.kid.child = +e.value || 0)); bind('#k-big', (e) => (D.kid.big = +e.value || 0)); bind('#k-how', (e) => (D.kid.how = e.value));
    bind('#b-steps', (e) => (D.steps = e.value.split('\n').map((x) => x.trim()).filter(Boolean).map((x) => { const [t, w] = x.split('||').map((y) => y.trim()); return w ? { t, wait: w } : { t }; })));
    bind('#b-temp', (e) => (D.temp = e.value)); bind('#b-double', (e) => (D.double = e.value)); bind('#b-box', (e) => (D.box = e.value));
    bind('#b-boxok', (e) => (D.boxOk = e.checked)); bind('#b-upgrade', (e) => (D.upgrade = e.value)); bind('#b-mage', (e) => (D.mageSwap = e.value)); bind('#b-dairy', (e) => (D.dairyAlt = e.value));

    $$('.bline', app()).forEach((row) => {
      const l = D.lines[+row.dataset.ix];
      $$('[data-f]', row).forEach((inp) => inp.addEventListener('input', () => {
        const f = inp.dataset.f; if (f === 'g') l.g = +inp.value || 0; else if (f === 'raw') l.raw = inp.checked; else l.note = inp.value;
        renderCheck();
      }));
    });
    $$('[data-del]', app()).forEach((b) => b.onclick = () => { D.lines.splice(+b.dataset.del, 1); rerender(); });
    $$('[data-pick]', app()).forEach((inp) => {
      const role = inp.dataset.pick; const res = inp.nextElementSibling;
      const show = () => {
        const t = inp.value.trim().toLowerCase();
        const list = allIng().filter(PICK[role]).filter((i) => !t || i.name.toLowerCase().includes(t)).slice(0, t ? 12 : 40);
        res.innerHTML = list.map((i) => `<button data-add="${i.id}">${role === 'fat' ? tierDot(i) : ''}${esc(i.name)}${role === 'fat' ? ` <span class="muted small">${fmt(satPerUnit(i))} g mättat/1×</span>` : ''}${i.g ? ` <span class="muted small">G${i.g}</span>` : ''}${i.nomall ? ' <span class="muted small">bara barn</span>' : ''}${profileTokens().some((x) => i.name.toLowerCase().includes(x)) ? ' <span class="bad small">undvik</span>' : ''}</button>`).join('');
        $$('[data-add]', res).forEach((b) => b.onmousedown = (ev) => { ev.preventDefault(); const i = ing(b.dataset.add); D.lines.push({ id: i.id, g: defaultGrams(role, i), role }); rerender(); });
      };
      inp.onfocus = show; inp.oninput = show; inp.onblur = () => setTimeout(() => (res.innerHTML = ''), 150);
    });
    $('#b-save').onclick = () => {
      if (!D.title.trim()) return toast('Ge receptet ett namn');
      if (!D.id) { let base = slug(D.title), x = base, k = 2; while (getRecipe(x)) x = `${base}-${k++}`; D.id = x; }
      if (D.kid && !D.kid.id) delete D.kid;
      S.recipes[D.id] = clone(D); S.hidden = S.hidden.filter((h) => h !== D.id); save();
      const nid = D.id; DRAFT = null; DRAFT_SRC = null; toast('Sparat'); go(`#/r/${encodeURIComponent(nid)}`);
    };
    const rs = $('#b-reset'); if (rs) rs.onclick = () => { delete S.recipes[id]; save(); DRAFT = null; toast('Originalet återställt'); go(`#/r/${encodeURIComponent(id)}`); };
    const del = $('#b-del'); if (del) del.onclick = () => {
      if (!confirm('Ta bort receptet?')) return;
      delete S.recipes[id]; if (SEED_RECIPES.some((x) => x.id === id)) S.hidden.push(id);
      Object.keys(S.plan).forEach((d) => S.plan[d] === id && delete S.plan[d]); save(); DRAFT = null; go('#/recept');
    };
  }
  function rerender() { const y = window.scrollY; viewBuilder([DRAFT_SRC]); window.scrollTo(0, y); }
  function renderCheck() {
    const a = analyze(Object.assign({ title: '' }, DRAFT));
    $('#bcheck').innerHTML = `<div class="bc-head">${badge(a.level)} <b>Mallcheck</b> <span class="muted">${kr(a.cost)}/portion · ${Math.round(a.n[0])} kcal · mättat ${fmt(a.n[4])} g</span></div>
      <table class="check small">${a.rows.map((x) => `<tr><td>${badge(x.s)}</td><th>${x.k}</th><td>${x.v}</td></tr>`).join('')}</table>
      ${a.notes.length ? `<ul class="notes small">${a.notes.map(([s, t]) => `<li class="n-${s}">${badge(s)} ${esc(t)}</li>`).join('')}</ul>` : ''}`;
  }

  /* ================= Bygg din tallrik ================= */
  function plate(day) {
    if (!S.plates[day]) S.plates[day] = { frukost: [], lunch: [], middag: [] };
    MEALS.forEach((m) => (S.plates[day][m] = S.plates[day][m] || []));
    return S.plates[day];
  }
  function itemCalc(it) {
    if (it.r) {
      const r = getRecipe(it.r); if (!r) return { n: N0(), cost: 0, fu: 0, name: '(borttaget recept)' };
      const a = analyze(r); return { n: a.n.map((x) => x * it.f), cost: a.cost * it.f, fu: a.fatUnits * it.f, name: r.title, recipe: r };
    }
    const i = ing(it.i);
    return { n: addN(N0(), it.i, it.g), cost: lineCost(it.i, it.g), fu: i.fu ? it.g / i.fu : 0, name: i.name };
  }
  let PL_MEAL = 'frukost', PL_Q = '';
  function viewPlate(_, q) {
    const day = q.get('d') || today();
    const pl = plate(day); const p = S.profile;
    const meal = {}; const tot = { n: N0(), cost: 0 };
    MEALS.forEach((m) => {
      const c = { n: N0(), cost: 0, fu: 0, items: pl[m].map((it, ix) => Object.assign(itemCalc(it), { it, ix })) };
      c.items.forEach((x) => { x.n.forEach((v, k) => (c.n[k] += v)); c.cost += x.cost; c.fu += x.fu; });
      c.n.forEach((v, k) => (tot.n[k] += v)); tot.cost += c.cost; meal[m] = c;
    });
    const sat = tot.n[4], over = sat > p.satBudget;
    const planned = S.plan[day] && getRecipe(S.plan[day]);
    const recentBoxes = [...new Set([1, 2, 3].map((k) => S.plan[addDays(day, -k)]).filter(Boolean))].map(getRecipe).filter(Boolean);
    const isEmpty = MEALS.every((m) => !pl[m].length);

    const mealHtml = (m) => {
      const c = meal[m];
      const sugg = [];
      if (m === 'middag' && planned && !pl.middag.some((x) => x.r === planned.id)) sugg.push(`<button class="chip-btn hl" data-addr="${esc(planned.id)}" data-m="middag">Veckans middag: ${esc(planned.title)}</button>`);
      if (m === 'lunch') recentBoxes.forEach((r) => sugg.push(`<button class="chip-btn hl" data-addr="${esc(r.id)}" data-m="lunch">Matlåda: ${esc(r.title)}</button>`));
      (PLATE_PRESETS[m] || []).forEach((ps, k) => {
        const s = ps.items.reduce((acc, [id, g]) => acc + addN(N0(), id, g)[4], 0);
        sugg.push(`<button class="chip-btn${ps.fav ? ' hl' : ''}" data-preset="${k}" data-m="${m}">${ps.fav ? '★ ' : ''}${esc(ps.name)} <span class="muted">${fmt(s)} g</span></button>`);
      });
      return `<section class="card meal">
        <div class="meal-h"><h2>${MEAL_NAME[m]}</h2><span class="muted small">${fmt(c.n[4])} g mättat · ${fmt(c.fu, 1)} fettkällor · ${kr(c.cost)}</span></div>
        ${c.items.length ? `<div class="pitems">${c.items.map((x) => `<div class="pitem">
          <span class="pn">${x.it.r ? `<a href="#/r/${encodeURIComponent(x.it.r)}">${esc(x.name)}</a>` : esc(x.name)}</span>
          ${x.it.r ? `<span class="pq">${stepperPortion(m, x.ix, x.it.f)}</span>` : `<span class="pq"><input type="number" inputmode="numeric" value="${x.it.g}" data-m="${m}" data-ix="${x.ix}"> g</span>`}
          <span class="ps">${fmt(x.n[4])} g</span>
          <button class="btn sm ghost" data-rm="${x.ix}" data-m="${m}" aria-label="ta bort">✕</button></div>`).join('')}</div>` : `<p class="muted small">Tomt.</p>`}
        <details ${c.items.length ? '' : 'open'}><summary>Färdiga förslag</summary><p class="muted small">Mättat fett per portion. Tryck för att lägga upp det på tallriken.</p><div class="sugg-chips">${sugg.join('')}</div></details>
      </section>`;
    };

    app().innerHTML = `
      <div class="head-row">
        <a class="btn ghost" href="#/tallrik?d=${addDays(day, -1)}">‹</a>
        <h1>${day === today() ? 'Bygg din tallrik' : `${dayName(day)} ${shortDate(day)}`}</h1>
        <a class="btn ghost" href="#/tallrik?d=${addDays(day, 1)}">›</a>
      </div>
      ${day !== today() ? `<p class="center"><a href="#/tallrik">Till idag</a></p>` : `<p class="muted small center">Sätt ihop dagens måltider och se direkt mättat fett, kolesterol, betaglukan och kostnad.</p>`}
      <section class="card summary">
        <h2>Mättat fett i dag</h2>
        <div class="big ${over ? 'bad' : ''}"><b>${fmt(sat)}</b> / ${p.satBudget} g</div>
        <div class="bar"><div style="width:${Math.min(100, (sat / p.satBudget) * 100)}%" class="${over ? 'red' : sat > p.satBudget * 0.8 ? 'amber' : ''}"></div></div>
        <p class="${over ? 'bad' : 'good'}">${over ? `Över budget med ${fmt(sat - p.satBudget)} g` : `Inom budget – ${fmt(p.satBudget - sat)} g kvar`}</p>
        <div class="split">${MEALS.map((m) => `<span>${MEAL_NAME[m]} <b>${fmt(meal[m].n[4])}</b> g</span>`).join('')}</div>
        <div class="kpis">
          <div class="${tot.n[5] > p.cholGoal ? 'bad' : ''}"><span>Kolesterol</span><b>${Math.round(tot.n[5])} mg</b><small>mål under ${p.cholGoal} mg</small></div>
          <div class="${tot.n[6] >= p.bgGoal ? 'good' : ''}"><span>Betaglukan</span><b>${fmt(tot.n[6])} g</b><small>mål minst ${p.bgGoal} g</small></div>
          <div><span>Kostnad</span><b>${kr(tot.cost)}</b><small>ca, din portion</small></div>
          <div><span>Energi</span><b>${Math.round(tot.n[0])}</b><small>kcal · ${fmt(tot.n[1], 0)} g protein</small></div>
        </div>
      </section>
      ${isEmpty && day !== today() && S.plates[addDays(day, -1)] ? `<button class="btn ghost full" id="copy-prev">Kopiera gårdagens tallrik</button>` : ''}
      ${MEALS.map(mealHtml).join('')}
      <section class="card">
        <h2>Lägg till ingrediens</h2>
        <div class="seg">${MEALS.map((m) => `<button data-pm="${m}" class="${m === PL_MEAL ? 'on' : ''}">${MEAL_NAME[m]}</button>`).join('')}</div>
        <input class="search" id="pq" placeholder="Sök" value="${esc(PL_Q)}">
        <div class="pres" id="pres"></div>
        <details><summary>Lägg till recept från banken</summary><div class="sugg-chips">${allRecipes().map((r) => `<button class="chip-btn" data-addr="${esc(r.id)}" data-m="__sel">${esc(r.title)}</button>`).join('')}</div></details>
      </section>
      <p class="muted small">Alla värden är grova uppskattningar per 100 g från vanliga svenska livsmedel och ordinarie priser. Budgeten på ${p.satBudget} g mättat fett motsvarar ca 7 % av energin vid 2 500 kcal. Fettkällor räknas enligt måltidsmallen (t.ex. 15 g olja, 20 g nötter eller 60 g avokado = 1). Ägg räknas som 55 g per styck. Recept räknas som en vuxen mallportion. Det du lägger upp sparas bara i den här webbläsaren – exportera under Mer för att flytta.</p>`;

    const rer = () => { const y = window.scrollY; viewPlate(_, q); window.scrollTo(0, y); };
    $$('[data-addr]', app()).forEach((b) => b.onclick = () => { const m = b.dataset.m === '__sel' ? PL_MEAL : b.dataset.m; pl[m].push({ r: b.dataset.addr, f: 1 }); save(); rer(); });
    $$('[data-preset]', app()).forEach((b) => b.onclick = () => { PLATE_PRESETS[b.dataset.m][+b.dataset.preset].items.forEach(([i, g]) => pl[b.dataset.m].push({ i, g })); save(); rer(); });
    $$('[data-rm]', app()).forEach((b) => b.onclick = () => { pl[b.dataset.m].splice(+b.dataset.rm, 1); save(); rer(); });
    $$('.pitem input', app()).forEach((inp) => inp.onchange = () => { pl[inp.dataset.m][+inp.dataset.ix].g = Math.max(0, +inp.value || 0); save(); rer(); });
    $$('.pstep button', app()).forEach((b) => b.onclick = () => { const it = pl[b.dataset.m][+b.dataset.ix]; it.f = Math.max(0.25, Math.round((it.f + +b.dataset.d) * 4) / 4); save(); rer(); });
    $$('[data-pm]', app()).forEach((b) => b.onclick = () => { PL_MEAL = b.dataset.pm; $$('[data-pm]', app()).forEach((x) => x.classList.toggle('on', x === b)); });
    const cp = $('#copy-prev'); if (cp) cp.onclick = () => { S.plates[day] = clone(S.plates[addDays(day, -1)]); save(); rer(); };
    const pq = $('#pq'), pres = $('#pres');
    const search = () => {
      PL_Q = pq.value; const t = PL_Q.trim().toLowerCase();
      if (!t) { pres.innerHTML = ''; return; }
      const list = allIng().filter((i) => i.name.toLowerCase().includes(t)).slice(0, 10);
      pres.innerHTML = list.map((i) => { const g = i.pg || i.fu || (i.pcs && i.pcs < 200 ? i.pcs : 100); return `<button class="pres-i" data-i="${i.id}" data-g="${g}"><span>${esc(i.name)}</span><span class="muted small">${g} g · ${fmt(addN(N0(), i.id, g)[4])} g mättat</span></button>`; }).join('') +
        (list.length ? '' : `<p class="muted small">Hittar inget. <a href="#/mer#ing">Lägg till egen ingrediens</a></p>`);
      $$('.pres-i', pres).forEach((b) => b.onclick = () => { pl[PL_MEAL].push({ i: b.dataset.i, g: +b.dataset.g }); PL_Q = ''; save(); rer(); toast(`${ing(b.dataset.i).name} → ${MEAL_NAME[PL_MEAL].toLowerCase()}`); });
    };
    pq.oninput = search; search();
  }
  const stepperPortion = (m, ix, f) => `<span class="stepper pstep"><button data-d="-0.25" data-m="${m}" data-ix="${ix}">−</button><b>${fmt(f, 2)} port</b><button data-d="0.25" data-m="${m}" data-ix="${ix}">+</button></span>`;

  /* ================= Inköpslista ================= */
  function viewShop(_, q) {
    const off = +(q.get('w') || 0); const days = weekDays(off); const wk = days[0];
    const hh = S.profile.hh; const P = portions(hh);
    const tot = {}; const used = [];
    days.forEach((d) => {
      const r = S.plan[d] && getRecipe(S.plan[d]); if (!r) return; used.push(`${dayName(d).slice(0, 3)}: ${r.title}`);
      r.lines.forEach((l) => (tot[l.id] = (tot[l.id] || 0) + l.g * P));
      if (r.kid && kidGrams(r, hh)) tot[r.kid.id] = (tot[r.kid.id] || 0) + kidGrams(r, hh);
    });
    const checked = S.shop[wk] || (S.shop[wk] = {});
    const groups = {};
    Object.entries(tot).forEach(([id, g]) => { const a = ing(id).a || 'Övrigt'; (groups[a] = groups[a] || []).push([id, g]); });
    const order = Object.values(DB.aisles).concat('Övrigt');
    let cost = 0; Object.entries(tot).forEach(([id, g]) => !checked[id] && (cost += lineCost(id, g)));
    app().innerHTML = `
      <a class="back" href="#/vecka?w=${off}">‹ Veckan</a>
      <h1>Inköpslista v${isoWeek(wk)}</h1>
      ${used.length ? `<p class="muted small">${used.map(esc).join(' · ')}</p><p class="muted small">Räknat på ${hhText(hh)}. Bocka av det du redan har hemma.</p>` : '<p>Inga middagar planerade den här veckan.</p>'}
      ${order.filter((a) => groups[a]).map((a) => `<section class="card"><h2>${a}</h2><ul class="shop">${groups[a].sort((x, y) => ing(x[0]).name.localeCompare(ing(y[0]).name, 'sv')).map(([id, g]) =>
        `<li class="${checked[id] ? 'done' : ''}"><label><input type="checkbox" data-id="${id}" ${checked[id] ? 'checked' : ''}> <span>${esc(ing(id).name)}</span> <span class="amt">${amount(id, g)}</span></label></li>`).join('')}</ul></section>`).join('')}
      ${used.length ? `<div class="card sum"><div><span class="muted">Kvar att handla, ca</span><b>${kr(cost)}</b></div><button class="btn" id="cp-shop">⧉ Kopiera listan</button></div>` : ''}`;
    $$('.shop input', app()).forEach((c) => c.onchange = () => { checked[c.dataset.id] = c.checked; if (!c.checked) delete checked[c.dataset.id]; save(); const y = window.scrollY; viewShop(_, q); window.scrollTo(0, y); });
    const cp = $('#cp-shop'); if (cp) cp.onclick = () => copyText(order.filter((a) => groups[a]).map((a) => `${a}\n` + groups[a].filter(([id]) => !checked[id]).map(([id, g]) => `- ${ing(id).name} ${amountText(id, g)}`).join('\n')).join('\n\n'));
  }

  /* ================= Mer ================= */
  function viewMore() {
    const p = S.profile;
    const list = (key, label, hint) => `<label class="wide">${label} <span class="muted small">${hint || 'en per rad'}</span><textarea data-list="${key}" rows="3">${esc(p[key].join('\n'))}</textarea></label>`;
    app().innerHTML = `
      <h1>Mer</h1>
      <section class="card">
        <h2>Hushåll – standardskalning</h2>
        <div class="scaler">
          <label>Vuxna till middag ${stepper('adults', p.hh.adults)}</label>
          <label>Matlådor ${stepper('boxes', p.hh.boxes)}</label>
          <label>Viggo ${stepper('kids', p.hh.kids)}</label>
          <label>Ebba/Theo ${stepper('big', p.hh.big)}</label>
        </div>
        <p class="muted small">${hhText(p.hh)}</p>
      </section>
      <section class="card">
        <h2>Smakprofil</h2>
        <p class="muted small">Det du skriver under "Undvik" och "Allergier" flaggas i recept och sorteras bort ur förslagen.</p>
        ${list('likes', 'Gillar')}
        ${list('avoid', 'Gillar inte / undvik')}
        ${list('allergies', 'Allergier/intoleranser')}
        ${list('viggo', 'Viggo – funkar bra')}
        ${list('equipment', 'Utrustning i köket')}
      </section>
      <section class="card">
        <h2>Mål</h2>
        <label class="check"><input type="checkbox" id="ldl" ${p.ldl ? 'checked' : ''}> LDL-läge – vårdens råd om fett går före mallen</label>
        <p class="muted small">Fettkällor graderas efter mättat fett per 1 × fettkälla: <span class="fatdot t-green"></span>≤ 2,5 g (olja, nötter, frön, avokado) · <span class="fatdot t-yellow"></span>≤ 5,5 g (ost, crème fraiche, yoghurt) · <span class="fatdot t-red"></span>mer (smör, grädde, kokos, ghee). Mängden fett följer fortfarande mallen.</p>
        <div class="row">
          <label>Mättat fett/middag max <input type="number" step="0.5" data-num="satDinner" value="${p.satDinner}"> g</label>
        </div>
        <div class="row">
          <label>Mättat fett/dag <input type="number" data-num="satBudget" value="${p.satBudget}"> g</label>
          <label>Kolesterol under <input type="number" data-num="cholGoal" value="${p.cholGoal}"> mg</label>
          <label>Betaglukan minst <input type="number" data-num="bgGoal" value="${p.bgGoal}"> g</label>
        </div>
        <div class="row">
          <label>Kostnad/portion från <input type="number" data-num="costMin" value="${p.costMin}"> kr</label>
          <label>till <input type="number" data-num="costMax" value="${p.costMax}"> kr</label>
        </div>
      </section>
      <section class="card" id="claude">
        <h2>Nytt recept med Claude</h2>
        <ol class="small">
          <li>Kopiera instruktionen och klistra in i Claude-projektet tillsammans med din önskan ("något med sej, 20 min").</li>
          <li>Godkänn förslaget i chatten och be om receptet som JSON.</li>
          <li>Klistra in svaret här nedan. Appen räknar mall, fett, kostnad och makron själv.</li>
        </ol>
        <button class="btn" id="cp-prompt">⧉ Kopiera instruktion till Claude</button>
        <textarea id="imp-json" rows="5" placeholder='Klistra in Claudes JSON-svar här'></textarea>
        <button class="btn primary" id="imp-go">Importera recept</button>
      </section>
      <section class="card" id="ing">
        <h2>Egna ingredienser & priser</h2>
        <p class="muted small">Lägg till det som saknas, eller skriv in samma namn som en befintlig för att ändra pris/värden. Näring per 100 g.</p>
        <div class="ingform">
          <label class="wide">Namn <input id="ci-name" list="ci-list"><datalist id="ci-list">${DB.list.map((i) => `<option value="${esc(i.name)}">`).join('')}</datalist></label>
          <label>Typ <select id="ci-cat"><option value="protein">Protein</option><option value="fat">Fett</option><option value="veg-main">Huvudgrönsak</option><option value="veg-side">Sidogrönsak</option><option value="carb">Kolhydrat (mall)</option><option value="kid">Barntillbehör</option><option value="other">Övrigt</option></select></label>
          <label>Proteingrupp <select id="ci-g"><option value="">–</option><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
          ${['kcal', 'protein', 'fett', 'kolhydrat', 'mättat fett', 'kolesterol mg', 'betaglukan'].map((x, k) => `<label>${x} <input type="number" step="any" data-n="${k}" value="0"></label>`).join('')}
          <label>Pris kr/kg <input type="number" id="ci-p" value="0"></label>
          <label>1 × fettkälla = <input type="number" id="ci-fu" placeholder="g"> g</label>
        </div>
        <button class="btn" id="ci-add">Spara ingrediens</button>
        ${S.customIng.length ? `<ul class="plain small">${S.customIng.map((i) => `<li>${esc(i.name)} · ${i.p} kr/kg <button class="btn sm ghost" data-rmi="${i.id}">✕</button></li>`).join('')}</ul>` : ''}
      </section>
      <section class="card">
        <h2>Backup & flytta mellan enheter</h2>
        <p class="muted small">Allt sparas lokalt i den här webbläsaren. Exportera en fil och importera på mobilen/datorn för att flytta.</p>
        <div class="btns"><button class="btn" id="exp">⇩ Exportera</button><label class="btn ghost">⇧ Importera<input type="file" id="imp" accept=".json,application/json" hidden></label></div>
        <button class="btn ghost danger" id="reset">Nollställ allt</button>
      </section>
      <p class="muted small center">Receptbank · byggd på måltidsmallen (RE:YOU)</p>`;

    $$('.stepper', app()).forEach((s) => $$('button', s).forEach((b) => b.onclick = () => { p.hh[s.dataset.key] = Math.max(0, p.hh[s.dataset.key] + +b.dataset.d); VHH = clone(p.hh); save(); const y = window.scrollY; viewMore(); window.scrollTo(0, y); }));
    $$('[data-list]', app()).forEach((t) => t.onchange = () => { p[t.dataset.list] = t.value.split('\n').map((x) => x.trim()).filter(Boolean); save(); toast('Sparat'); });
    $('#ldl').onchange = (e) => { p.ldl = e.target.checked; save(); toast(p.ldl ? 'LDL-läge på' : 'LDL-läge av'); };
    $$('[data-num]', app()).forEach((t) => t.onchange = () => { p[t.dataset.num] = +t.value || 0; save(); toast('Sparat'); });
    $('#cp-prompt').onclick = () => copyText(claudePrompt());
    $('#imp-go').onclick = () => importRecipe($('#imp-json').value);
    $('#ci-add').onclick = addCustomIng;
    $$('[data-rmi]', app()).forEach((b) => b.onclick = () => { S.customIng = S.customIng.filter((i) => i.id !== b.dataset.rmi); save(); rebuildIng(); viewMore(); });
    $('#exp').onclick = () => {
      const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `receptbank-${today()}.json`; a.click();
    };
    $('#imp').onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => {
        try { const d = JSON.parse(t); if (!d.v) throw 0; if (!confirm('Ersätta all data i appen med filens innehåll?')) return; localStorage.setItem(KEY, JSON.stringify(d)); S = load(); rebuildIng(); VHH = clone(S.profile.hh); toast('Importerat'); go('#/vecka'); }
        catch (err) { toast('Filen kunde inte läsas'); }
      });
    };
    $('#reset').onclick = () => { if (confirm('Radera ALL data (planer, tallrikar, egna recept)?')) { localStorage.removeItem(KEY); S = load(); rebuildIng(); go('#/vecka'); } };
  }

  function addCustomIng() {
    const name = $('#ci-name').value.trim(); if (!name) return toast('Ange namn');
    const existing = DB.list.find((i) => i.name.toLowerCase() === name.toLowerCase());
    const cat = $('#ci-cat').value; const n = $$('[data-n]', app()).map((x) => +x.value || 0);
    const o = existing ? Object.assign(clone(existing), { p: +$('#ci-p').value || existing.p }) : { id: 'c-' + slug(name), name, cat: cat.split('-')[0], n, p: +$('#ci-p').value || 0, a: 'Övrigt' };
    if (existing && n.some((x) => x)) o.n = n;
    if (!existing) {
      if (cat === 'veg-main') o.veg = 'main'; if (cat === 'veg-side') o.veg = 'side';
      if (cat === 'carb') o.carb = 'rot'; if (cat === 'kid') o.kid = o.nomall = true;
      const g = +$('#ci-g').value; if (g) { o.g = g; o.pg = g === 4 ? 100 : 125; }
    }
    const fu = +$('#ci-fu').value; if (fu) o.fu = fu;
    S.customIng = S.customIng.filter((i) => i.id !== o.id).concat(o); save(); rebuildIng(); toast(existing ? 'Uppdaterad' : 'Tillagd'); viewMore();
  }

  function claudePrompt() {
    const p = S.profile;
    const ids = allIng().map((i) => `${i.id}=${i.name}${i.g ? ` [G${i.g}]` : ''}${i.fu ? ` [fett 1×=${i.fu}g]` : ''}${i.carb ? ` [kolh ${CARB_G[i.carb]}g]` : ''}${i.nomall ? ' [bara barn]' : ''}`).join('; ');
    return `Skapa ett middagsrecept enligt min måltidsmall och projektinstruktion. Föreslå först kort, när jag godkänt: svara med ENBART JSON (inget annat) i exakt detta format:

{"title":"…","why":"en rad om varför den passar i kväll","active":20,"total":30,"tags":["fisk"],"lyx":false,
 "lines":[{"id":"sej","g":125,"role":"protein"},{"id":"olivolja","g":30,"role":"fat","note":"stekning"},{"id":"broccoli","g":130,"role":"main"},{"id":"citron","g":10,"role":"side","raw":true},{"id":"morot","g":100,"role":"carb"},{"id":"salt","g":1,"role":"other"}],
 "kid":{"id":"potatis","child":120,"big":250,"how":"hur det lagas parallellt"},
 "steps":[{"t":"steg","wait":"dötid – vad jag hinner göra (valfritt)"}],
 "temp":"kärntemp","box":"matlåda: håller/värms/packas separat","boxOk":true,"upgrade":"vardagslyx-växeln","double":"laga dubbelt?","mageSwap":"bytesförslag om kål/lök/baljväxter","dairyAlt":"mejerifritt alternativ"}

Regler:
- "g" = gram per EN vuxen mallportion. Appen skalar själv till hushållet (${hhText(p.hh)}).
- role: protein | fat | main | side | carb | other. Allt tillagnings- och tillbehörsfett ska vara role "fat".
- Protein: en grupp. Fett: G1=1×, G2=2×, G3=2,5×, G4=1×. Huvudgrönsak 100–150 g (1–2 st). Kolhydrat frivillig, EN (inte ris/pasta/bröd för vuxna – de är barntillbehör i "kid").
- Använd id från listan nedan. Saknas något: {"name":"…","g":…,"role":"…","n":[kcal,protein,fett,kolh,mättat,kolesterol_mg,betaglukan],"p":pris_kr_per_kg}.
- Undvik: ${p.avoid.join(', ') || '–'}. Allergier: ${p.allergies.join(', ') || '–'}. Gillar: ${p.likes.join(', ') || '–'}. Viggo gillar: ${p.viggo.join(', ') || '–'}. Utrustning: ${p.equipment.join(', ') || '–'}.
- Mallen och naturliga råvaror gäller (inga lightprodukter, inget processat, inga sötningsmedel). Undantag: fettet. Jag har förhöjt LDL och följer vårdens råd om fett${p.ldl ? ` – max ${p.satDinner} g mättat fett per middagsportion` : ''}, ${p.satBudget} g/dag, kolesterol under ${p.cholGoal} mg.
- Fettkällor i första hand olivolja, kallpressad rapsolja, nötter, frön, avokado. Ost/mejerifett max 1 × per dag. Smör, grädde, kokos, ghee bara som smaksättning (≤ 5 g). Fett kött/chark max 1 gång/vecka, fisk 2–3 gånger/vecka.

Ingredienser (id=namn): ${ids}`;
  }

  function importRecipe(txt) {
    try {
      const s = txt.indexOf('{'), e = txt.lastIndexOf('}'); if (s < 0) throw new Error('Ingen JSON hittad');
      const r = JSON.parse(txt.slice(s, e + 1));
      if (!r.title || !Array.isArray(r.lines)) throw new Error('Saknar title eller lines');
      const roles = Object.keys(ROLE_NAME);
      r.lines = r.lines.map((l) => {
        const role = roles.includes(l.role) ? l.role : 'other';
        let id = l.id;
        if (!id || !ING[id]) {
          const nm = l.name || l.id || 'Okänd';
          const found = allIng().find((i) => i.name.toLowerCase() === nm.toLowerCase());
          if (found) id = found.id;
          else {
            id = 'c-' + slug(nm);
            const o = { id, name: nm, cat: role, n: Array.isArray(l.n) && l.n.length === 7 ? l.n.map(Number) : [0, 0, 0, 0, 0, 0, 0], p: +l.p || 0, a: 'Övrigt' };
            if (role === 'main' || role === 'side') o.veg = role; if (role === 'fat') o.fu = 15; if (role === 'carb') o.carb = 'rot';
            S.customIng.push(o); rebuildIng();
          }
        }
        const out = { id, g: +l.g || 0, role }; if (l.note) out.note = String(l.note); if (l.raw) out.raw = true; return out;
      });
      r.steps = (r.steps || []).map((x) => (typeof x === 'string' ? { t: x } : { t: String(x.t || ''), ...(x.wait ? { wait: String(x.wait) } : {}) }));
      if (r.kid && !ING[r.kid.id]) delete r.kid;
      r.active = +r.active || 30; r.total = +r.total || r.active; r.tags = Array.isArray(r.tags) ? r.tags : [];
      let base = slug(r.title), x = base, k = 2; while (getRecipe(x)) x = `${base}-${k++}`; r.id = x;
      S.recipes[r.id] = r; save(); toast('Recept importerat'); go(`#/r/${encodeURIComponent(r.id)}`);
    } catch (err) { toast('Kunde inte läsa: ' + err.message); }
  }

  /* ================= Start ================= */
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
