# Receptbank

En webbapp för vardagsmiddagar enligt måltidsmallen (protein + fett + huvudgrönsak + sidogrönsak + ev. kolhydrat), med **Bygg din tallrik** inbyggd. Funkar i mobilen och på datorn och kan sparas på hemskärmen. Inga konton och ingen server, allt sparas lokalt i webbläsaren.

## Flikar

| Flik | Vad den gör |
|---|---|
| **Vecka** | Veckoplan, mån–sön. Tomma dagar har knappen *Föreslå*. Längst ner finns veckokostnad och inköpslista. |
| **Förslag** | Föreslår först, sen godkänner du. Du kan filtrera på dag, tid, proteingrupp, kr/portion och *vad du har hemma*. På fredagar är vardagslyx förvalt. |
| **Recept** | Receptbanken med mallcheck (✓/!), sökning och mallbyggaren för egna recept. |
| **Tallrik** | Bygg din tallrik: mättat fett mot dagsbudget, kolesterol, betaglukan, kostnad och fettkällor per måltid. Dagens planerade middag och gårdagens matlåda kan läggas upp med ett tryck. |
| **Mer** | Hushållsskalning, smakprofil (undvik/allergier/utrustning), mål, egna ingredienser och priser, import från Claude, backup. |

## Receptvyn (enligt projektinstruktionen §4)

Varje recept visar:

- rubrik och "varför i kväll"
- mallcheck
- ingredienser skalade efter hushållet, med fettkällorna markerade och redovisade separat
- tillbehör till Viggo och storbarnen
- steg med dötid och kärntemp
- matlåda
- kostnad, konventionellt och eko, med eko-tips
- näring per vuxenportion
- vardagslyx-växeln

Mallchecken räknas fram automatiskt ur ingrediensdatabasen. Den kontrollerar:

- proteingrupp och mängd
- antal fettkällor
- huvudgrönsakens gram
- kolhydratregler (ris, pasta och bröd bara som barntillbehör)
- mejeri-gråzon
- magkänsliga råvaror
- undvik-listan
- kostnad över riktmärket, med förslag på billigare protein i samma grupp

## Koppling till Bygg din tallrik

Recepten och tallriken använder samma ingrediensdatabas (`js/data.js`), alltså samma näringsvärden per 100 g, priser och fettkällsdefinitioner. Ett recept på tallriken räknas som en vuxen mallportion.

## Nya recept via Claude

1. Gå till **Mer → Nytt recept med Claude → Kopiera instruktion**.
2. Klistra in instruktionen i Claude-projektet tillsammans med din önskan.
3. Godkänn förslaget i chatten och be om JSON.
4. Klistra in svaret i appen. Mall, fett, kostnad och makron räknar appen själv.

## Köra appen

- **Lokalt:** kör `python3 -m http.server` i mappen och öppna `http://localhost:8000`. Du kan också öppna `index.html` direkt, men då fungerar inte offline-läget.
- **I mobilen (rekommenderat):** slå på GitHub Pages för repot (Settings → Pages → Deploy from branch → välj gren och `/root`). Öppna sedan sidan i mobilen och välj *Lägg till på hemskärmen*.

## Data och synk

All data ligger i webbläsarens `localStorage`, och varje enhet har sin egen. Så här flyttar du data mellan mobil och dator: **Mer → Exportera**, och sedan **Importera** filen på den andra enheten.

## Filer

- `js/data.js` – ingrediensdatabasen (näring, priser, mallroller). Ändra priser här eller i appen.
- `js/recipes.js` – startrecept och färdiga tallriksförslag. Mängderna anges per vuxen mallportion.
- `js/app.js` – logik och vyer.
- `css/style.css`, `index.html`, `manifest.webmanifest`, `sw.js` – utseende, PWA och offline.
