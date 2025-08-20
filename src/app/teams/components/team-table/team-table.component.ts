import { Component, Input, EventEmitter, Output } from '@angular/core';
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
export class TeamTableComponent {
  moduleStrings = stringsTeamTable;
  @Input() players: any[] = [];
  @Input() teamName: string = '';
  @Input() teamLogo?: string;
  @Output() backClick = new EventEmitter<void>();

  isCollapsed: boolean = true;

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

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
}
