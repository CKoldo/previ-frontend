import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { ISurveyRepository } from './domain/survey/survey.repository';
import { SurveyRepository } from './infrastructure/repositories/survey.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: ISurveyRepository, useClass: SurveyRepository },
    providePrimeNG({
      theme: {
          preset: Aura,
          options: {
            colorScheme: 'light',
             darkModeSelector: false,
            cssLayer: {
                name: 'primeng',
                order: 'theme, base, primeng'

            }
        }
      }
  })
  ],
};
