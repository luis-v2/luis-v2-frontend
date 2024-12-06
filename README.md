![Logo](https://git-iit.fh-joanneum.at/swd23-hackathon/luis-v2/-/raw/main/src/assets/logo/LuisV2Logo.png)

# LUIS V2

LUIS ist ein Downloadtool für Wetter und Luftverschmutzungsdaten des Umweltamts Steiermark. Die aktuelle Version des Tools ist nicht mehr aktuell und soll modernisiert und verbessert werden. Ziel des Projekts ist es, die Daten nutzerfreundlich und verarbeitet für Benutzer:innen, darunter auch Data Analysts und Statistiker:innen, zur Verfügung zu stellen. UIS V2 ist ein Downloadtool für Wetter und Luftverschmutzungsdatan des Umweltamts Steiermark. Ziel ist es, die Daten nutzerfreundlich und verarbeitet für Benutzer:innen, darunter auch Data Analysts und Statistiker:innen, zur Verfügung zu stellen.

## Must-Have Funktionen

- Nutzerfreundliche Platform
- Daten müssen schnell zusammengefasst und gedownloaded werden können. Dies sollte auch gemeinsam geschehen, d.h. eine Tabelle für einen Zeitraum soll
mehrere Komponenten umfassen können. Dies soll auch über längere Zeiträume geschehen
können, selbst wenn viele Daten auf einmal aufkommen (z.B. Halbstundenmittelwerte).

- Darstellungstool sollte inkludiert sein, das die gewünschten Daten passend
darstellt.

## Nice To Have Funktionen

- Downloadmöglichkeit in verschiedene Formate für Data Analysts (feather, parquet…) 
- Erweiterte Dateninformation (Wochentage, Inversionsberechnung…)
- Darstellungen können interativ zwischen Komponenten switchen
- Option um fehlende Messwerte zu imputieren
- (Für Startuplab) Option um Vorhersagen für Feinstaubwerte in den nächsten Tagen anzuzeigen

## Teammitglieder
- Enthaler Tobias
- Hanner Jakob
- Inalov Achmad


## Demo

Aktuell kann das Tool hier verwendet werden:
[Online DEV Version](https://luis-v2.projects.enthaler.dev/)


Um die App lokal auszuführen, folgen Sie diesen Schritten:

Klonen Sie das Repository:
```
git clone https://git-iit.fh-joanneum.at/swd23-hackathon/luis-v2.git
```

Installieren Sie die notwendigen Abhängigkeiten:
```
npm install
```
Starten Sie die Applikation:
```
npm run start
```
