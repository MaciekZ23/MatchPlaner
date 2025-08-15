import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalkeepersCleanSheetsService } from '../../services/goalkeepers-clean-sheets.service';
import { stringsGoalkeepersCleanSheets } from '../../misc/strings-goalkeepers-clean-sheets';

@Component({
  selector: 'app-goalkeepers-clean-sheets',
  imports: [CommonModule],
  templateUrl: './goalkeepers-clean-sheets.component.html',
  styleUrls: ['./goalkeepers-clean-sheets.component.scss'],
  standalone: true,
})
export class GoalkeepersCleanSheetsComponent implements OnInit {
  moduleStrings = stringsGoalkeepersCleanSheets;
  cleanSheetsData: any[] = [];
  isCollapsed = true;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | '' = 'asc';

  constructor(private cleanSheetsService: GoalkeepersCleanSheetsService) {}

  ngOnInit(): void {
    this.loadCleanSheets();
  }

  loadCleanSheets(): void {
    this.cleanSheetsData = this.cleanSheetsService.getCleanSheets();
    this.sortData('cleanSheets');
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }

    this.cleanSheetsData = [...this.cleanSheetsData].sort((a, b) => {
      const valueA = this.getSortableValue(a, column);
      const valueB = this.getSortableValue(b, column);

      if (valueA === null || valueB === null) {
        return 0;
      }
      return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }

  getSortableValue(player: any, column: string): number {
    const value = player[column];
    return value ? value : 0;
  }
}
