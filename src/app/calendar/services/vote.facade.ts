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

type AnyMatch = CoreMatch | CalendarMatch;

@Injectable({ providedIn: 'root' })
export class VoteFacade {
  constructor(private vote: VoteService) {}

  // Inicjalizuje stan głosowania dla meczu (core lub calendar) budując VotingSeed i zapisując go w VoteService
  initMatch(
    match: AnyMatch,
    teamMap: Map<string, CoreTeam>,
    playerMap: Map<string, CorePlayer>
  ): void {
    const statusInfo = statusFromMatch({
      date: match.date,
      status: match.status,
    });

    const { matchId, homeTeamId, awayTeamId, events, lineups } =
      this.adaptMatch(match, playerMap);

    const seed = this.vote.buildSeedForMatch({
      matchId: matchId as MatchId,
      status: statusInfo.status,
      homeTeamId,
      awayTeamId,
      events,
      lineups,
      teamMap: new Map(
        [...teamMap.entries()].map(([id, t]) => [
          id,
          { id: t.id, name: t.name, playerIds: t.playerIds },
        ])
      ),
      playerMap: new Map(
        [...playerMap.entries()].map(([id, p]) => [
          id,
          {
            id: p.id,
            teamId: p.teamId,
            name: p.name,
            position: p.position,
            healthStatus: p.healthStatus,
            shirtNumber: p.shirtNumber,
          },
        ])
      ),
    });
    seed.closesAtISO = statusInfo.closesAtISO;
    this.vote.init(matchId as MatchId, seed);
  }

  // Strumień całego stanu głosowania dla meczu
  voting$(matchId: MatchId): Observable<VotingState> {
    return this.vote.selectState$(matchId);
  }

  // Strumień kandydatów z mapowanymi polami prezentacyjnymi
  candidates$(
    matchId: MatchId,
    match: AnyMatch,
    playerMap: Map<string, CorePlayer>
  ): Observable<UiCandidate[]> {
    return this.vote.selectState$(matchId).pipe(
      map((s) =>
        s.candidates.map((c) => {
          const player = playerMap.get(c.playerId);
          const teamId = player?.teamId ?? c.teamId;
          const conceded = this.goalsConcededForTeam(match, teamId);
          const hasCleanSheet = !!(
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
    match: AnyMatch,
    playerMap: Map<string, CorePlayer>
  ): Observable<UiCandidate[]> {
    return this.candidates$(matchId, match, playerMap).pipe(
      map((list) => list.filter((c) => c.teamId === homeTeamId))
    );
  }

  // Strumień kandydatów należących do drużyny gości
  awayCandidates$(
    matchId: MatchId,
    awayTeamId: TeamId,
    match: AnyMatch,
    playerMap: Map<string, CorePlayer>
  ): Observable<UiCandidate[]> {
    return this.candidates$(matchId, match, playerMap).pipe(
      map((list) => list.filter((c) => c.teamId === awayTeamId))
    );
  }

  // Oddanie głosu na wskazanego zawodnika
  voteFor(matchId: MatchId, playerId: string): void {
    this.vote.vote(matchId, playerId as any);
  }

  // Normalizacja różnych modeli meczu (core/calendar) do wspólnego formatu
  private adaptMatch(
    match: AnyMatch,
    playerMap: Map<string, CorePlayer>
  ): {
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
    events: Array<{
      playerId: string;
      type: 'GOAL' | 'OWN_GOAL' | 'ASSIST' | 'CARD';
      card?: 'YELLOW' | 'SECOND_YELLOW' | 'RED';
    }>;
    lineups?: { homeGKIds?: string[]; awayGKIds?: string[] };
  } {
    if (this.isCoreMatch(match)) {
      return {
        matchId: match.id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        events:
          match.events?.map((e) => ({
            playerId: e.playerId,
            type: e.type,
            card: e.card,
          })) ?? [],
        lineups: match.lineups,
      };
    }

    return {
      matchId: match.id,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      events: match.details.map((d) => ({
        playerId: this.resolvePlayerIdByName(d.player, playerMap),
        type: d.event,
        card: d.card,
      })),
      lineups: match.lineups,
    };
  }

  // Policzenie liczby straconych goli przez wskazaną drużynę
  private goalsConcededForTeam(match: AnyMatch, teamId: string): number {
    if (this.isCoreMatch(match)) {
      if (!match.score) return 0;
      return teamId === match.homeTeamId ? match.score.away : match.score.home;
    } else {
      return teamId === match.homeTeamId ? match.scoreB : match.scoreA;
    }
  }

  private isCoreMatch(m: AnyMatch): m is CoreMatch {
    return 'score' in m;
  }

  // Znalezienie identyfikatora zawodnika po nazwie lub zwrócenie nazwy jako fallback
  private resolvePlayerIdByName(
    name: string,
    players?: Map<string, CorePlayer>
  ): string {
    if (!players || players.size === 0) {
      return name;
    }
    const found = [...players.values()].find((p) => p.name === name);
    return found?.id ?? name;
  }
}
