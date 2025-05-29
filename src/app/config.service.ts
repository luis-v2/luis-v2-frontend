import { Injectable } from '@angular/core';
import { Config } from '../interfaces/config.interface';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {
  private _config!: Config;

  constructor(private httpClient: HttpClient) {}

  loadConfig() {
    return this.httpClient.get<Config>('assets/config.json').pipe(tap(config => {
      this._config = config;
    }));
  }

  get config(): Config {
    return this._config;
  }
}
