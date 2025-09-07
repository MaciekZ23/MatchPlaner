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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchCardComponent } from '../../../calendar/components/match-card/match-card.component';
import { BracketService } from '../../services/bracket.service';
import { BracketMatch, BracketTeamSlot } from '../../models';
import { BracketRoundPipe } from '../../pipes/bracket-round.pipe';
import { Observable, Subscription } from 'rxjs';
import { stringsPlayoffsBracket } from '../../misc';
import { Match } from '../../../calendar/models/match.model';

@Component({
  selector: 'app-playoffs-bracket',
  imports: [CommonModule, BracketRoundPipe, MatchCardComponent],
  templateUrl: './playoffs-bracket.component.html',
  styleUrl: './playoffs-bracket.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayoffsBracketComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  moduleStrings = stringsPlayoffsBracket;

  @Input() stageId!: string;

  isCollapsed = true;

  matches$!: Observable<BracketMatch[]>;
  rounds$!: Observable<number[]>;
  uiMatchById$!: Observable<Map<string, Match>>;
  roundSides$!: Observable<{ left: number[]; right: number[] }>;
  roundOffsetMult$!: Observable<Map<number, number>>;

  matchCardHeight = 150;
  vGap = 30;

  selectedMatch: Match | null = null;

  @ViewChildren('cardProbe', { read: ElementRef })
  private probes!: QueryList<ElementRef<HTMLElement>>;

  readonly bracket = inject(BracketService);
  private readonly cd = inject(ChangeDetectorRef);
  private ro?: ResizeObserver;
  private subs = new Subscription();

  ngOnInit(): void {
    this.bracket.initAutoGeneration(this.stageId);
    this.matches$ = this.bracket.getMatches$(this.stageId);
    this.rounds$ = this.bracket.rounds$(this.stageId);
    this.uiMatchById$ = this.bracket.uiMatchById$(this.stageId);
    this.roundSides$ = this.bracket.roundsForSides$(this.stageId);
    this.roundOffsetMult$ = this.bracket.offsetMultipliers$(this.stageId);
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

  trackMatch = (_: number, m: BracketMatch | Match) => (m as any).id;
  trackRound = (_: number, r: number) => r;
}
