import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { map, Observable, retry, zip } from 'rxjs';
import { Station } from '../interfaces/station.interface';
import { StationComponent } from '../interfaces/station-component.interface';
import { DataPoint } from '../interfaces/dataPoint.interface';
import { Average } from '../interfaces/average.interface';
import { MessageService } from 'primeng/api';
import { DataRequest } from '../interfaces/dataRequest.interface';
import { ConfigService } from './config.service';
import { Trend } from '../interfaces/trend.interface';

@Injectable({
  providedIn: 'root'
})
export class DataproviderService {
  dataLoaded: EventEmitter<DataPoint[]>;
  BASEURL: string = "";
  lastRequest: DataRequest | undefined;


  constructor(private httpClient: HttpClient, private messageService: MessageService, private configService: ConfigService) {
    this.dataLoaded = new EventEmitter<DataPoint[]>();
    this.BASEURL = this.configService.config.apiBaseUrl;
  }


  STATION: string = 'station1';
  KOMPONENTE: string = 'komponente1';
  MITTELWERT: string = 'mittelwert';
  TEMPURL: string = 'https://temp.temp/'; // URL Builder has problems building the corsproxy url so we use this in the meantime and replace it later
  EXPORTURL: string = 'app.luis.steiermark.at/luft2/export.php';
  CORSPROXYURL: string = 'https://cors-proxy.s1.enthaler.dev/';
  SCRAPEURL: string = 'app.luis.steiermark.at/luft2/suche.php?';


  toDateWithCorrectUTC(date: Date): Date {
    const local = new Date(date);
    local.setHours(0, 0, 0, 0); // lokale Mitternacht
    // Zeit um Zeitzonenoffset zurückstellen (in ms)
    const correctedTime = local.getTime() - local.getTimezoneOffset() * 60000;
    return new Date(correctedTime);
  } 


  getDataPoints(station: Station, components: StationComponent[], range: Date[], average: Average, interpolate: boolean) {

    let reqestBody: DataRequest = {
      station: station.id,
      components: components.map(c => c.id),
      startDate: this.toDateWithCorrectUTC(range[0]),
      endDate: this.toDateWithCorrectUTC(range[1] ?? range[0]),
      average: average.id,
      interpolate: interpolate,
      addForecasts: this.toDateWithCorrectUTC(range[1] ?? range[0]) > new Date(),
      fileFormat: 'json'
    };

    this.lastRequest = reqestBody;

    return new Observable<DataPoint[]>(obs => {
      this.httpClient.post<DataPoint[]>(this.BASEURL + 'data', reqestBody)
      .pipe(map(data => <DataPoint[]>data.map(d => ({...d, timestamp: new Date(d.timestamp)})))).subscribe((data) => {

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

  
            let keys = Object.keys(data[0]);
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

        this.dataLoaded.emit(data);
        obs.next(data);
      });
    });
  }

  getAvailableStations(): Observable<Station[]> {
    return new Observable<Station[]>(obs => {
      this.httpClient.get(this.BASEURL + 'station').subscribe(r => {
        obs.next(r as Station[]);
      });
    });
  }

  getAvailableComponents(station: Station): Observable<void> {
    return new Observable(obs => {
      if (station.availableComponents) { // if already loaded => return
        obs.next();
        return;
      }

      const url = `${this.BASEURL}station/${station.id}/component`;

      return this.httpClient.get(url).subscribe(r => {
        station.availableComponents = r as StationComponent[];
        obs.next();
      });
    });

  }

  getAvailableAverages(): Observable<Average[]> {
    return new Observable<Average[]>(obs => {
      this.httpClient.get(this.BASEURL + 'average').subscribe(r => {
        obs.next(r as Average[]);
      });
    });
  }

  getTrends(station: Station, interval: number): Observable<Trend[]> {
    return new Observable<Trend[]>(obs => {
      this.httpClient.get(this.BASEURL + `trend?stationId=${station.id}&days=${interval}`).subscribe(r => {
        obs.next(r as Trend[]);
      });
    });
  }

}
