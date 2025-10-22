import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalkeepersCleanSheetsService } from '../../services/goalkeepers-clean-sheets.service';
import { GoalkeepersCleanSheets } from '../../models';
import { stringsGoalkeepersCleanSheets } from '../../misc';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

@Component({
  selector: 'app-goalkeepers-clean-sheets',
  imports: [CommonModule],
  templateUrl: './goalkeepers-clean-sheets.component.html',
  styleUrls: ['./goalkeepers-clean-sheets.component.scss'],
  standalone: true,
})
export class GoalkeepersCleanSheetsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('collapseBtn', { static: true })
  collapseBtn!: ElementRef<HTMLElement>;
  moduleStrings = stringsGoalkeepersCleanSheets;

  isCollapsed = true;
  sortColumn: 'cleanSheets' = 'cleanSheets';
  sortDirection: 'asc' | 'desc' = 'desc';

  private sortDir$ = new BehaviorSubject<'asc' | 'desc'>(this.sortDirection);

  cleanSheetsData$!: Observable<GoalkeepersCleanSheets[]>;

  private tooltipInstance: any | null = null;
  private collapseTooltip: any | null = null;

  constructor(
    private cleanSheetsService: GoalkeepersCleanSheetsService,
    private host: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cleanSheetsData$ = combineLatest([
      this.cleanSheetsService.getCleanSheets$(),
      this.sortDir$,
    ]).pipe(
      map(([rows, dir]) => (dir === 'desc' ? rows : rows.slice().reverse()))
    );
  }

  ngAfterViewInit(): void {
    this.initOrUpdateTooltip();
    this.initCollapseTooltip();
  }

  ngOnDestroy(): void {
    this.disposeTooltip();
    this.disposeCollapseTooltip();
  }

  sortData(column: 'cleanSheets'): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortDir$.next(this.sortDirection);
    this.sortColumn = column;
    queueMicrotask(() => this.initOrUpdateTooltip());
    this.cdr.detectChanges();
    this.refreshSortTooltip();
  }

  private refreshSortTooltip(): void {
    const bs = (window as any).bootstrap;
    if (!bs?.Tooltip) {
      return;
    }

    const btn = this.host.nativeElement.querySelector<HTMLElement>(
      'th.sortable button[data-bs-toggle="tooltip"]'
    );
    if (!btn) {
      return;
    }

    const title =
      btn.getAttribute('data-bs-title') || btn.getAttribute('title') || '';

    btn.setAttribute('data-bs-title', title);
    btn.setAttribute('title', title);
    btn.setAttribute('data-bs-original-title', title); // dla starszych wersji

    const inst = bs.Tooltip.getInstance?.(btn);

    if (inst?.setContent) {
      inst.setContent({ '.tooltip-inner': title });
    } else {
      inst?.dispose?.();
      this.tooltipInstance = new bs.Tooltip(btn, { placement: 'top' });
    }
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

  trackRow = (_: number, r: GoalkeepersCleanSheets) => r.playerId;

  private initOrUpdateTooltip(): void {
    const bs = (window as any).bootstrap;
    if (!bs?.Tooltip) {
      return;
    }

    const th = this.host.nativeElement.querySelector<HTMLElement>(
      'th.sortable button[data-bs-toggle="tooltip"]'
    );
    if (!th) {
      return;
    }

    const existing = bs.Tooltip.getInstance?.(th);
    if (existing && typeof existing.setContent === 'function') {
      existing.setContent({
        '.tooltip-inner': th.getAttribute('data-bs-title') || '',
      });
      this.tooltipInstance = existing;
    } else if (existing) {
      existing.dispose();
      this.tooltipInstance = new bs.Tooltip(th, { placement: 'top' });
    } else {
      this.tooltipInstance = new bs.Tooltip(th, { placement: 'top' });
    }
  }

  private disposeTooltip(): void {
    this.tooltipInstance?.dispose?.();
    this.tooltipInstance = null;
  }

  private initCollapseTooltip(): void {
    const bs = (window as any).bootstrap;
    if (!bs?.Tooltip) {
      return;
    }

    const el = this.collapseBtn?.nativeElement;
    if (!el) {
      return;
    }

    this.collapseTooltip =
      bs.Tooltip.getInstance?.(el) ?? new bs.Tooltip(el, { placement: 'top' });
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
