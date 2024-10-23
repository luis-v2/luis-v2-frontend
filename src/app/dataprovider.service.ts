import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as xlsx from 'xlsx';
import { Station } from '../interfaces/station.interface';
import { StationComponent } from '../interfaces/station-component.interface';
import { Utils } from './utils';
import { RawXlsData } from '../interfaces/rawXlsData.interface';
import { DataPoint } from '../interfaces/dataPoint.interface';

@Injectable({
  providedIn: 'root'
})
export class DataproviderService {

  constructor(private httpClient: HttpClient) { }

  STATION:string = 'station1';
  KOMPONENTE:string = 'komponente1';

  getDemoDataHTML() {
    return new Observable<DataPoint[]>(obs => {
      const url = "https://corsproxy.io/?https://app.luis.steiermark.at/luft2/export.php?station1=178&station2=&komponente1=125&station3=&station4=&komponente2=&von_tag=20&von_monat=10&von_jahr=2024&mittelwert=1&bis_tag=23&bis_monat=10&bis_jahr=2024";

      this.httpClient.get(url, { responseType: 'arraybuffer'}).subscribe(r => {
        var wb = xlsx.read(r);

        var raw = <RawXlsData[]>xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: ['date', 'time', 'value']}).slice(3); // first 3 rows contain no data

        var output: DataPoint[] = [];

        raw.forEach(row => {
          var dateSplit = row.date.split(".").map(x => Number(x)); // format: 01.01.24
          var timeSplit = row.time.split(":").map(x => Number(x)); // format: 00:00

          var date = new Date(Utils.convertTwoDigitYearToFourDigitWithCurrentYear(dateSplit[2]), dateSplit[1] - 1, dateSplit[0], timeSplit[0], timeSplit[1]);
          var value = parseFloat(row.value) || row.value;

          output.push({ timestamp: date, 'pm10': value });
        });

        obs.next(output); 
      });
    });
  }

  getAvailableStations(): Observable<Station[]> {
    return new Observable<Station[]>(obs => {
      const url = 'https://corsproxy.io/?https://app.luis.steiermark.at/luft2/suche.php';

      this.httpClient.get(url, { responseType: 'text' }).subscribe(r => {
        obs.next(this.parseStations(r));
      });
    });
  }

  getAvailableComponents(station: Station): Observable<void> {
    return new Observable(obs => {

      if (station.availableComponents) { // if already loaded => return
        obs.next();
        return;
      }

      const url = 'https://corsproxy.io/?https://app.luis.steiermark.at/luft2/suche.php?' + this.STATION + "=" + station.id;

      return this.httpClient.get(url, { responseType: 'text' }).subscribe(r => {
        this.parseComponentsForSelectedStation(r, station);
        obs.next();
      });
    });

  }

  private parseStations(html: string): Station[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const selectElement = doc.querySelector('select[name="station1"]');

    // null check
    if (!selectElement) {
      return [];
    }

    return Array.from(selectElement.querySelectorAll('option') as NodeListOf<HTMLOptionElement>)
    .filter((option: HTMLOptionElement) => option.value)
    .map((option: HTMLOptionElement) => <Station>{ id: Number(option.value), name: option.textContent || ''});
  }

  private parseComponentsForSelectedStation(html: string, station: Station): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const selectElement = doc.querySelector('select[name="komponente1"]');

    if (!selectElement) {
      return;
    }
    station.availableComponents = Array.from(selectElement.querySelectorAll('option') as NodeListOf<HTMLOptionElement>)
                                    .filter((option: HTMLOptionElement) => option.value)
                                    .map((option: HTMLOptionElement) => <StationComponent>{ id: Number(option.value), name: option.textContent || '' });
  }
}
