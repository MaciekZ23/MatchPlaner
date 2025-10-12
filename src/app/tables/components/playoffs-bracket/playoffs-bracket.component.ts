import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  inject,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchCardComponent } from '../../../calendar/components/match-card/match-card.component';
import { MatchDetailsModalComponent } from '../../../calendar/components/match-details-modal/match-details-modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PlayoffsBracketService } from '../../services/playoffs-bracket.service';
import { BracketMatch, BracketTeamSlot } from '../../models';
import { BracketRoundPipe } from '../../pipes/bracket-round.pipe';
import {
  combineLatest,
  finalize,
  map,
  Observable,
  shareReplay,
  Subscription,
  take,
} from 'rxjs';
import { Team as CoreTeam, Player as CorePlayer } from '../../../core/models';
import { stringsPlayoffsBracket } from '../../misc';
import { stringsConfirmModal } from '../../../calendar/misc';
import { Match } from '../../../calendar/models/match.model';
import { GeneratePlayoffsPayload } from '../../../core/models/playoffs.models';
import { TournamentStore } from '../../../core/services/tournament-store.service';
import { VoteFacade } from '../../../calendar/services/vote.facade';
import { MatchService } from '../../../calendar/services/match.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-playoffs-bracket',
  imports: [
    CommonModule,
    BracketRoundPipe,
    MatchCardComponent,
    MatchDetailsModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './playoffs-bracket.component.html',
  styleUrl: './playoffs-bracket.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayoffsBracketComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() stageId!: string;

  @ViewChild('confirmModal', { static: true })
  confirmModal!: ConfirmModalComponent;

  @ViewChild('deleteAllPlayoffMatches')
  deleteAllPlayoffMatchesConfirm!: ConfirmModalComponent;

  moduleStrings = stringsPlayoffsBracket;
  confirmStrings = stringsConfirmModal;

  hasBracket$!: Observable<boolean>;
  canGenerate$!: Observable<boolean>;
  matches$!: Observable<BracketMatch[]>;
  rounds$!: Observable<number[]>;
  uiMatchById$!: Observable<Map<string, Match>>;
  roundSides$!: Observable<{ left: number[]; right: number[] }>;
  roundOffsetMult$!: Observable<Map<number, number>>;

  readonly teamMap$: Observable<Map<string, CoreTeam>>;
  readonly playerMap$: Observable<Map<string, CorePlayer>>;

  matchCardHeight = 150;
  vGap = 30;
  isCollapsed = true;

  selectedMatch: Match | null = null;

  @ViewChildren('cardProbe', { read: ElementRef })
  private probes!: QueryList<ElementRef<HTMLElement>>;

  readonly bracket = inject(PlayoffsBracketService);
  private readonly store = inject(TournamentStore);
  private readonly voteFacade = inject(VoteFacade);
  private readonly cd = inject(ChangeDetectorRef);
  private matchService = inject(MatchService);
  private auth = inject(AuthService);
  private ro?: ResizeObserver;
  private subs = new Subscription();

  isGenerating$ = this.bracket.generating$;
  isAdmin$ = this.auth.isAdmin$;

  constructor() {
    this.teamMap$ = this.store.teamMap$;
    this.playerMap$ = this.store.playerMap$;
  }

  ngOnInit(): void {
    this.bracket.loadByTournament();
    this.matches$ = this.bracket.getMatches$(this.stageId);
    this.rounds$ = this.bracket.rounds$(this.stageId);
    this.uiMatchById$ = this.bracket.uiMatchById$(this.stageId);
    this.roundSides$ = this.bracket.roundsForSides$(this.stageId);
    this.roundOffsetMult$ = this.bracket.offsetMultipliers$(this.stageId);
    this.hasBracket$ = this.bracket.hasBracketForStage$(this.stageId);

    this.canGenerate$ = combineLatest([
      this.isGenerating$,
      this.hasBracket$,
    ]).pipe(
      map(([gen, has]) => !gen && !has),
      shareReplay(1)
    );
  }

  ngAfterViewInit(): void {
    this.subs.add(
      this.probes.changes.subscribe(() => this.measureCardHeight())
    );
    this.ro = new ResizeObserver(() => this.measureCardHeight());
    this.ro.observe(document.body);
    setTimeout(() => this.measureCardHeight());
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.ro?.disconnect();
  }

  async onRequestVoteConfirm(e: {
    matchId: string;
    playerId: string;
    playerName?: string;
  }) {
    const playerName = e.playerName ?? e.playerId;
    const ok = await this.confirmModal.open({
      title: this.confirmStrings.title,
      message: `${this.confirmStrings.message} (${playerName})`,
      labels: this.confirmStrings.labels,
      confirmVariant: 'primary',
      size: 'md',
    });

    if (ok) {
      this.voteFacade.voteFor(e.matchId as any, e.playerId);
    }
  }

  async onDeleteAllPlayoffMatches(): Promise<void> {
    const ok = await this.deleteAllPlayoffMatchesConfirm.open({
      title: this.moduleStrings.deleteAllMatchesTitle,
      message: this.moduleStrings.deleteAllMatchesMsg,
      confirmVariant: 'danger',
      labels: {
        confirm: this.moduleStrings.deleteModalLabels?.confirm ?? 'Usuń',
        cancel: this.moduleStrings.deleteModalLabels?.cancel ?? 'Anuluj',
      },
      size: 'md',
    });
    if (!ok) return;

    this.matchService
      .deleteAllByStage$(this.stageId)
      .pipe(take(1))
      .subscribe({
        next: ({ count }) => {
          this.store.refreshMatchesForStage(this.stageId);
          this.bracket.loadByTournament();
          console.log(`Usunięto ${count} mecz(e/y) z etapu PLAYOFF`);
        },
        error: (err) =>
          console.error('Błąd usuwania wszystkich meczów playoff:', err),
      });
  }

  openDetails(match: Match): void {
    this.selectedMatch = match;
  }

  closeDetails(): void {
    this.selectedMatch = null;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  leftHalf(all: BracketMatch[], r: number) {
    return this.bracket.splitRoundForSide(all, r, 'left');
  }

  rightHalf(all: BracketMatch[], r: number) {
    return this.bracket.splitRoundForSide(all, r, 'right');
  }

  private measureCardHeight(): void {
    const el = this.probes?.first?.nativeElement;
    if (!el) {
      return;
    }

    const h = Math.round(el.getBoundingClientRect().height);
    if (h > 0 && h !== this.matchCardHeight) {
      this.matchCardHeight = h;
      this.cd.markForCheck();
    }
  }

  generateBracket(): void {
    const payload: Partial<GeneratePlayoffsPayload> = {
      startDateISO: new Date().toISOString(),
      matchDurationMin: 40,
      gapBetweenMatchesMin: 10,
      matchesPerDay: 8,
      withThirdPlace: true,
      stageName: 'Playoffs',
    };

    this.bracket.generateForCurrentTournament(payload);
  }

  trackMatch = (_: number, m: BracketMatch | Match) => (m as any).id;
  trackRound = (_: number, r: number) => r;
}
