import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopScorerService } from '../../services/top-scorer.service';
import { TopScorersSortKey } from '../../types';
import { stringsTopScorers } from '../../misc';
import { BehaviorSubject, combineLatest, switchMap } from 'rxjs';

@Component({
  selector: 'app-top-scorers',
  imports: [CommonModule],
  templateUrl: './top-scorers.component.html',
  styleUrls: ['./top-scorers.component.scss'],
  standalone: true,
})
export class TopScorersComponent implements AfterViewInit, OnDestroy {
  moduleStrings = stringsTopScorers;

  isCollapsed = true;
  sortColumn: TopScorersSortKey = 'goals';
  sortDirection: 'asc' | 'desc' = 'desc';

  private sortKey$ = new BehaviorSubject<TopScorersSortKey>(this.sortColumn);
  private sortDir$ = new BehaviorSubject<'asc' | 'desc'>(this.sortDirection);

  topScorers$ = combineLatest([this.sortKey$, this.sortDir$]).pipe(
    switchMap(([key, dir]) => this.topScorerService.getTopScorers$(key, dir))
  );

  private sortTooltips: any[] = [];
  private collapseTooltip: any | null = null;

  constructor(
    private topScorerService: TopScorerService,
    private host: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.initSortTooltips();
    this.initCollapseTooltip();
  }

  ngOnDestroy(): void {
    this.disposeSortTooltips();
    this.disposeCollapseTooltip();
  }

  sortData(column: TopScorersSortKey): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.sortDir$.next(this.sortDirection);

      this.cdr.detectChanges();
      queueMicrotask(() => this.refreshSortTooltips());
      return;
    }

    this.sortColumn = column;
    this.sortDirection = 'desc';
    this.sortKey$.next(column);
    this.sortDir$.next('desc');

    this.cdr.detectChanges();
    queueMicrotask(() => this.refreshSortTooltips());
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    const btn = this.host.nativeElement.querySelector<HTMLElement>(
      '#topScorersTitle [data-bs-toggle="tooltip"]'
    );
    const bs = (window as any)?.bootstrap;
    if (btn && bs?.Tooltip) {
      btn.setAttribute(
        'data-bs-title',
        this.isCollapsed ? 'Rozwiń sekcję' : 'Zwiń sekcję'
      );
      const inst = this.collapseTooltip ?? bs.Tooltip.getInstance(btn);
      if (inst?.setContent) {
        inst.setContent({
          '.tooltip-inner': btn.getAttribute('data-bs-title') || '',
        });
      } else {
        inst?.dispose?.();
        this.collapseTooltip = new bs.Tooltip(btn, { placement: 'top' });
      }
    }
  }

  private initSortTooltips(): void {
    const bs = (window as any)?.bootstrap;
    if (!bs?.Tooltip) return;

    this.disposeSortTooltips();

    const btns = this.host.nativeElement.querySelectorAll<HTMLElement>(
      'th.sortable button[data-bs-toggle="tooltip"]'
    );
    btns.forEach((el) => {
      const inst =
        bs.Tooltip.getInstance?.(el) ??
        new bs.Tooltip(el, { placement: 'top' });
      this.sortTooltips.push(inst);
    });
  }

  private refreshSortTooltips(): void {
    const bs = (window as any)?.bootstrap;
    if (!bs?.Tooltip) return;

    const btns = this.host.nativeElement.querySelectorAll<HTMLElement>(
      'th.sortable button[data-bs-toggle="tooltip"]'
    );

    btns.forEach((el) => {
      const inst = bs.Tooltip.getInstance?.(el);
      const title =
        el.getAttribute('data-bs-title') || el.getAttribute('title') || '';

      el.setAttribute('data-bs-title', title);
      el.setAttribute('title', title);
      el.setAttribute('data-bs-original-title', title);

      if (inst?.setContent) {
        inst.setContent({ '.tooltip-inner': title });
      } else {
        inst?.dispose?.();
        this.sortTooltips.push(new bs.Tooltip(el, { placement: 'top' }));
      }
    });
  }

  private disposeSortTooltips(): void {
    this.sortTooltips.forEach((t) => t?.dispose?.());
    this.sortTooltips = [];
  }

  private initCollapseTooltip(): void {
    const bs = (window as any)?.bootstrap;
    if (!bs?.Tooltip) {
      return;
    }
    const btn = this.host.nativeElement.querySelector<HTMLElement>(
      '#topScorersTitle [data-bs-toggle="tooltip"]'
    );
    if (!btn) {
      return;
    }
    this.collapseTooltip =
      bs.Tooltip.getInstance?.(btn) ??
      new bs.Tooltip(btn, { placement: 'top' });
  }

  private disposeCollapseTooltip(): void {
    this.collapseTooltip?.dispose?.();
    this.collapseTooltip = null;
  }

  hideTooltip(ev: Event, blur = true) {
    const el = ev.currentTarget as HTMLElement;
    const bs = (window as any).bootstrap;
    bs?.Tooltip?.getInstance?.(el)?.hide();
    if (blur) {
      el.blur();
    }
  }
}
