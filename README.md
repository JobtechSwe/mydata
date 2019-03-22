# JobTech MyData

## Bakgrund

MyData är en rörelse som syftar till att individer själva ska ha kontroll på data om sig själv. Jobtech mydata utforskar ett koncept som åstadkommer det primärt för arbetsmarknaden. Målet är att se vad detta skapar för potentiella möjligheter för den svenska arbetsmarknaden. Därför har vi påbörjat ett experimenterande innovationsteam som vill testa hypotesen att det går att skapa en distribuerad och decentraliserad datalagring för information om individens CV-data och göra den tillgänglig för de aktörer som har intresse att läsa eller skriva i datat men med utgångspunkt att individen alltid har kontroll på informationen.

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

- [mydata-app](https://github.com/JobtechSwe/mydata/tree/master/phone-app) : En app där individen hanterar sin data
- [mydata-operator](https://github.com/JobtechSwe/mydata/tree/master/operator) : En teknisk operatör som givet ett godkännande från individen hanterar kommunikationen mellan individen, hens data och en extern tjänst
- [mydata-client](https://github.com/JobtechSwe/mydata/tree/master/client) : Ett npm-paket som används av tjänster för att kommunicera med `operator`. Hjälper till med signering, kryptering m.m.

[mydata-cv](https://github.com/JobtechSwe/mydata/tree/master/example) är en exempeltjänst som läser/skriver till individens mydata efter att ha fått behörighet att göra det (`Data Source` och `Data Sink`)

Data lagras krypterat i en s.k. PDS (Personal Data Storage). Just nu är Dropbox enda PDS som stöds, men det kommer utökas inom kort.

## Install and develop (english)

1. Clone this repo
2. `npm run install-all`
3. Add the following to your host file (probably /etc/hosts) 
```
127.0.0.1 operator
127.0.0.1 cv
```
4. `npm run dev` (will start elasticsearch, kibana, apm-server, redis (x2) and postgres (x2))
5. Look in each subfolder for instructions on how to start each sub-project


If you want to run the app on an actual phone it will of course not use your computer's hosts-file so you will need to use a proxy such as squidman.

**Before pushing/PR:** 
1. Do `npm run lint-all`
2. Do `npm run test-all` (this will run e2e/integration and unit tests)
