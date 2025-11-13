import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
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
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-match-card',
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.scss'],
})
export class MatchCardComponent implements OnInit, OnDestroy {
  @Input() match!: Match;
  @Output() openDetails = new EventEmitter<Match>();
  @Output() editMatch = new EventEmitter<Match>();
  @Output() deleteMatch = new EventEmitter<Match>();

  moduleStrings = stringsMatchDetails;

  private readonly auth = inject(AuthService);
  private readonly cd = inject(ChangeDetectorRef);
  private tickSub?: Subscription;

  private readonly LIVE_PRE_MS = 0;
  private readonly LIVE_WINDOW_MS = 50 * 60 * 1000;

  isAdmin$ = this.auth.isAdmin$;

  /**
   * Subskrybuje interwał co 30 sekund w celu odświeżenia widoku
   * np. zmiana statusu meczu na LIVE / FINISHED
   */
  ngOnInit(): void {
    this.tickSub = interval(30_000).subscribe(() => this.cd.markForCheck());
  }

  /**
   * Czyści subskrypcję interwału przy niszczeniu komponentu
   */
  ngOnDestroy(): void {
    this.tickSub?.unsubscribe();
  }

  /**
   * Obsługuje klawisze Enter i Spacja jako kliknięcie karty meczu
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onClick();
    }
  }

  /**
   * Obsługuje kliknięcie karty.
   * Jeśli kliknięto wewnątrz przycisku to nie otwiera modala szczegółów
   */
  onCardClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    this.onClick();
  }

  /**
   * Emituje zdarzenie otwarcia szczegółów meczu
   */
  onClick() {
    this.openDetails.emit(this.match);
  }

  /**
   * Emituje żądanie edycji meczu
   */
  onEdit(ev: MouseEvent): void {
    ev.stopPropagation();
    this.editMatch.emit(this.match);
  }

  /**
   * Emituje żądanie usunięcia meczu
   */
  onDelete(ev: MouseEvent): void {
    ev.stopPropagation();
    this.deleteMatch.emit(this.match);
  }

  get isFinished(): boolean {
    return this.match.status === 'FINISHED';
  }

  get isLive(): boolean {
    if (this.isFinished || !this.match?.date) return false;
    return isWithinLive(this.match.date, this.LIVE_WINDOW_MS, this.LIVE_PRE_MS);
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
