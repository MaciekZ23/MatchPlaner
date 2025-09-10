import {
  ApplicationConfig,
  provideZoneChangeDetection,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
registerLocaleData(localePl);
import { TOURNAMENT_API } from './core/api/tournament.api';
import { MockTournamentApi } from './core/mocks/mock-tournament.api';
import { HttpTournamentApi } from './core/api/http-tournament.api';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'pl' },
    { provide: TOURNAMENT_API, useClass: HttpTournamentApi },
  ],
};
