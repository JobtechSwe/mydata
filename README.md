# Egendata

[![Build Status](https://travis-ci.com/JobtechSwe/mydata.svg?branch=master)](https://travis-ci.com/JobtechSwe/mydata)
[![Test Coverage](https://api.codeclimate.com/v1/badges/58e30cd7d55d0c0bed1a/test_coverage)](https://codeclimate.com/github/JobtechSwe/mydata/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/58e30cd7d55d0c0bed1a/maintainability)](https://codeclimate.com/github/JobtechSwe/mydata/maintainability)

## Bakgrund

MyData är en rörelse som syftar till att individer själva ska ha kontroll på data om sig själv. Egendata är en implementation av MyData-principer. Målet är att se vad detta skapar för potentiella möjligheter, med avstamp i den svenska arbetsmarknaden. Därför har vi påbörjat ett experimenterande innovationsteam som vill testa hypotesen att det går att skapa en distribuerad och decentraliserad datalagring för information om individens CV-data och göra den tillgänglig för de aktörer som har intresse att läsa eller skriva i datat men med utgångspunkt att individen alltid har kontroll på informationen.

## Syfte och mål

### Värna individens rätt till sin data (MyData movement)

Massiva datamängder som samlas i enskilda företag eller myndigheter skapar möjligheter att dessa kan se mönster i människors beteenden och skapa nya produkter och tjänster som skapar ett nytt värde. Datat kan även användas för andra syften, t ex för att övervaka eller påverka opinioner i politiska syften. Att kontrollera många individers data kan innebära en riskabelt stor maktkoncentration. För att "vaccinera oss" mot denna typ av masspåverkan vill vi därför nå en lösning där individens rätt till sin egen data är utgångspunkten och rent konkret flyttar tillbaka makten till individerna att enkelt agera mot maktkoncentration och informationsmonopol.

### Samhällsbygge och innovationskraft

Vårt andra mål handlar om att möjliggöra innovationskraft för myndigheter. Att bättre kunna samverka att kunna utveckla lika potenta digitala tjänster som privata startups. Privat och offentligt ska kunna samverka både i utveckling och med gemensam digital infrastruktur/standarder för ökad samhällsnytta. Genom att möjliggöra en “digital byråkrati”, dvs spårbarhet och standardiserad kommunikation kan nya mer transparenta och effektiva former av styrning etableras. På vägen handlar detta om konkurrenskraft för Sverige och EU, men i grunden handlar det framför allt om ökad samhällsnytta för hela mänskligheten. Världen är idag global och strömmar från alla världens hörn. Open Source är en global rörelse och har kraften att förbättra både för små och stora länder och organisationer.

### Främja arbetsmarknaden.

Förenkla och höja effektiviteten i karriärarbetet genom att katalysera ekosystemet kring jobtech. Nya och förbättrade tjänster för arbetssökande och arbetsgivare. Fri och effektiv rörlighet över landsgränser, minska kostnaden för arbetsgivare och enklare användarupplevelse för användaren.

## Metod

Ett innovationsteam är framtaget som består av kompetens både inom programmering, UX, infrastruktur, kryptering/säkerhet och expertis från myndigheten. Innovationsteamet jobbar iterativt och skall uppnå högre och högre ställda mål/milstolpar. Första etappen är t ex att få alla systemkomponenter på plats men med väldigt begränsad funktionalitet. Därefter ökas komplexiteten och till slut finns det ett embryo till produkt som kan utvärderas.

## Transparens och samarbete

Vi har som mål att vara 100% transparenta och lägger ut all kod och dokumentation här på Github. Meningen är att konsolidera kunskap och öka samarbetet med andra initiativ som samtidigt jobbar med samma tanke. Vi är väldigt glada för att få kontakt med dig och stöttar gärna med de lärdomar vi har och lär oss gärna av dina. Projektets Kanban-tavla där utvecklarna koordinerar arbetet kan ses här https://trello.com/b/uGsJAcH1/mydata-mvp

## Koden

Genom att visualisera och praktiskt visa upp hur ägande av sin egen data skulle kunna fungera så blir det enklare för flera att ta ställning till konceptet.  Vår strävan att återanvända så mycket som möjligt för att inte återuppfinna hjulet. Projektet är influerat av [mydata.org](http://mydata.org)

Projektet är indelat i flera delsystem:

- [Egendata-app](https://github.com/JobtechSwe/mydata/tree/master/app) : är en app för telefonen där individen hanterar delningen av sin data
- [Egendata-operator](https://github.com/JobtechSwe/mydata/tree/master/operator) : är en teknisk knytpunkt som givet ett godkännande från individen hanterar kommunikationen mellan individen, hens data och tjänsterna som vill använda datan
- [Egendata-client](https://github.com/JobtechSwe/mydata/tree/master/client) : är ett [npm-paket](https://www.npmjs.com/package/@egendata/client) som används av tjänster för att kommunicera med `operator`. Det gör signering, kryptering, validering och skickande av meddelanden och data.
- [Egendata-cv](https://github.com/JobtechSwe/mydata/tree/master/examples/cv) är en exempeltjänst som läser/skriver till individens Egendata-utrymme (efter att ha fått behörighet att göra det). Denna representerar en vanlig tjänst som hanterar persondata.
- [Egendata-national-registration](https://github.com/JobtechSwe/mydata/tree/master/examples/national-registration) är en exempeltjänst som enbart skriver till individens Egendata-utrymme (efter att ha fått behörighet att göra det). Denna representerar en tjänst som intygar något om användaren, i detta fall att användaren är en specifik (fiktiv) person.
- [messaging](https://github.com/JobtechSwe/mydata/tree/master/messaging) : är ett [npm-paket](https://www.npmjs.com/package/@egendata/messaging) för internt bruk med funktioner som är delade mellan `client`, `operator`, `app` och `e2e`. Det innehåller till exempel funktioner för att validera formatet på meddelanden och för att hantera kryptografiska tokens.
- [e2e](https://github.com/JobtechSwe/mydata/tree/master/e2e) : innehåller end-to-end- samt integrationstester för projektet.

Data lagras krypterat i en s.k. PDS (Personal Data Storage). Just nu stöds lagring av data i användarens dropbox och (för enkel testning) i minnet hos operatorn.

## Install and develop (english)

1. Clone this repo
2. `npm ci`
3. `docker-compose up` will start all databases and other services needed by all the sub-projects
4. Look in each subfolder for instructions on how to start the sub-projects

**Before pushing/PR:**
Do `npm test` (this will lint, run unit tests and run e2e/integration tests)
