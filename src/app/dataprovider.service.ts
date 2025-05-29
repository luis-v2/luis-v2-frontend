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

@Injectable({
  providedIn: 'root'
})
export class DataproviderService {
  dataLoaded: EventEmitter<DataPoint[]>;
  BASEURL: string = "";

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

  getDataPoints(station: Station, components: StationComponent[], range: Date[], average: Average, interpolate: boolean) {

    let reqestBody: DataRequest = {
      station: station.id,
      components: components.map(c => c.id),
      startDate: range[0],
      endDate: range[1],
      average: average.id,
      interpolate: interpolate,
      fileFormat: 'json'
    };

    return new Observable<DataPoint[]>(obs => {
      this.httpClient.post<DataPoint[]>(this.BASEURL + 'data', reqestBody)
      .pipe(map(data => data.map(d => ({...d, timestamp: new Date(d.timestamp)})))).subscribe((r) => {
        this.dataLoaded.emit(r);
        obs.next(r);
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

}
