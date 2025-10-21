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
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchCardComponent } from '../../../calendar/components/match-card/match-card.component';
import { PlayoffsBracketService } from '../../services/playoffs-bracket.service';
import { BracketMatch } from '../../models';
import { BracketRoundPipe } from '../../pipes/bracket-round.pipe';
import {
  combineLatest,
  map,
  Observable,
  shareReplay,
  Subscription,
} from 'rxjs';
import { Team as CoreTeam, Player as CorePlayer } from '../../../core/models';
import { stringsPlayoffsBracket } from '../../misc';
import { Match } from '../../../calendar/models/match.model';

import { TournamentStore } from '../../../core/services/tournament-store.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-playoffs-bracket',
  imports: [
    CommonModule,
    BracketRoundPipe,
    MatchCardComponent,
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
  @Output() deleteAllRequested = new EventEmitter<string>();
  @Output() voteRequested = new EventEmitter<{
    matchId: string;
    playerId: string;
    playerName?: string;
  }>();
  @Output() deleteMatchRequested = new EventEmitter<Match>();
  @Output() editMatchRequested = new EventEmitter<Match>();
  @Output() generatePlayOffsRequested = new EventEmitter<void>();
  @Output() matchClicked = new EventEmitter<Match>();

  @ViewChild('collapseBtn', { static: true })
  collapseBtn!: ElementRef<HTMLElement>;
  private collapseTooltip: any | null = null;

  moduleStrings = stringsPlayoffsBracket;

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

  @ViewChildren('cardProbe', { read: ElementRef })
  private probes!: QueryList<ElementRef<HTMLElement>>;

  readonly bracket = inject(PlayoffsBracketService);
  private readonly store = inject(TournamentStore);
  private readonly cd = inject(ChangeDetectorRef);
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
    this.initCollapseTooltip();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.ro?.disconnect();
    this.disposeCollapseTooltip();
  }

  onRequestVoteConfirm(e: {
    matchId: string;
    playerId: string;
    playerName?: string;
  }) {
    this.voteRequested.emit(e);
  }

  onRequestEditMatch(match: Match): void {
    this.editMatchRequested.emit(match);
  }

  onRequestDeleteMatch(match: Match): void {
    this.deleteMatchRequested.emit(match);
  }

  onDeleteAllPlayoffMatches(): void {
    this.deleteAllRequested.emit(this.stageId);
  }

  onGenerateRequested(): void {
    this.generatePlayOffsRequested.emit();
  }

  openDetails(m: Match) {
    this.matchClicked.emit(m);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    const el = this.collapseBtn?.nativeElement;
    if (!el) return;
    el.setAttribute(
      'data-bs-title',
      this.isCollapsed ? 'Rozwiń sekcję' : 'Zwiń sekcję'
    );

    const bs = (window as any).bootstrap;
    const inst = this.collapseTooltip ?? bs?.Tooltip?.getInstance?.(el);

    if (inst?.setContent) {
      inst.setContent({
        '.tooltip-inner': el.getAttribute('data-bs-title') || '',
      });
    } else if (bs?.Tooltip) {
      inst?.dispose?.();
      this.collapseTooltip = new bs.Tooltip(el, { placement: 'top' });
    }
  }

  hideTooltip(ev: Event) {
    const el = ev.currentTarget as HTMLElement;
    const bs = (window as any).bootstrap;
    const inst = bs?.Tooltip?.getInstance?.(el);
    inst?.hide();
    el.blur();
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

  trackMatch = (_: number, m: BracketMatch | Match) => (m as any).id;
  trackRound = (_: number, r: number) => r;

  private initCollapseTooltip(): void {
    const bs = (window as any).bootstrap;
    if (!bs?.Tooltip) return;
    const el = this.collapseBtn?.nativeElement;
    if (!el) return;
    this.collapseTooltip =
      bs.Tooltip.getInstance?.(el) ?? new bs.Tooltip(el, { placement: 'top' });
  }

  private disposeCollapseTooltip(): void {
    this.collapseTooltip?.dispose?.();
    this.collapseTooltip = null;
  }
}
