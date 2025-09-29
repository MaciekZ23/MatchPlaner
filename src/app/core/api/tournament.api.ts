import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Tournament, Team, Player, Match } from '../models';
import {
  CreatePlayerPayload,
  CreateTeamPayload,
  UpdatePlayerPayload,
  UpdateTeamPayload,
} from '../types';

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

  createTeam(team: CreateTeamPayload, tournamentId?: string): Observable<Team>;
  updateTeam(teamId: string, patch: UpdateTeamPayload): Observable<Team>;
  deleteTeam(teamId: string): Observable<void>;

  createPlayer(
    teamId: string,
    payload: CreatePlayerPayload
  ): Observable<Player>;
  updatePlayer(
    playerId: string,
    patch: UpdatePlayerPayload
  ): Observable<Player>;
  deletePlayer(playerId: string): Observable<void>;
}

/**
 * Token DI do wstrzykiwania aktualnej implementacji API
 */
export const TOURNAMENT_API = new InjectionToken<ITournamentApi>(
  'TOURNAMENT_API'
);
