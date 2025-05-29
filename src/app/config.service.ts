import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ConfigService {
  private config: any;

  loadConfig() {
    return fetch('../assets/config.json')
      .then(response => response.json())
      .then(json => {
	      this.config = json
      });
  }

  get apiBaseUrl(): string {
    return this.config?.apiBaseUrl;
  }

}
