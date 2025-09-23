import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ITournamentApi } from './tournament.api';
import { Match, Player, Team, Tournament } from '../models';

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

  createTeam(team: Team, tournamentId?: string): Observable<Team> {
    return this.http.post<Team>(
      `/api/v1/teams/tournament/${tournamentId}`,
      team
    );
  }

  updateTeam(teamId: string, patch: Partial<Team>): Observable<Team> {
    return this.http.patch<Team>(`/api/v1/teams/${teamId}`, patch);
  }

  deleteTeam(teamId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/teams/${teamId}`);
  }
}
