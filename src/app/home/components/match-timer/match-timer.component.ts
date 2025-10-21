import {
  Component,
  ChangeDetectionStrategy,
  inject,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsMatchTimer } from '../../misc';
import { MatchTimerService } from '../../services/match-timer.service';

@Component({
  selector: 'app-match-timer',
  imports: [CommonModule],
  templateUrl: './match-timer.component.html',
  styleUrls: ['./match-timer.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchTimerComponent implements AfterViewInit, OnDestroy {
  moduleStrings = stringsMatchTimer;
  isTimerOpen = false;

  private service = inject(MatchTimerService);

  countdown$ = this.service.countdown$;

  @ViewChild('timerBtn', { static: false }) timerBtn!: ElementRef<HTMLElement>;
  private tooltipInstance: any | null = null;

  ngAfterViewInit(): void {
    const bs = (window as any)?.bootstrap;
    const el = this.timerBtn?.nativeElement;
    if (bs?.Tooltip && el) {
      this.tooltipInstance =
        bs.Tooltip.getInstance?.(el) ??
        new bs.Tooltip(el, { placement: 'top' });
    }
  }

  ngOnDestroy(): void {
    this.tooltipInstance?.dispose?.();
    this.tooltipInstance = null;
  }

  toggleTimer(): void {
    this.isTimerOpen = !this.isTimerOpen;
    const bs = (window as any)?.bootstrap;
    const el = this.timerBtn?.nativeElement;
    if (!bs?.Tooltip || !el) {
      return;
    }

    el.setAttribute(
      'data-bs-title',
      this.isTimerOpen ? 'Zwiń sekcję' : 'Rozwiń sekcję'
    );

    const inst = this.tooltipInstance ?? bs.Tooltip.getInstance?.(el);
    if (inst?.setContent) {
      inst.setContent({
        '.tooltip-inner': el.getAttribute('data-bs-title') || '',
      });
    } else {
      inst?.dispose?.();
      this.tooltipInstance = new bs.Tooltip(el, { placement: 'top' });
    }
  }

  hideTooltip(ev: Event) {
    const el = ev.currentTarget as HTMLElement;
    const bs = (window as any).bootstrap;
    const inst = bs?.Tooltip?.getInstance?.(el);
    inst?.hide();
    el.blur();
  }
}
