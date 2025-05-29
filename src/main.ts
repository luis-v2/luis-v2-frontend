import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ConfigService } from './app/config.service';
import { APP_INITIALIZER } from '@angular/core';

export function loadConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}

bootstrapApplication(AppComponent, {
      ...appConfig,
      providers: [
        ConfigService,
        {
          provide: APP_INITIALIZER,
          useFactory: loadConfig,
          deps: [ConfigService],
          multi: true
        },
        ...(appConfig.providers || [])
      ]
    })
    .catch((err) => console.error(err));