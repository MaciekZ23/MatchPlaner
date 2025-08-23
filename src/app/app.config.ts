import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { TOURNAMENT_API } from './core/api/tournament.api';
import { MockTournamentApi } from './core/mocks/mock-tournament.api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: TOURNAMENT_API, useClass: MockTournamentApi },
  ],
};
