import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { setupStageStorageBridge } from './app/shared/utils/stage-storage.util';

setupStageStorageBridge();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
