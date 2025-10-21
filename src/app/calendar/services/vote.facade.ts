import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Match as CalendarMatch } from '../models/match.model';
import { MatchId, TeamId } from '../../core/types';
import {
  Match as CoreMatch,
  Team as CoreTeam,
  Player as CorePlayer,
} from '../../core/models';
import { VotingState } from '../../core/models';
import { VoteService } from './vote.service';
import { statusFromMatch, positionPl, healthPl } from './helpers';
import { UiCandidate } from '../models/candidate.model';
import { UiVoteSummary } from '../models/vote-summary.model';

type MinimalMatch = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  score?: { home: number; away: number };
  scoreA?: number;
  scoreB?: number;
};

@Injectable({ providedIn: 'root' })
export class VoteFacade {
  constructor(private vote: VoteService) {}

  load(matchId: MatchId): void {
    this.vote.fetchState(matchId);
  }

  // Strumień całego stanu głosowania dla meczu
  voting$(matchId: MatchId): Observable<VotingState> {
    return this.vote.selectState$(matchId);
  }

  // Strumień kandydatów z mapowanymi polami prezentacyjnymi
  candidates$(
    matchId: MatchId,
    match?: MinimalMatch
  ): Observable<UiCandidate[]> {
    return this.vote.selectState$(matchId).pipe(
      map((s) =>
        s.candidates.map((c) => {
          const conceded = match
            ? goalsConcededForTeam(match, c.teamId)
            : undefined;
          const hasCleanSheet = !!(
            match &&
            c.isGoalkeeper &&
            c.playedAsGK &&
            conceded === 0
          );

          return {
            ...c,
            positionPl: positionPl(c.position),
            healthPl: healthPl(c.healthStatus),
            hasCleanSheet,
          };
        })
      )
    );
  }

  // Strumień kandydatów należących do drużyny gospodarzy
  homeCandidates$(
    matchId: MatchId,
    homeTeamId: TeamId,
    match?: MinimalMatch
  ): Observable<UiCandidate[]> {
    return this.candidates$(matchId, match).pipe(
      map((list) => list.filter((c) => c.teamId === homeTeamId))
    );
  }

  // Strumień kandydatów należących do drużyny gości
  awayCandidates$(
    matchId: MatchId,
    awayTeamId: TeamId,
    match?: MinimalMatch
  ): Observable<UiCandidate[]> {
    return this.candidates$(matchId, match).pipe(
      map((list) => list.filter((c) => c.teamId === awayTeamId))
    );
  }

  // Podsumowanie głosów (nazwy, drużyny, %, zwycięzcy) posortowane malejąco
  summary$(
    matchId: MatchId,
    teamMap: Map<string, CoreTeam>
  ): Observable<UiVoteSummary[]> {
    return this.vote.selectState$(matchId).pipe(
      map((state) => {
        const total = state.summary.reduce((acc, x) => acc + x.votes, 0);
        const byId = new Map(state.candidates.map((c) => [c.playerId, c]));
        const max = state.summary.reduce((m, x) => Math.max(m, x.votes), 0);

        const rows = state.summary.map<UiVoteSummary>((x) => {
          const cand = byId.get(x.playerId);
          const name = cand?.name ?? x.playerId;
          const teamId = cand?.teamId ?? '';
          const teamName = teamId
            ? teamMap.get(teamId)?.name ?? teamId
            : undefined;

          return {
            playerId: x.playerId,
            name,
            teamId,
            teamName,
            votes: x.votes,
            percent: total ? Math.round((x.votes / total) * 100) : 0,
            isWinner: max > 0 && x.votes === max,
          };
        });

        return rows.sort((a, b) => b.votes - a.votes);
      })
    );
  }

  // Oddanie głosu na wskazanego zawodnika
  voteFor(matchId: MatchId, playerId: string): void {
    this.vote.vote(matchId, playerId as any);
  }
}

function goalsConcededForTeam(match: MinimalMatch, teamId: string): number {
  if ('score' in match && match.score) {
    return teamId === match.homeTeamId ? match.score.away : match.score.home;
  }
  if ('scoreA' in match) {
    return teamId === match.homeTeamId ? match.scoreB ?? 0 : match.scoreA ?? 0;
  }
  return 0;
}
