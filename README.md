# Receptbank

En webbapp för vardagsmiddagar enligt måltidsmallen (protein + fett + huvudgrönsak + sidogrönsak + ev. kolhydrat), med **Bygg din tallrik** inbyggd. Funkar i mobilen och på datorn och kan sparas på hemskärmen. Inga konton och ingen server, allt sparas lokalt i webbläsaren.

## Flikar

| Flik | Vad den gör |
|---|---|
| **Vecka** | Veckoremsa med en färgprick per rättyp och dagens rätt som *I kväll*. *Fyll tomma dagar* planerar efter kostreglerna (fisk 2–3 ggr, fett kött max 1, mättat fett per middag) och går att ångra. En dag kan markeras som *Äta ute*. LDL-balansen visas överst. |
| **Recept** | Receptbanken med sökning och filter per rättyp, mallcheck (✓/!) och mallbyggaren för egna recept. Varje recept har *Börja laga mat*. |
| **Inköp** | Inköpslista per avdelning i butikens ordning, eller per recept. Hela förpackningar avrundas uppåt. Skafferiet (*Finns hemma*) hålls utanför listan. Egna varor kan läggas till och listan kan delas som text. |
| **Tallrik** | Bygg din tallrik: mättat fett mot dagsbudget, kolesterol, betaglukan och fettkällor per måltid. |
| **Mer** | Utseende (ljust/mörkt), hushållsskalning, smakprofil, mål, egna ingredienser, import från Claude, backup. |

Förslag per dag nås från veckan (*Föreslå* eller ↻).

## Matlagningsläge

Ett steg i taget med stor text. Tider i stegtexten ("10 min", "12–15 min") blir timerknappar. Timrarna ligger kvar längst ner i alla vyer, piper och vibrerar när de är klara och kan förlängas med +1 min. Skärmen hålls tänd så länge läget är öppet.

Begränsning: en webbapp kan inte ringa när telefonen är låst eller appen ligger i bakgrunden. Timern räknar rätt ändå, men ljudet kommer först när appen visas igen.

## Receptvyn (enligt projektinstruktionen §4)

Varje recept visar:

- rubrik och "varför i kväll"
- ingredienser skalade efter hushållet, med ungefärligt antal (½ huvud, 1 citron) och fettkällorna markerade
- tillbehör till Viggo, och ett alternativ/byte när det finns
- steg med dötid och kärntemp
- matlåda, laga dubbelt och vardagslyx
- hopfällt: fett i satsen, mallcheck och näring per portion

Mallchecken räknas fram automatiskt ur ingrediensdatabasen. Den kontrollerar:

- proteingrupp och mängd
- antal fettkällor
- huvudgrönsakens gram
- kolhydratregler (ris, pasta och bröd bara som barntillbehör)
- mejeri-gråzon
- undvik-listan
- mättat fett per middag (LDL-läge)

## Koppling till Bygg din tallrik

Recepten och tallriken använder samma ingrediensdatabas (`js/data.js`), alltså samma näringsvärden per 100 g och fettkällsdefinitioner. Ett recept på tallriken räknas som en vuxen mallportion.

## Nya recept via Claude

1. Gå till **Mer → Nytt recept med Claude → Kopiera instruktion**.
2. Klistra in instruktionen i Claude-projektet tillsammans med din önskan.
3. Godkänn förslaget i chatten och be om JSON.
4. Klistra in svaret i appen. Mall, fett och makron räknar appen själv.

## Köra appen

- **Lokalt:** kör `python3 -m http.server` i mappen och öppna `http://localhost:8000`. Du kan också öppna `index.html` direkt, men då fungerar inte offline-läget.
- **I mobilen (rekommenderat):** slå på GitHub Pages för repot (Settings → Pages → Deploy from branch → välj gren och `/root`). Öppna sedan sidan i mobilen och välj *Lägg till på hemskärmen*.

## Data och synk

All data ligger i webbläsarens `localStorage`, och varje enhet har sin egen. Så här flyttar du data mellan mobil och dator: **Mer → Exportera**, och sedan **Importera** filen på den andra enheten.

## Filer

- `js/data.js` – ingrediensdatabasen (näring, mallroller). Prisfälten finns kvar men visas inte i appen.
- `js/recipes.js` – startrecept och färdiga tallriksförslag. Mängderna anges per vuxen mallportion.
- `js/app.js` – logik och vyer.
- `css/style.css`, `index.html`, `manifest.webmanifest`, `sw.js` – utseende, PWA och offline.
