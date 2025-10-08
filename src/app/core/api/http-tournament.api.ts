import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITournamentApi } from './tournament.api';
import {
  CreateMatchPayload,
  CreateTournamentPayload,
  GenerateRoundRobinPayload,
  Match,
  Player,
  Team,
  Tournament,
  UpdateMatchPayload,
  UpdateTournamentPayload,
} from '../models';
import {
  CreatePlayerPayload,
  CreateTeamPayload,
  UpdatePlayerPayload,
  UpdateTeamPayload,
} from '../types';

@Injectable({ providedIn: 'root' })
export class HttpTournamentApi implements ITournamentApi {
  private readonly defaultTournamentId = 't1';

  constructor(private http: HttpClient) {}

  getTournament(id: string = this.defaultTournamentId): Observable<Tournament> {
    return this.http.get<Tournament>(`/api/v1/tournaments/${id}`);
  }

  createTournament(payload: CreateTournamentPayload): Observable<Tournament> {
    return this.http.post<Tournament>(
      `/api/v1/tournaments/create-tournament`,
      payload
    );
  }

  updateTournament(
    id: string,
    patch: UpdateTournamentPayload
  ): Observable<Tournament> {
    return this.http.patch<Tournament>(
      `/api/v1/tournaments/${id}/modify-tournament`,
      patch
    );
  }

  deleteTournament(id: string): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/tournaments/${id}/delete-tournament`
    );
  }

  getTeams(tournamentId: string): Observable<Team[]> {
    return this.http.get<Team[]>(`/api/v1/teams/tournament/${tournamentId}`);
  }

  createTeam(
    team: CreateTeamPayload,
    tournamentId: string = this.defaultTournamentId
  ): Observable<Team> {
    return this.http.post<Team>(
      `/api/v1/teams/tournament/${tournamentId}/add-team`,
      team
    );
  }

  updateTeam(teamId: string, patch: UpdateTeamPayload): Observable<Team> {
    return this.http.patch<Team>(
      `/api/v1/teams/tournament/${teamId}/modify-team`,
      patch
    );
  }

  deleteTeam(teamId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/teams/tournament/${teamId}/delete-team`
    );
  }

  getPlayers(tournamentId: string) {
    return this.http.get<Player[]>(
      `/api/v1/teams/tournament/${tournamentId}/players`
    );
  }

  createPlayer(
    teamId: string,
    payload: CreatePlayerPayload
  ): Observable<Player> {
    return this.http.post<Player>(
      `/api/v1/teams/tournament/${teamId}/add-player`,
      payload
    );
  }

  updatePlayer(
    playerId: string,
    patch: UpdatePlayerPayload
  ): Observable<Player> {
    return this.http.patch<Player>(
      `/api/v1/teams/tournament/${playerId}/modify-player`,
      patch
    );
  }

  deletePlayer(playerId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/teams/tournament/${playerId}/delete-player`
    );
  }

  getMatches(stageId: string): Observable<Match[]> {
    return this.http.get<Match[]>(`/api/v1/matches/stage/${stageId}`);
  }

  createMatch(payload: CreateMatchPayload): Observable<Match> {
    return this.http.post<Match>(`/api/v1/matches/create-match`, payload);
  }

  updateMatch(id: string, patch: UpdateMatchPayload): Observable<Match> {
    return this.http.patch<Match>(`/api/v1/matches/edit-match/${id}`, patch);
  }

  deleteMatch(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/matches/delete-match/${id}`);
  }

  deleteAllMatchesByTournament(
    tournamentId: string
  ): Observable<{ count: number }> {
    return this.http.delete<{ count: number }>(
      `/api/v1/matches/delete-all-matches/${tournamentId}`
    );
  }

  deleteAllMatchesByStage(stageId: string): Observable<{ count: number }> {
    return this.http.delete<{ count: number }>(
      `/api/v1/matches/delete-all-matches-by-stage/${stageId}`
    );
  }

  generateRoundRobin(
    tournamentId: string,
    payload: GenerateRoundRobinPayload
  ): Observable<{ created: number }> {
    return this.http.post<{ created: number }>(
      `/api/v1/matches/generate-round-robin/${tournamentId}`,
      payload
    );
  }
}
