import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchCardComponent } from '../match-card/match-card.component';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-calendar-day',
  imports: [CommonModule, MatchCardComponent],
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.scss',
  standalone: true,
})
export class CalendarDayComponent implements AfterViewInit, OnDestroy {
  @Input() date: string = '';
  @Input() matches: any[] = [];
  @Output() matchClicked = new EventEmitter<Match>();
  @Output() editMatch = new EventEmitter<Match>();
  @Output() deleteMatch = new EventEmitter<Match>();

  @ViewChild('toggleBtn', { static: false })
  toggleBtn!: ElementRef<HTMLElement>;

  expanded = false;
  private collapseTt: any | null = null;

  /**
   * Po renderze inicjalizuje tooltip przycisku rozwijania sekcji
   */
  ngAfterViewInit(): void {
    const bs = (window as any)?.bootstrap;
    const el = this.toggleBtn?.nativeElement;
    if (bs?.Tooltip && el) {
      this.collapseTt =
        bs.Tooltip.getInstance?.(el) ??
        new bs.Tooltip(el, { placement: 'top' });
    }
  }

  /**
   * Czyści tooltip przy niszczeniu komponentu
   */
  ngOnDestroy(): void {
    this.collapseTt?.dispose?.();
    this.collapseTt = null;
  }

  /**
   * Rozwija lub zwija listę meczów dla dnia
   * i aktualizuje treść tooltipa
   */
  toggle() {
    this.expanded = !this.expanded;
    const bs = (window as any)?.bootstrap;
    const el = this.toggleBtn?.nativeElement;
    if (!bs?.Tooltip || !el) {
      return;
    }

    el.setAttribute(
      'data-bs-title',
      this.expanded ? 'Zwiń sekcję' : 'Rozwiń sekcję'
    );

    const inst = this.collapseTt ?? bs.Tooltip.getInstance?.(el);
    if (inst?.setContent) {
      inst.setContent({
        '.tooltip-inner': el.getAttribute('data-bs-title') || '',
      });
    } else {
      inst?.dispose?.();
      this.collapseTt = new bs.Tooltip(el, { placement: 'top' });
    }
  }

  /**
   * Ukrywa tooltip np. po kliknięciu przycisku
   */
  hideTooltip(ev: Event) {
    const el = ev.currentTarget as HTMLElement;
    const bs = (window as any).bootstrap;
    const inst = bs?.Tooltip?.getInstance?.(el);
    inst?.hide();
    el.blur();
  }

  /**
   * Emituje zdarzenie kliknięcia w mecz
   */
  onMatchClick(match: any) {
    this.matchClicked.emit(match);
  }

  /**
   * Emituje zdarzenie żądania edycji meczu
   */
  onEditMatch(match: any): void {
    this.editMatch.emit(match);
  }

  /**
   * Emituje zdarzenie żądania usunięcia meczu
   */
  onDeleteMatch(match: any): void {
    this.deleteMatch.emit(match);
  }

  /**
   * trackBy dla *ngFor optymalizuje renderowanie listy meczów
   */
  trackByMatchId = (_: number, m: Match) => m.id;
}
