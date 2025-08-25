import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopScorerService } from '../../services/top-scorer.service';
import { TopScorer } from '../../models';
import { TopScorersSortKey } from '../../types';
import { stringsTopScorers } from '../../misc';

@Component({
  selector: 'app-top-scorers',
  imports: [CommonModule],
  templateUrl: './top-scorers.component.html',
  styleUrls: ['./top-scorers.component.scss'],
  standalone: true,
})
export class TopScorersComponent implements OnInit {
  moduleStrings = stringsTopScorers;
  topScorers: TopScorer[] = [];
  isCollapsed = true;
  sortColumn: TopScorersSortKey | null = null;
  sortDirection: 'asc' | 'desc' = 'desc';
  constructor(private topScorerService: TopScorerService) {}

  ngOnInit(): void {
    this.loadTopScorers();
  }

  loadTopScorers(): void {
    this.topScorerService
      .getTopScorers('goals')
      .subscribe((data: TopScorer[]) => {
        this.topScorers = data;
        this.sortColumn = 'goals';
        this.sortDirection = 'desc';
      });
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  sortData(column: TopScorersSortKey): void {
    if (this.sortColumn === column) {
      this.topScorers = [...this.topScorers].reverse();
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.topScorerService
      .getTopScorers(column)
      .subscribe((data: TopScorer[]) => {
        this.topScorers = data;
        this.sortColumn = column;
        this.sortDirection = 'desc';
      });
  }
}
