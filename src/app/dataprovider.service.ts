import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, retry, zip } from 'rxjs';
import * as xlsx from 'xlsx';
import { Station } from '../interfaces/station.interface';
import { StationComponent } from '../interfaces/station-component.interface';
import { Utils } from './utils';
import { RawXlsData } from '../interfaces/rawXlsData.interface';
import { DataPoint } from '../interfaces/dataPoint.interface';
import { RawMeasurements } from '../interfaces/rawMeasurements.interface';
import { Average} from '../interfaces/average.interface';

@Injectable({
  providedIn: 'root'
})
export class DataproviderService {
  dataLoaded: EventEmitter<DataPoint[]>;

  constructor(private httpClient: HttpClient) {
    this.dataLoaded = new EventEmitter<DataPoint[]>(); // übergangslösung
  }

  STATION:string = 'station1';
  KOMPONENTE:string = 'komponente1';
  MITTELWERT:string = 'mittelwert';
  TEMPURL: string = 'https://temp.temp/'; // URL Builder has problems building the corsproxy url so we use this in the meantime and replace it later
  EXPORTURL: string = 'https://corsproxy.io/?https://app.luis.steiermark.at/luft2/export.php';
  SCRAPEURL: string = 'https://corsproxy.io/?https://app.luis.steiermark.at/luft2/suche.php?';

  getDataPoints(station: Station, components: StationComponent[], range: Date[], average: Average) {
    return new Observable<DataPoint[]>(obs => {
      var subs: Observable<RawMeasurements>[] = [];

      components.forEach(c => {
        var url = new URL(this.TEMPURL);
        url.searchParams.append(this.STATION, station.id.toString());
        url.searchParams.append(this.KOMPONENTE, c.id.toString());

        url.searchParams.append('von_tag', range[0].getDate().toString());
        url.searchParams.append('von_monat', (range[0].getMonth() + 1).toString());
        url.searchParams.append('von_jahr', range[0].getFullYear().toString());

        url.searchParams.append('bis_tag', range[1].getDate().toString());
        url.searchParams.append('bis_monat', (range[1].getMonth() + 1).toString());
        url.searchParams.append('bis_jahr', range[1].getFullYear().toString());

        url.searchParams.append(this.MITTELWERT, average.id.toString());

        var sub = new Observable<RawMeasurements>(o => {
          this.httpClient.get(url.href.replace(this.TEMPURL, this.EXPORTURL), { responseType: 'arraybuffer'}).pipe(retry(3)).subscribe({
            next: ab => {
              o.next(this.parseXlsArrayBuffer(ab, c));
            },
            error: e => {
              o.next(undefined);
            }
          })
        });

        subs.push(sub);
      });

      zip(subs).subscribe({
        next: r => {
          // get all possible timestamps from inputs
          var timestamps = [...new Set(r.map(x => Object.keys(x?.measurements ?? {})).flat(1))];

          // create datapoints for each timestamp
          var data: DataPoint[] = timestamps.map(x => <DataPoint>{ timestamp: new Date(Number(x)) });

          r.forEach(x => {
            Object.entries(x?.measurements ?? {}).forEach((m) => {
              var dp = data.find(dp => dp.timestamp.getTime() == Number(m[0]));
              if (dp) dp[x.component.key] = m[1];
            });
          });

          this.dataLoaded.emit(data)
          obs.next(data);
        },
        error: e => {
          console.log(e);
        }
      });
    });
  }

  getAvailableStations(): Observable<Station[]> {
    return new Observable<Station[]>(obs => {

      this.httpClient.get(this.SCRAPEURL, { responseType: 'text' }).subscribe(r => {
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

      const url = this.SCRAPEURL + this.STATION + "=" + station.id;

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
                                    .map((option: HTMLOptionElement) => <StationComponent>{
                                      id: Number(option.value),
                                      key: option.textContent?.match(/(?<=\().+?(?=\))/)?.[0]?.toLowerCase().replaceAll(' ', ''),
                                      name: option.textContent || ''
                                    });
  }

  private parseXlsArrayBuffer(ab: ArrayBuffer, component: StationComponent) {
    var wb = xlsx.read(ab);

    var raw = <RawXlsData[]>xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: ['date', 'time', 'value']}).slice(3); // first 3 rows contain no data

    var output: RawMeasurements = { component: component, measurements: {} };

    raw.forEach(row => {
      var dateSplit = row.date.split(".").map(x => Number(x)); // format: 01.01.24
      var timeSplit = row.time.split(":").map(x => Number(x)); // format: 00:00

      var date = new Date(Utils.convertTwoDigitYearToFourDigitWithCurrentYear(dateSplit[2]), dateSplit[1] - 1, dateSplit[0], timeSplit[0], timeSplit[1]);
      var value = parseFloat(row.value);

      output.measurements[date.getTime()] = value;
    });

    return output;
  }

  getAvailableAverages(): Observable<Station[]> {
    return new Observable<Station[]>(obs => {

      this.httpClient.get(this.SCRAPEURL, { responseType: 'text' }).subscribe(r => {
        obs.next(this.parseAverages(r));
      });
    });
  }

  private parseAverages(html: string): Average[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const selectElement = doc.querySelector('select[name="mittelwert"]');

    // null check
    if (!selectElement) {
      return [];
    }

    return Array.from(selectElement.querySelectorAll('option') as NodeListOf<HTMLOptionElement>)
      .filter((option: HTMLOptionElement) => option.value)
      .map((option: HTMLOptionElement) => <Average>{ id: Number(option.value), name: option.textContent || ''});
  }
}
