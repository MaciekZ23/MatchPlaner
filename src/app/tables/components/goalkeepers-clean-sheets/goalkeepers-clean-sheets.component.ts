import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalkeepersCleanSheetsService } from '../../services/goalkeepers-clean-sheets.service';
import { GoalkeepersCleanSheets } from '../../models';
import { stringsGoalkeepersCleanSheets } from '../../misc';

@Component({
  selector: 'app-goalkeepers-clean-sheets',
  imports: [CommonModule],
  templateUrl: './goalkeepers-clean-sheets.component.html',
  styleUrls: ['./goalkeepers-clean-sheets.component.scss'],
  standalone: true,
})
export class GoalkeepersCleanSheetsComponent implements OnInit {
  moduleStrings = stringsGoalkeepersCleanSheets;
  cleanSheetsData: GoalkeepersCleanSheets[] = [];
  isCollapsed = true;
  sortColumn: 'cleanSheets' | null = null;
  sortDirection: 'asc' | 'desc' | '' = 'asc';

  constructor(private cleanSheetsService: GoalkeepersCleanSheetsService) {}

  ngOnInit(): void {
    this.loadCleanSheets();
  }

  loadCleanSheets(): void {
    this.cleanSheetsService.getCleanSheets().subscribe((rows) => {
      this.cleanSheetsData = rows;
      this.sortColumn = 'cleanSheets';
      this.sortDirection = 'desc';
    });
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  sortData(column: 'cleanSheets'): void {
    if (this.sortColumn === column) {
      this.cleanSheetsData = [...this.cleanSheetsData].reverse();
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.cleanSheetsService.getCleanSheets().subscribe((rows) => {
      this.cleanSheetsData = rows;
      this.sortColumn = column;
      this.sortDirection = 'desc';
    });
  }
}
