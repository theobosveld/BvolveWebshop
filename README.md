# Speelwinkel

Een eenvoudige webshop voor kwartetspellen, kinderboeken en escaperooms.
Geen account of inlog nodig — bezoekers vullen hun gegevens in en de
bestelling wordt klaargezet als e-mail naar het adres dat jij instelt.

## Starten

Je hebt Node.js nodig (versie 18 of hoger). Download die eventueel via
https://nodejs.org als je het nog niet hebt.

```bash
npm install
npm run dev
```

Open daarna de URL die in de terminal verschijnt (meestal
http://localhost:5173).

## Eerste keer instellen

1. Klik rechtsboven op **Beheer**.
2. Vul bij **Winkelinstellingen** je winkelnaam en het e-mailadres in waar
   bestellingen naartoe moeten (bijvoorbeeld bestellingen@jouwbedrijf.nl).
3. Voeg je eigen artikelen toe: naam, categorie, prijs, beschrijving en een
   link naar een afbeelding. Er staan 6 voorbeeldartikelen klaar die je kunt
   aanpassen of verwijderen.

Voor afbeeldingen heb je twee opties:
- **URL plakken**: een link naar een foto die al ergens online staat
  (bijvoorbeeld op je eigen website of een afbeeldingshost).
- **Afbeelding uploaden**: klik op "Afbeelding uploaden" en kies een foto
  vanaf je apparaat. De foto wordt automatisch verkleind en gecomprimeerd en
  direct in het artikel opgeslagen — geen aparte hosting nodig.

Let op: geüploade foto's worden samen met de rest opgeslagen in
`localStorage`, wat een beperkte capaciteit heeft (meestal 5-10 MB in totaal
per browser). Bij een klein aantal artikelen is dat geen probleem, maar bij
tientallen producten met eigen foto's kun je tegen die grens aanlopen. Kom je
daar tegenaan, gebruik dan liever URL's naar extern gehoste afbeeldingen.

## Hoe bestellingen binnenkomen

Wanneer een klant op **Bestelling versturen** klikt, opent automatisch het
e-mailprogramma van de klant met een kant-en-klare e-mail: de bestelde
artikelen, aantallen, het totaalbedrag en de ingevulde naam, adres, e-mail en
telefoonnummer. De klant hoeft alleen op versturen te klikken.

Werkt dat om wat voor reden dan ook niet (sommige klanten gebruiken alleen
webmail zonder gekoppeld e-mailprogramma), dan kan de bestelling ook
gekopieerd worden vanaf het bevestigingsscherm, zodat de klant 'm zelf kan
plakken en versturen.

## Waar worden artikelen opgeslagen?

In `localStorage` van de browser — dat is opslag die hoort bij de browser op
één apparaat. Dit betekent:

- Artikelen die jij toevoegt via **Beheer** blijven bewaard zolang je
  dezelfde browser op hetzelfde apparaat gebruikt, ook na herladen of
  afsluiten.
- Als je de site op een andere computer, browser, of in incognito-modus
  opent, zie je die artikelen niet — het is geen gedeelde database.

Voor eigen gebruik (jij beheert de artikelen, klanten bestellen alleen) werkt
dit prima. Wil je op termijn met meerdere mensen artikelen beheren of een
"echte" database, dan is een kleine backend (bijvoorbeeld met Supabase,
Firebase, of een eigen servertje) een logische volgende stap — vraag het
gerust als je daarbij hulp wilt.

## Live zetten (hosten)

Bouw een productieversie met:

```bash
npm run build
```

Dit maakt een map `dist/` met kant-en-klare bestanden. Die map kun je
uploaden naar bijna elke hostingdienst, bijvoorbeeld:

- **Netlify** of **Vercel**: sleep de `dist`-map naar hun dashboard, of
  koppel je Git-repository voor automatische deploys.
- **Eigen webserver**: kopieer de inhoud van `dist/` naar de map die je
  hostingpartij als website-root gebruikt.

## Projectstructuur

```
speelwinkel/
├── index.html          startpagina
├── package.json         dependencies en scripts
├── vite.config.js       build-configuratie
├── tailwind.config.js   stijl-configuratie
├── postcss.config.js
└── src/
    ├── main.jsx          React-opstartpunt
    ├── App.jsx           de hele webshop (producten, winkelwagen, bestelformulier, beheer)
    └── index.css         basisstijlen
```
# BvolveWebshop
