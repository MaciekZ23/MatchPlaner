import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Observable,
  shareReplay,
  of,
  map,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { Match } from '../../models/match.model';
import { UiCandidate } from '../../models/candidate.model';
import { MatchDetailsActiveTab } from '../../../core/types';
import { Team as CoreTeam, Player as CorePlayer } from '../../../core/models';
import { stringsMatchDetails } from '../../misc';
import { VoteFacade } from '../../services/vote.facade';
import { UiVoteSummary } from '../../models/vote-summary.model';
import { countdownTo } from '../../services/helpers';

declare const bootstrap: any;

@Component({
  selector: 'app-match-details-modal',
  imports: [CommonModule],
  templateUrl: './match-details-modal.component.html',
  styleUrl: './match-details-modal.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchDetailsModalComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() match: Match | null = null;
  @Input() teamMap: Map<string, CoreTeam> | null = null;
  @Input() playerMap: Map<string, CorePlayer> | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() requestVoteConfirm = new EventEmitter<{
    matchId: string;
    playerId: string;
    playerName: string;
  }>();

  @ViewChild('modalRef', { static: true })
  modalRef!: ElementRef<HTMLDivElement>;

  moduleStrings = stringsMatchDetails;
  private modalInstance: any;

  activeTab: MatchDetailsActiveTab = 'DETAILS';
  selectedPlayerId: string | null = null;

  voting$!: Observable<any>;
  homeCandidates$!: Observable<UiCandidate[]>;
  awayCandidates$!: Observable<UiCandidate[]>;
  summary$!: Observable<UiVoteSummary[]>;
  countdown$!: Observable<string>;

  private facade = inject(VoteFacade);

  ngAfterViewInit(): void {
    this.modalInstance = bootstrap.Modal.getOrCreateInstance(
      this.modalRef.nativeElement,
      {
        backdrop: 'static',
        keyboard: false,
        focus: true,
      }
    );

    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.close.emit();
    });

    if (this.match) {
      this.modalInstance.show();
      this.setupVotingStreams(this.match);
      this.activeTab = 'DETAILS';
      this.selectedPlayerId = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match'] || changes['teamMap'] || changes['playerMap']) {
      if (this.match) {
        if (this.modalInstance) {
          this.modalInstance.show();
        }
        this.setupVotingStreams(this.match);
        this.activeTab = 'DETAILS';
        this.selectedPlayerId = null;
      } else {
        if (this.modalInstance) {
          this.modalInstance.hide();
        }
        this.selectedPlayerId = null;
      }
    }
  }

  ngOnDestroy(): void {
    try {
      this.modalInstance?.dispose?.();
    } catch {}
  }

  private setupVotingStreams(match: Match): void {
    this.voting$ = this.facade.voting$(match.id);

    // Zamieniamy null -> '' żeby NIE podawać nulli w dół
    const homeId: string = match.homeTeamId ?? '';
    const awayId: string = match.awayTeamId ?? '';

    // Minimalny obiekt zgodny z tym, czego używa VoteFacade.candidates$
    type MinimalMatchLocal = {
      id: string;
      homeTeamId: string;
      awayTeamId: string;
      status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
      lineups?: { homeGKIds?: string[]; awayGKIds?: string[] };
      score?: { home: number; away: number };
      scoreA?: number;
      scoreB?: number;
    };

    const minimal: MinimalMatchLocal = {
      id: match.id,
      homeTeamId: homeId,
      awayTeamId: awayId,
      status: match.status,
      lineups: match.lineups,
    };

    // Jeśli masz w UI pola scoreA/scoreB – też przekażemy (fallback dla helpersów)
    if (
      typeof (match as any).scoreA === 'number' ||
      typeof (match as any).scoreB === 'number'
    ) {
      minimal.scoreA = (match as any).scoreA ?? 0;
      minimal.scoreB = (match as any).scoreB ?? 0;
    }

    // Jeśli przyjdzie z backendu score: {home,away} – też przekażemy
    if ((match as any).score && typeof (match as any).score.home === 'number') {
      minimal.score = {
        home: (match as any).score.home,
        away: (match as any).score.away,
      };
    }

    // Kandydaci – nie wolno wołać fasady z null teamId → w razie braku zwracamy pustą listę
    if (homeId) {
      this.homeCandidates$ = this.facade.homeCandidates$(
        match.id,
        homeId,
        minimal
      );
    } else {
      this.homeCandidates$ = of([]);
    }

    if (awayId) {
      this.awayCandidates$ = this.facade.awayCandidates$(
        match.id,
        awayId,
        minimal
      );
    } else {
      this.awayCandidates$ = of([]);
    }

    this.summary$ = this.facade.summary$(match.id, this.teamMap ?? new Map());

    this.countdown$ = this.voting$.pipe(
      map((v) => v?.closesAtISO ?? null),
      distinctUntilChanged(),
      switchMap((iso) => {
        if (iso) {
          return countdownTo(iso);
        } else {
          return of('');
        }
      }),
      shareReplay(1)
    );

    this.facade.load(match.id);
  }

  onRequestClose(): void {
    this.modalInstance?.hide();
  }

  onClose() {
    this.close.emit();
  }

  switchTab(tab: MatchDetailsActiveTab) {
    this.activeTab = tab;
  }

  onToggleCandidate(playerId: string) {
    this.selectedPlayerId =
      this.selectedPlayerId === playerId ? null : playerId;
  }

  onVoteConfirm() {
    if (!this.match || !this.selectedPlayerId) {
      return;
    }
    const playerName =
      this.playerMap?.get(this.selectedPlayerId)?.name ?? this.selectedPlayerId;

    this.requestVoteConfirm.emit({
      matchId: this.match.id,
      playerId: this.selectedPlayerId,
      playerName,
    });
  }

  // Wyświetlenie w timeline tylko goli, samobóji i kartek (bez ASSIST)
  get detailsForTimeline() {
    const allowed = new Set(['GOAL', 'OWN_GOAL', 'CARD'] as const);
    return (this.match?.details ?? []).filter((d) =>
      allowed.has(d.event as any)
    );
  }

  get teamAScorers() {
    return this.match?.details.filter((d) => d.scoringTeam === 'A') ?? [];
  }

  get teamBScorers() {
    return this.match?.details.filter((d) => d.scoringTeam === 'B') ?? [];
  }

  get isFinished(): boolean {
    return this.match?.status === 'FINISHED';
  }

  get goalsA(): number {
    return this.teamAScorers.length;
  }

  get goalsB(): number {
    return this.teamBScorers.length;
  }

  get showScore(): boolean {
    if (!this.match) {
      return false;
    }
    return this.isFinished || this.goalsA + this.goalsB > 0;
  }

  get scoreText(): string {
    if (!this.match) {
      return '';
    }
    if (this.isFinished) {
      return `${this.match.scoreA} - ${this.match.scoreB}`;
    }
    return `${this.goalsA} - ${this.goalsB}`;
  }

  trackByPlayerId(_: number, c: UiCandidate) {
    return c.playerId;
  }
}
