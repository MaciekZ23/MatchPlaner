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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'pl' },
    { provide: TOURNAMENT_API, useClass: MockTournamentApi },
  ],
};
