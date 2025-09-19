import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchId, PlayerId, VotingStatus } from '../types';
import { VotingState, VoteResponse } from '../models';

export interface IVotingApi {
  getState(matchId: MatchId): Observable<VotingState>;
  vote(matchId: MatchId, player: PlayerId): Observable<VoteResponse>;
  setStatus(
    matchId: MatchId,
    status: VotingStatus
  ): Observable<{ matchId: MatchId; status: VotingStatus; closedAt?: string }>;
}

export const VOTING_API = new InjectionToken<IVotingApi>('VOTING_API');
