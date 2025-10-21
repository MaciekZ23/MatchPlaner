import {
  Component,
  Input,
  EventEmitter,
  Output,
  SimpleChanges,
  OnDestroy,
  OnChanges,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsTeamTable } from '../../misc';
import { HealthStatus } from '../../types/health-status.type';

@Component({
  selector: 'app-team-table',
  imports: [CommonModule],
  templateUrl: './team-table.component.html',
  styleUrls: ['./team-table.component.scss'],
  standalone: true,
})
export class TeamTableComponent implements OnDestroy, OnChanges {
  moduleStrings = stringsTeamTable;
  @Input() players: any[] = [];
  @Input() teamName: string = '';
  @Input() teamLogo?: string;
  @Input() canManage = false;
  @Output() backClick = new EventEmitter<void>();
  @Output() editPlayer = new EventEmitter<any>();
  @Output() deletePlayer = new EventEmitter<any>();

  private tooltipInstances: any[] = [];

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.initTooltips();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['players'] || changes['canManage']) {
      queueMicrotask(() => this.reinitTooltips());
    }
  }

  ngOnDestroy(): void {
    this.disposeTooltips();
  }

  private initTooltips(): void {
    const bs = (window as any).bootstrap;
    if (!bs?.Tooltip) return;

    const root = this.host.nativeElement;
    const nodes = root.querySelectorAll<HTMLElement>(
      '[data-bs-toggle="tooltip"]'
    );

    this.tooltipInstances = Array.from(nodes).map(
      (el) =>
        bs.Tooltip.getInstance?.(el) ?? new bs.Tooltip(el, { placement: 'top' })
    );
  }

  private disposeTooltips(): void {
    this.tooltipInstances.forEach((t) => t?.dispose?.());
    this.tooltipInstances = [];
  }

  private reinitTooltips(): void {
    this.disposeTooltips();
    this.initTooltips();
  }

  hideTooltip(ev: Event) {
    const el = ev.currentTarget as HTMLElement;
    const bs = (window as any).bootstrap;
    const inst = bs?.Tooltip?.getInstance?.(el);
    inst?.hide();
    el.blur();
  }

  isCollapsed: boolean = true;

  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.players = this.players.sort((a, b) => {
      const valueA = a[column]?.toLowerCase();
      const valueB = b[column]?.toLowerCase();

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.reinitTooltips();
  }

  getHealthBadgeClass(player: { healthStatus: HealthStatus }): string[] {
    const base = ['rounded-pill', 'px-2', 'py-1', 'fs-6'];
    const status = String(player?.healthStatus || '').toLowerCase();

    if (status === 'zdrowy') {
      return ['bg-info', 'text-dark', ...base];
    }
    if (status === 'kontuzjowany') {
      return ['bg-info-subtle', 'text-dark', ...base];
    }
    return ['bg-secondary', ...base];
  }

  onBackClick(): void {
    this.backClick.emit();
  }

  onEditPlayer(p: any, ev: MouseEvent) {
    ev.stopPropagation();
    this.editPlayer.emit(p);
  }

  onDeletePlayer(p: any, ev: MouseEvent) {
    ev.stopPropagation();
    this.deletePlayer.emit(p);
  }
}
