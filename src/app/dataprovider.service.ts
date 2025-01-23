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
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class DataproviderService {
  dataLoaded: EventEmitter<DataPoint[]>;

  constructor(private httpClient: HttpClient, private messageService: MessageService) {
    this.dataLoaded = new EventEmitter<DataPoint[]>();
  }

  STATION: string = 'station1';
  KOMPONENTE: string = 'komponente1';
  MITTELWERT: string = 'mittelwert';
  TEMPURL: string = 'https://temp.temp/'; // URL Builder has problems building the corsproxy url so we use this in the meantime and replace it later
  EXPORTURL: string = 'app.luis.steiermark.at/luft2/export.php';
  CORSPROXYURL: string = 'https://cors-proxy.s1.enthaler.dev/';
  SCRAPEURL: string = 'app.luis.steiermark.at/luft2/suche.php?';

  getDataPoints(station: Station, components: StationComponent[], range: Date[], average: Average, interpolate: boolean) {
    return new Observable<DataPoint[]>(obs => {
      var subs: Observable<RawMeasurements>[] = [];

      var dateBlocks = Utils.getDateBlocks(range[0], range[1] ?? range[0], 60);

      dateBlocks.forEach(d => {
        components.forEach(c => {
          var url = new URL(this.TEMPURL);
          url.searchParams.append(this.STATION, station.id.toString());
          url.searchParams.append(this.KOMPONENTE, c.id.toString());
  
          url.searchParams.append('von_tag', d.start.getDate().toString());
          url.searchParams.append('von_monat', (d.start.getMonth() + 1).toString());
          url.searchParams.append('von_jahr', d.start.getFullYear().toString());
  
          url.searchParams.append('bis_tag', d.end.getDate().toString());
          url.searchParams.append('bis_monat', (d.end.getMonth() + 1).toString());
          url.searchParams.append('bis_jahr', d.end.getFullYear().toString());
  
          url.searchParams.append(this.MITTELWERT, average.id.toString());
  
          var sub = new Observable<RawMeasurements>(o => {
            this.httpClient.get(this.CORSPROXYURL + url.href.replace(this.TEMPURL, this.EXPORTURL), { responseType: 'arraybuffer'}).pipe(retry(3)).subscribe({
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
      });

      zip(subs).subscribe({
        next: r => {
          // get all possible timestamps from inputs
          var timestamps = [...new Set(r.map(x => Object.keys(x?.measurements ?? {})).flat(1))];

          // create datapoints for each timestamp
          var data: DataPoint[] = timestamps.map(x => <DataPoint>{ timestamp: new Date(Number(x)) });

          // create timestamp index
          const timestampIndex = data.reduce((acc, dp) => {
            acc[dp.timestamp.getTime()] = dp;
            return acc;
          }, <{[i:number]: DataPoint}>{});

          // merge data
          r.forEach(x => {
            Object.entries(x?.measurements ?? {}).forEach((m) => {
              var dp = timestampIndex[Number(m[0])];
              if (dp) dp[x.component.key] = m[1];
            });
          });

          // interpolation
          if (interpolate) {
            let getFilledValue = (d: DataPoint[], i: number, k: string, increase: boolean) => {
              i = increase ? (i + 1) : (i - 1);
  
              if (i < 0 || i >= data.length) return;
  
              // value found
              if (data[i][k] != undefined) {
                return { value: data[i][k], index: i};
              }

              // move one step up/down
              return getFilledValue(d, i, k, increase);
            }
  
            let keys = r.map(x => x?.component?.key)?.filter(x => !!x);
            keys.forEach(key => { // loop through each available key
              data.forEach((x, i) => { // loop thorugh all datapoints
                if (x[key] == undefined) { // check if key is empty at this datapoint

                  // get nearest filled datapoint in both directions
                  let before = getFilledValue(data, i, key, false);
                  let next = getFilledValue(data, i, key, true);
  
                  // if datapoint is found for both directions
                  if (before && next) {
                    let bi = (i - before.index);
                    let ni = (next.index - i);

                    // if distance is less than 10 datapoints
                    if ((bi + ni) <= 10) {
                      // calculate value
                      x[key] = Number(((before.value + next.value) / 2).toFixed(4));

                      // mark datapoint as interpolated for visualization
                      x.interpolated?.push(key) ?? (x.interpolated = [key]);
                    }
                  }
                }
              });
            });
          }

          if (r.some(x => x == undefined)) {
            this.messageService.add({ severity: 'warn', summary: 'Warnung', detail: 'Es konnten nicht alle Datenblöcke heruntergeladen werden. Bitte überprüfen Sie die Ausgabe in der Tabelle.' });
          }

          this.dataLoaded.emit(data);
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

      this.httpClient.get(this.CORSPROXYURL + this.SCRAPEURL, { responseType: 'text' }).subscribe(r => {
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

      const url = this.CORSPROXYURL + this.SCRAPEURL + this.STATION + "=" + station.id;

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
    .map((option: HTMLOptionElement) => <Station>{ id: Number(option.value), name: option.textContent?.replaceAll(';', '') || ''});
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

      this.httpClient.get(this.CORSPROXYURL + this.SCRAPEURL, { responseType: 'text' }).subscribe(r => {
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
