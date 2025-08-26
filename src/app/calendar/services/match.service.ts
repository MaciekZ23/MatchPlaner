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
import {
  formatFullDate,
  toLocalWallClockISO,
  capitalizeFirst,
} from '../../core/utils';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly store = inject(TournamentStore);

  getCalendarDays(): CalendarDay[] {
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

          // Mecze z pierwszego etapu fazy grupowej (kalendarz ligowy)
          const groupStage = tournament.stages.find((s) => s.kind === 'GROUP');
          // Pobranie meczów dla etapu
          const matches: CoreMatch[] = groupStage
            ? matchesByStage.get(groupStage.id) ?? []
            : [];

          // Utworzenie „wiader” na dni kalendarza
          const buckets = new Map<string, UiMatch[]>();

          // Sortowanie po dacie rosnąco
          for (const m of [...matches].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )) {
            // Lookup drużyn — nazwy, logotypy
            const home = teamMap.get(m.homeTeamId);
            const away = teamMap.get(m.awayTeamId);
            // Zliczenie wyniku z eventów + przełożenie na detale UI
            const { scoreA, scoreB, details } = this.toUiDetails(m, playerMap);

            // Traktujemy datę ISO z backendu bez przesunięcia o ileś godzin
            const localIso = toLocalWallClockISO(m.date);
            // Mapowanie: CoreMatch -> UiMatch
            const ui: UiMatch = {
              teamA: home?.name ?? m.homeTeamId,
              teamB: away?.name ?? m.awayTeamId,
              scoreA,
              scoreB,
              group: m.groupId,
              logoA: home?.logo,
              logoB: away?.logo,
              details,
              status: this.computeUiStatus(m),
              kickoffISO: localIso,
            };

            // Nagłówek dnia liczony również po lokalnym ISO
            const dayKey = capitalizeFirst(
              formatFullDate(localIso, tournamentTz, 'pl-PL')
            );

            // Dodanie meczu do właściwego „wiadra” dnia
            if (!buckets.has(dayKey)) buckets.set(dayKey, []);
            buckets.get(dayKey)!.push(ui);
          }

          // Zamiana wiader na listę dni kalendarza
          const days: CalendarDay[] = [];
          for (const [date, dayMatches] of buckets) {
            days.push({ date, matches: dayMatches });
          }
          return days;
        })
      )
      .subscribe((days) => (snapshot = days));

    // Zwrócenie snapshotu — pierwszy wynik z combineLatest
    return snapshot;
  }

  private toUiDetails(
    m: CoreMatch,
    playerMap: Map<string, CorePlayer>
  ): { scoreA: number; scoreB: number; details: MatchDetail[] } {
    let scoreA = 0;
    let scoreB = 0;
    const details: MatchDetail[] = [];

    const events = (m.events ?? []).slice().sort((a, b) => a.minute - b.minute);

    for (const ev of events) {
      const playerName = playerMap.get(ev.playerId)?.name ?? ev.playerId;
      const isHome = ev.teamId === m.homeTeamId;
      const teamSide: 'A' | 'B' = isHome ? 'A' : 'B';

      switch (ev.type) {
        case 'GOAL': {
          if (isHome) scoreA++;
          else scoreB++;

          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${scoreA} - ${scoreB}`,
            scoringTeam: teamSide,
            event: 'GOAL',
          } as MatchDetail);
          break;
        }

        case 'OWN_GOAL': {
          const scoringSide: 'A' | 'B' = isHome ? 'B' : 'A';
          if (isHome) scoreB++;
          else scoreA++;

          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${scoreA} - ${scoreB}`,
            scoringTeam: scoringSide,
            event: 'OWN_GOAL',
          } as MatchDetail);
          break;
        }

        case 'CARD': {
          details.push({
            player: playerName,
            time: String(ev.minute),
            score: `${scoreA} - ${scoreB}`,
            scoringTeam: teamSide,
            event: 'CARD',
            card: ev.card,
          } as MatchDetail);
          break;
        }
        default:
          break;
      }
    }

    if (m.score) {
      scoreA = m.score.home;
      scoreB = m.score.away;
    }
    return { scoreA, scoreB, details };
  }

  private computeUiStatus(m: CoreMatch): 'SCHEDULED' | 'FINISHED' {
    return m.status === 'FINISHED' ? 'FINISHED' : 'SCHEDULED';
  }
}
