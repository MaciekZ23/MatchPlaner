import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { Match } from '../../models/match.model';
import { isWithinLive } from '../../../core/utils';
import { stringsMatchDetails } from '../../misc';

@Component({
  selector: 'app-match-card',
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.scss'],
})
export class MatchCardComponent implements OnInit, OnDestroy {
  @Input() match!: Match;
  @Output() openDetails = new EventEmitter<Match>();

  moduleStrings = stringsMatchDetails;

  private readonly cd = inject(ChangeDetectorRef);
  private tickSub?: Subscription;

  private readonly LIVE_PRE_MS = 0;
  private readonly LIVE_WINDOW_MS = 50 * 60 * 1000;

  ngOnInit(): void {
    this.tickSub = interval(30_000).subscribe(() => this.cd.markForCheck());
  }

  ngOnDestroy(): void {
    this.tickSub?.unsubscribe();
  }

  onClick() {
    this.openDetails.emit(this.match);
  }

  get isFinished(): boolean {
    return this.match.status === 'FINISHED';
  }

  get isLive(): boolean {
    if (this.isFinished || !this.match?.kickoffISO) return false;
    return isWithinLive(
      this.match.kickoffISO,
      this.LIVE_WINDOW_MS,
      this.LIVE_PRE_MS
    );
  }

  get isScheduled(): boolean {
    return !this.isFinished && !this.isLive;
  }

  getScoreText(side: 'A' | 'B'): string | number {
    if (!this.isFinished) return '-';
    return side === 'A' ? this.match.scoreA : this.match.scoreB;
  }

  getBadgeClass(side: 'A' | 'B') {
    if (!this.isFinished) return this.isLive ? 'badge-live' : 'badge-scheduled';

    const a = this.match.scoreA;
    const b = this.match.scoreB;
    const mine = side === 'A' ? a : b;
    const opp = side === 'A' ? b : a;

    if (mine > opp) return 'bg-success';
    if (mine < opp) return 'bg-danger';
    return 'bg-warning text-dark';
  }
}
