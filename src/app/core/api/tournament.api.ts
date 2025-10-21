import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Tournament,
  Team,
  Player,
  Match,
  UpdateTournamentPayload,
  CreateTournamentPayload,
  GenerateRoundRobinPayload,
  CreateMatchPayload,
  UpdateMatchPayload,
} from '../models';
import {
  CreatePlayerPayload,
  CreateTeamPayload,
  UpdatePlayerPayload,
  UpdateTeamPayload,
} from '../types';

export interface ITournamentApi {
  getTournament(tournamentId: string): Observable<Tournament>;
  getTournaments(): Observable<Tournament[]>;
  createTournament(payload: CreateTournamentPayload): Observable<Tournament>;
  updateTournament(
    id: string,
    patch: UpdateTournamentPayload
  ): Observable<Tournament>;
  deleteTournament(id: string): Observable<void>;

  getTeams(tournamentId: string): Observable<Team[]>;
  getPlayers(tournamentId: string): Observable<Player[]>;
  getMatches(stageId: string): Observable<Match[]>;
  createMatch(payload: CreateMatchPayload): Observable<Match>;
  updateMatch(id: string, patch: UpdateMatchPayload): Observable<Match>;
  deleteMatch(id: string): Observable<void>;
  deleteAllMatchesByTournament(
    tournamentId: string
  ): Observable<{ count: number }>;
  deleteAllMatchesByStage(stageId: string): Observable<{ count: number }>;
  generateRoundRobin(
    tournamentId: string,
    payload: GenerateRoundRobinPayload
  ): Observable<{ created: number }>;

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

export const TOURNAMENT_API = new InjectionToken<ITournamentApi>(
  'TOURNAMENT_API'
);
