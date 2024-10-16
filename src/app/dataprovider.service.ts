import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as xlsx from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class DataproviderService {

  constructor(private httpClient: HttpClient) { }

  getDemoDataHTML() {
    return new Observable(obs => {
      const url = "https://corsproxy.io/?https://www.umwelt.steiermark.at/luft2/export.php?station1=164&station2=&komponente1=4&station3=&station4=&komponente2=&von_tag=1&von_monat=10&von_jahr=2024&mittelwert=1&bis_tag=4&bis_monat=10&bis_jahr=2024";

      this.httpClient.get(url, { responseType: 'arraybuffer'}).subscribe(r => {
        var wb = xlsx.read(r);
        obs.next(xlsx.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]));
      });
    });
  }
}
