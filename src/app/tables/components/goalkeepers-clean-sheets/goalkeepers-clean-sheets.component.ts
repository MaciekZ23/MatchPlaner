import { Component, OnInit } from '@angular/core';
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
export class GoalkeepersCleanSheetsComponent implements OnInit {
  moduleStrings = stringsGoalkeepersCleanSheets;

  isCollapsed = true;
  sortColumn: 'cleanSheets' = 'cleanSheets';
  sortDirection: 'asc' | 'desc' = 'desc';

  private sortDir$ = new BehaviorSubject<'asc' | 'desc'>(this.sortDirection);

  cleanSheetsData$!: Observable<GoalkeepersCleanSheets[]>;

  constructor(private cleanSheetsService: GoalkeepersCleanSheetsService) {}

  ngOnInit(): void {
    this.cleanSheetsData$ = combineLatest([
      this.cleanSheetsService.getCleanSheets$(),
      this.sortDir$,
    ]).pipe(
      map(([rows, dir]) => (dir === 'desc' ? rows : rows.slice().reverse()))
    );
  }

  sortData(column: 'cleanSheets'): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortDir$.next(this.sortDirection);
    this.sortColumn = column;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  trackRow = (_: number, r: GoalkeepersCleanSheets) => r.playerId;
}
