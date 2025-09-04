import { Component } from '@angular/core';
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
export class TopScorersComponent {
  moduleStrings = stringsTopScorers;

  isCollapsed = true;
  sortColumn: TopScorersSortKey = 'goals';
  sortDirection: 'asc' | 'desc' = 'desc';

  private sortKey$ = new BehaviorSubject<TopScorersSortKey>(this.sortColumn);
  private sortDir$ = new BehaviorSubject<'asc' | 'desc'>(this.sortDirection);

  topScorers$ = combineLatest([this.sortKey$, this.sortDir$]).pipe(
    switchMap(([key, dir]) => this.topScorerService.getTopScorers$(key, dir))
  );

  constructor(private topScorerService: TopScorerService) {}

  sortData(column: TopScorersSortKey): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.sortDir$.next(this.sortDirection);
      return;
    }

    this.sortColumn = column;
    this.sortDirection = 'desc';
    this.sortKey$.next(column);
    this.sortDir$.next('desc');
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
