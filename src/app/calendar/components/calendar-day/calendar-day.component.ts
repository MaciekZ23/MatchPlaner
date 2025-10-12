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

  ngAfterViewInit(): void {
    const bs = (window as any)?.bootstrap;
    const el = this.toggleBtn?.nativeElement;
    if (bs?.Tooltip && el) {
      this.collapseTt =
        bs.Tooltip.getInstance?.(el) ??
        new bs.Tooltip(el, { placement: 'top' });
    }
  }

  ngOnDestroy(): void {
    this.collapseTt?.dispose?.();
    this.collapseTt = null;
  }

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

  hideTooltip(ev: Event) {
    const el = ev.currentTarget as HTMLElement;
    const bs = (window as any).bootstrap;
    const inst = bs?.Tooltip?.getInstance?.(el);
    inst?.hide();
    el.blur();
  }

  onMatchClick(match: any) {
    this.matchClicked.emit(match);
  }

  onEditMatch(match: any): void {
    this.editMatch.emit(match);
  }

  onDeleteMatch(match: any): void {
    this.deleteMatch.emit(match);
  }

  trackByMatchId = (_: number, m: Match) => m.id;
}
