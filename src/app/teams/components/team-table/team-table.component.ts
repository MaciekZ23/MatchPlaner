import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../models/team';

@Component({
  selector: 'app-team-table',
  imports: [CommonModule],
  templateUrl: './team-table.component.html',
  styleUrls: ['./team-table.component.scss'],
  standalone: true
})

export class TeamTableComponent {
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

  getStatusClass(player: any): string {
    return player.healthStatus === 'Zdrowy' ? 'text-success' : 'text-danger';
  }

  onBackClick(): void {
    this.backClick.emit();
  }
}
