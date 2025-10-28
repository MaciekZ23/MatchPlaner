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
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpTournamentApi implements ITournamentApi {
  private readonly defaultTournamentId = 't1';

  constructor(private http: HttpClient) {}

  private readonly base = `${environment.apiUrl}`; // ✅ jedno źródło prawdy

  getTournament(id: string = this.defaultTournamentId): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.base}/tournaments/${id}`);
  }

  getTournaments() {
    return this.http.get<Tournament[]>(`${this.base}/tournaments`);
  }

  createTournament(payload: CreateTournamentPayload): Observable<Tournament> {
    return this.http.post<Tournament>(
      `${this.base}/tournaments/create-tournament`,
      payload
    );
  }

  updateTournament(
    id: string,
    patch: UpdateTournamentPayload
  ): Observable<Tournament> {
    return this.http.patch<Tournament>(
      `${this.base}/tournaments/${id}/modify-tournament`,
      patch
    );
  }

  deleteTournament(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/tournaments/${id}/delete-tournament`
    );
  }

  getTeams(tournamentId: string): Observable<Team[]> {
    return this.http.get<Team[]>(
      `${this.base}/teams/tournament/${tournamentId}`
    );
  }

  createTeam(
    team: CreateTeamPayload,
    tournamentId: string = this.defaultTournamentId
  ): Observable<Team> {
    return this.http.post<Team>(
      `${this.base}/teams/tournament/${tournamentId}/add-team`,
      team
    );
  }

  updateTeam(teamId: string, patch: UpdateTeamPayload): Observable<Team> {
    return this.http.patch<Team>(
      `${this.base}/teams/tournament/${teamId}/modify-team`,
      patch
    );
  }

  deleteTeam(teamId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/teams/tournament/${teamId}/delete-team`
    );
  }

  getPlayers(tournamentId: string) {
    return this.http.get<Player[]>(
      `${this.base}/teams/tournament/${tournamentId}/players`
    );
  }

  createPlayer(
    teamId: string,
    payload: CreatePlayerPayload
  ): Observable<Player> {
    return this.http.post<Player>(
      `${this.base}/teams/tournament/${teamId}/add-player`,
      payload
    );
  }

  updatePlayer(
    playerId: string,
    patch: UpdatePlayerPayload
  ): Observable<Player> {
    return this.http.patch<Player>(
      `${this.base}/teams/tournament/${playerId}/modify-player`,
      patch
    );
  }

  deletePlayer(playerId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/teams/tournament/${playerId}/delete-player`
    );
  }

  getMatches(stageId: string): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.base}/matches/stage/${stageId}`);
  }

  createMatch(payload: CreateMatchPayload): Observable<Match> {
    return this.http.post<Match>(`${this.base}/matches/create-match`, payload);
  }

  updateMatch(id: string, patch: UpdateMatchPayload): Observable<Match> {
    return this.http.patch<Match>(
      `${this.base}/matches/edit-match/${id}`,
      patch
    );
  }

  deleteMatch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/matches/delete-match/${id}`);
  }

  deleteAllMatchesByTournament(
    tournamentId: string
  ): Observable<{ count: number }> {
    return this.http.delete<{ count: number }>(
      `${this.base}/matches/delete-all-matches/${tournamentId}`
    );
  }

  deleteAllMatchesByStage(stageId: string): Observable<{ count: number }> {
    return this.http.delete<{ count: number }>(
      `${this.base}/matches/delete-all-matches-by-stage/${stageId}`
    );
  }

  generateRoundRobin(
    tournamentId: string,
    payload: GenerateRoundRobinPayload
  ): Observable<{ created: number }> {
    return this.http.post<{ created: number }>(
      `${this.base}/matches/generate-round-robin/${tournamentId}`,
      payload
    );
  }

  uploadTeamLogo(teamId: string, formData: FormData): Observable<Team> {
    return this.http.post<Team>(
      `${this.base}/teams/tournament/${teamId}/upload-logo`,
      formData
    );
  }

  uploadTournamentVenueImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.base}/tournaments/${id}/upload-venue`,
      formData
    );
  }
}
