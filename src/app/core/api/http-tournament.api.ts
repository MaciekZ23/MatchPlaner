import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITournamentApi } from './tournament.api';
import { Match, Player, Team, Tournament } from '../models';
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

  getTeams(tournamentId: string): Observable<Team[]> {
    return this.http.get<Team[]>(`/api/v1/teams/tournament/${tournamentId}`);
  }

  getPlayers(tournamentId: string) {
    return this.http.get<Player[]>(
      `/api/v1/teams/tournament/${tournamentId}/players`
    );
  }

  getMatches(stageId: string): Observable<Match[]> {
    return this.http.get<Match[]>(`/api/v1/matches/stage/${stageId}`);
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
}
