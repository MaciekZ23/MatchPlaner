import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Match } from '../models';
import { GeneratePlayoffsPayload } from '../models/playoffs.models';

export interface IPlayoffsApi {
  getBracketByTournament(tournamentId: string): Observable<Match[]>;

  generate(
    tournamentId: string,
    payload: GeneratePlayoffsPayload
  ): Observable<{ ok: boolean; count: number; matches?: Match[] }>;
}

export const PLAYOFFS_API = new InjectionToken<IPlayoffsApi>('PLAYOFFS_API');
