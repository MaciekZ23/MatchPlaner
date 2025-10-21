import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IPlayoffsApi } from './playoffs.api';
import { Match } from '../models';
import { GeneratePlayoffsPayload } from '../models/playoffs.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpPlayoffsApi implements IPlayoffsApi {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBracketByTournament(tournamentId: string): Observable<Match[]> {
    return this.http
      .get<{ matches: Match[] }>(`${this.base}/playoffs/${tournamentId}`)
      .pipe(map((r) => r.matches ?? []));
  }

  generate(
    tournamentId: string,
    payload: GeneratePlayoffsPayload
  ): Observable<{ ok: boolean; count: number; matches?: Match[] }> {
    return this.http.post<{ ok: boolean; count: number; matches?: Match[] }>(
      `${this.base}/playoffs/generate/${tournamentId}`,
      payload
    );
  }
}
