import { Injectable, inject } from '@angular/core';
import { combineLatest, map, take } from 'rxjs';

import { CalendarDay } from '../models/calendar-day.model';
import { Match as UiMatch } from '../models/match.model';
import { MatchDetail } from '../models/match-detail.model';

import { TournamentStore } from '../../core/services/tournament-store.service';
import {
  Match as CoreMatch,
  Player as CorePlayer,
} from '../../core/models/tournament.models';

import { formatFullDate, toLocalWallClockISO } from '../../core/utils';

@Injectable({ providedIn: 'root' })
export class MatchService {
  /** Jedno źródło prawdy dla turnieju, meczów, drużyn i zawodników. */
  private readonly store = inject(TournamentStore);

  /**
   * Snapshot listy dni kalendarza z meczami (pierwsza emisja z core).
   * UWAGA: na potrzeby mocków stripujemy strefę z ISO (toLocalWallClockISO),
   * żeby godzina na karcie była dokładnie „taka jak wpisana” (bez +2h).
   */
  getMockData(): CalendarDay[] {
    let snapshot: CalendarDay[] = [];

    combineLatest([
      this.store.tournament$,
      this.store.matchesByStage$,
      this.store.teamMap$,
      this.store.playerMap$,
    ])
      .pipe(
        take(1),
        map(([tournament, matchesByStage, teamMap, playerMap]) => {
          const tournamentTz = tournament.timezone ?? 'Europe/Warsaw';

          // Mecze z pierwszego etapu fazy grupowej (kalendarz ligowy).
          const groupStage = tournament.stages.find((s) => s.kind === 'GROUP');
          const matches: CoreMatch[] = groupStage
            ? matchesByStage.get(groupStage.id) ?? []
            : [];

          // Posortuj po dacie, mapuj do UI i wrzucaj do „wiader” dni.
          const buckets = new Map<string, UiMatch[]>();

          for (const m of [...matches].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )) {
            const home = teamMap.get(m.homeTeamId);
            const away = teamMap.get(m.awayTeamId);

            const { scoreA, scoreB, details } = this.toUiDetails(m, playerMap);

            // <<< KLUCZOWE: traktujemy ISO z backendu jako „wall-clock” (bez przesunięcia)
            const localIso = toLocalWallClockISO(m.date);

            const ui: UiMatch = {
              teamA: home?.name ?? m.homeTeamId,
              teamB: away?.name ?? m.awayTeamId,
              scoreA,
              scoreB,
              group: m.groupId,
              logoA: home?.logo,
              logoB: away?.logo,
              details,
              status: this.computeUiStatus(m), // tylko SCHEDULED/FINISHED
              kickoffISO: localIso, // godzina do wyświetlenia bez +2h
            };

            // Nagłówek dnia liczony również po „lokalnym” ISO.
            const dayKey = this.capitalizeFirst(
              formatFullDate(localIso, tournamentTz, 'pl-PL')
            );

            if (!buckets.has(dayKey)) buckets.set(dayKey, []);
            buckets.get(dayKey)!.push(ui);
          }

          // Map -> CalendarDay[] (chronologicznie)
          const days: CalendarDay[] = [];
          for (const [date, dayMatches] of buckets) {
            days.push({ date, matches: dayMatches });
          }
          return days;
        })
      )
      .subscribe((days) => (snapshot = days));

    return snapshot;
  }

  // -------- helpers --------

  /** Buduje listę detali i wynik na podstawie zdarzeń GOAL (oraz finalnego score). */
  private toUiDetails(
    m: CoreMatch,
    playerMap: Map<string, CorePlayer>
  ): { scoreA: number; scoreB: number; details: MatchDetail[] } {
    let scoreA = 0;
    let scoreB = 0;
    const details: MatchDetail[] = [];

    const events = (m.events ?? []).slice().sort((a, b) => a.minute - b.minute);

    for (const ev of events) {
      if (ev.type !== 'GOAL') continue;

      const isHome = ev.teamId === m.homeTeamId;
      if (isHome) scoreA++;
      else scoreB++;

      const playerName = playerMap.get(ev.playerId)?.name ?? ev.playerId;

      details.push({
        player: playerName,
        time: String(ev.minute),
        score: `${scoreA} - ${scoreB}`,
        scoringTeam: isHome ? 'A' : 'B',
      });
    }

    if (m.score) {
      scoreA = m.score.home;
      scoreB = m.score.away;
    }

    return { scoreA, scoreB, details };
  }

  /**
   * Status domenowy (tylko SCHEDULED/FINISHED).
   * LIVE liczymy w komponencie (czas prezentacyjny, nie domenowy).
   */
  private computeUiStatus(m: CoreMatch): 'SCHEDULED' | 'FINISHED' {
    return m.status === 'FINISHED' ? 'FINISHED' : 'SCHEDULED';
  }

  /** Podnosi pierwszą literę (np. "sobota" → "Sobota"). */
  private capitalizeFirst(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
