import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { CalendarDay } from '../models/calendar-day.model';
import { Match as UiMatch } from '../models/match.model';
import { MatchDetail } from '../models/match-detail.model';
import { TournamentStore } from '../../core/services/tournament-store.service';
import {
  Match as CoreMatch,
  Player as CorePlayer,
  CreateMatchPayload,
  GenerateRoundRobinPayload,
  UpdateMatchPayload,
} from '../../core/models/tournament.models';
import { formatFullDate, capitalizeFirst } from '../../core/utils';
import { TOURNAMENT_API } from '../../core/api/tournament.api';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly store = inject(TournamentStore);
  private readonly api = inject(TOURNAMENT_API);

  getCalendarDays$() {
    return combineLatest([
      this.store.tournament$,
      this.store.matchesByStage$,
      this.store.teamMap$,
      this.store.playerMap$,
    ]).pipe(
      map(([tournament, matchesByStage, teamMap, playerMap]) => {
        const tournamentTz = tournament.timezone ?? 'Europe/Warsaw';

        const groupStage = tournament.stages.find((s) => s.kind === 'GROUP');
        const matches: CoreMatch[] = groupStage
          ? matchesByStage.get(groupStage.id) ?? []
          : [];

        const buckets = new Map<string, UiMatch[]>();

        for (const m of [...matches].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )) {
          const home = m.homeTeamId ? teamMap.get(m.homeTeamId) : undefined;
          const away = m.awayTeamId ? teamMap.get(m.awayTeamId) : undefined;
          const { scoreA, scoreB, details } = this.toUiDetails(m, playerMap);

          const ui: UiMatch = {
            id: m.id,
            stageId: m.stageId,
            groupId: m.groupId ?? null,
            round: m.round ?? null,
            index: m.index ?? null,
            date: m.date,
            status: this.computeUiStatus(m),
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            homeSourceKind: m.homeSourceKind ?? null,
            homeSourceRef: m.homeSourceRef ?? null,
            awaySourceKind: m.awaySourceKind ?? null,
            awaySourceRef: m.awaySourceRef ?? null,
            score: m.score,
            events: m.events,
            lineups: m.lineups,

            teamA: home?.name ?? m.homeTeamId ?? '-',
            teamB: away?.name ?? m.awayTeamId ?? '-',
            scoreA,
            scoreB,
            logoA: home?.logo,
            logoB: away?.logo,
            details,
          };

          const dayKey = capitalizeFirst(
            formatFullDate(m.date, tournamentTz, 'pl-PL')
          );

          if (!buckets.has(dayKey)) buckets.set(dayKey, []);
          buckets.get(dayKey)!.push(ui);
        }

        const days: CalendarDay[] = [];
        for (const [date, dayMatches] of buckets) {
          days.push({ date, matches: dayMatches });
        }
        return days;
      })
    );
  }

  createMatch$(payload: CreateMatchPayload): Observable<CoreMatch> {
    return this.api.createMatch(payload);
  }

  updateMatch$(id: string, patch: UpdateMatchPayload): Observable<CoreMatch> {
    return this.api.updateMatch(id, patch);
  }

  deleteMatch$(id: string): Observable<void> {
    return this.api.deleteMatch(id);
  }

  deleteAllByTournament$(tournamentId: string): Observable<{ count: number }> {
    return this.api.deleteAllMatchesByTournament(tournamentId);
  }

  deleteAllByStage$(stageId: string): Observable<{ count: number }> {
    return this.api.deleteAllMatchesByStage(stageId);
  }

  generateRoundRobin$(
    tournamentId: string,
    payload: GenerateRoundRobinPayload
  ): Observable<{ created: number }> {
    return this.api.generateRoundRobin(tournamentId, payload);
  }

  private toUiDetails(
    m: CoreMatch,
    playerMap: Map<string, CorePlayer>
  ): { scoreA: number; scoreB: number; details: MatchDetail[] } {
    let liveA = 0;
    let liveB = 0;
    const details: MatchDetail[] = [];

    const events = (m.events ?? []).slice().sort((a, b) => a.minute - b.minute);

    for (const ev of events) {
      const playerName = playerMap.get(ev.playerId)?.name ?? ev.playerId;
      const isHome = ev.teamId === m.homeTeamId;
      const teamSide: 'A' | 'B' = isHome ? 'A' : 'B';

      switch (ev.type) {
        case 'GOAL': {
          if (isHome) liveA++;
          else liveB++;

          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${liveA} - ${liveB}`,
            scoringTeam: teamSide,
            event: 'GOAL',
          } as MatchDetail);
          break;
        }

        case 'OWN_GOAL': {
          const scoringSide: 'A' | 'B' = isHome ? 'B' : 'A';
          if (isHome) liveB++;
          else liveA++;

          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${liveA} - ${liveB}`,
            scoringTeam: scoringSide,
            event: 'OWN_GOAL',
          } as MatchDetail);
          break;
        }

        case 'CARD': {
          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${liveA} - ${liveB}`,
            scoringTeam: teamSide,
            event: 'CARD',
            card: ev.card,
          } as MatchDetail);
          break;
        }
        case 'ASSIST': {
          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${liveA} - ${liveB}`,
            scoringTeam: teamSide,
            event: 'ASSIST',
          } as MatchDetail);
          break;
        }

        default:
          break;
      }
    }

    const scoreA = m.score?.home ?? 0;
    const scoreB = m.score?.away ?? 0;
    return { scoreA, scoreB, details };
  }

  private computeUiStatus(m: CoreMatch): 'SCHEDULED' | 'FINISHED' {
    return m.status === 'FINISHED' ? 'FINISHED' : 'SCHEDULED';
  }
}
