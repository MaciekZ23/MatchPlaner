import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ITournamentApi } from './tournament.api';
import { Match, Player, Team, Tournament } from '../models';

@Injectable({ providedIn: 'root' })
export class HttpTournamentApi implements ITournamentApi {
  private readonly baseUrl = '/api';
  private readonly defaultTournamentId = 't1';

  constructor(private http: HttpClient) {}

  getTournament(id: string = this.defaultTournamentId): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.baseUrl}/v1/tournaments/${id}`);
  }

  getMatches(_stageId: string): Observable<Match[]> {
    return of([]);
  }

  getPlayers(_tournamentId: string): Observable<Player[]> {
    return of([]);
  }

  getTeams(_tournamentId: string): Observable<Team[]> {
    return of([]);
  }
}
