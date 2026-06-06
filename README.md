# KnappKoll

Ett webbaserat spel for att trana tangentpositioner pa tangentbord. Spelet ar inspirerat av placeringsspel, men fokus ar att snabbt hitta ratt tangent pa fysisk eller virtuell keyboard-layout.

## Funktioner i denna version

- Tva layouter: Svensk QWERTY och US QWERTY
- Nivabaserad progression utan tidspress
- Direkt feedback pa varje svar (ratt/fel)
- Stod for fysisk tangentinmatning och touch/click pa virtuellt tangentbord
- Lokal historik i webblasaren via localStorage

## Arkitektur

Projektet ar byggt utan externa runtime-beroenden och ar uppdelat i tydliga lager:

- `src/core`: domanlogik (nivareer, sessionsflode, bedomning)
- `src/state`: enkel store + reducer + actions
- `src/ui`: rendering och inputadapter
- `src/services`: localStorage-repository for historik
- `public`: HTML + CSS

Detta ger lag koppling mellan spelregler och UI, vilket gor koden lattare att testa och vidareutveckla.

## Kor lokalt

Anvand valfri enkel statisk server i projektets rotmapp.

Exempel med Python:

```bash
python -m http.server 8000
```

Exempel med Node:

```bash
npx serve .
```

Oppna sedan:

- `http://localhost:8000/public/`

## Spelflode

1. Valj layout pa startskarmen.
2. Starta spel.
3. Hitta markerad tangent med tangentbord eller genom att klicka pa tangenten i UI.
4. Klara precisionstraskeln for att ga vidare till nasta niva.
5. Efter sista nivan visas sammanfattning och resultat sparas lokalt.
