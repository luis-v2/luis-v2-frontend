import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as xlsx from 'xlsx';
import { Station } from '../interfaces/station.interface';
import { StationComponent } from '../interfaces/station-component.interface';

@Injectable({
  providedIn: 'root'
})
export class DataproviderService {

  constructor(private httpClient: HttpClient) { }

  STATION:string = 'station1';
  KOMPONENTE:string = 'komponente1';

  getDemoDataHTML() {
    return new Observable(obs => {
      const url = "https://corsproxy.io/?https://www.umwelt.steiermark.at/luft2/export.php?station1=164&station2=&komponente1=4&station3=&station4=&komponente2=&von_tag=1&von_monat=10&von_jahr=2024&mittelwert=1&bis_tag=4&bis_monat=10&bis_jahr=2024";

      this.httpClient.get(url, { responseType: 'arraybuffer'}).subscribe(r => {
        var wb = xlsx.read(r);
        obs.next(xlsx.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]));
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
