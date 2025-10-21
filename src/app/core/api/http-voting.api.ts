import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IVotingApi } from './voting.api';
import { MatchId, PlayerId, VotingStatus } from '../types';
import { VotingState, VoteResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpVotingApi implements IVotingApi {
  private readonly base = `${environment.apiUrl}/voting`;

  constructor(private http: HttpClient) {}

  getState(matchId: MatchId): Observable<VotingState> {
    return this.http.get<VotingState>(`${this.base}/${matchId}`);
  }

  vote(matchId: MatchId, playerId: PlayerId): Observable<VoteResponse> {
    return this.http.post<VoteResponse>(`${this.base}/vote/${matchId}`, {
      playerId,
    });
  }

  setStatus(
    matchId: MatchId,
    status: VotingStatus
  ): Observable<{ matchId: MatchId; status: VotingStatus; closedAt?: string }> {
    return this.http.patch<{
      matchId: MatchId;
      status: VotingStatus;
      closedAt?: string;
    }>(`${this.base}/status/${matchId}`, { status });
  }
}
