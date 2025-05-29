import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ConfigService } from './app/config.service';

const configService = new ConfigService();


configService.loadConfig().then(() => {
    bootstrapApplication(AppComponent, {
      ...appConfig,
      providers: [
      { provide: ConfigService, useValue: configService },
      ...(appConfig.providers || [])
      ]
    })
    .catch((err) => console.error(err));
});
