import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Tournament, Team, Player, Match } from '../models';

/**
 * Interfejs warstwy danych turnieju
 * Implementacje:
 *  - MockTournamentApi (teraz)
 *  - HttpTournamentApi (później, gdy będzie backend)
 */

export interface ITournamentApi {
  getTournament(tournamentId: string): Observable<Tournament>;
  getTeams(tournamentId: string): Observable<Team[]>;
  getPlayers(tournamentId: string): Observable<Player[]>;
  getMatches(stageId: string): Observable<Match[]>;
}

/**
 * Token DI do wstrzykiwania aktualnej implementacji API
 */
export const TOURNAMENT_API = new InjectionToken<ITournamentApi>(
  'TOURNAMENT_API'
);
