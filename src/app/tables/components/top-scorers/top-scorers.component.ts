import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopScorerService } from '../../services/top-scorer.service';

@Component({
  selector: 'app-top-scorers',
  imports: [CommonModule],
  templateUrl: './top-scorers.component.html',
  styleUrls: ['./top-scorers.component.scss'],
  standalone: true
})

export class TopScorersComponent implements OnInit {
  topScorers: any[] = [];
  isCollapsed = true;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | '' = 'asc';
  constructor(private topScorerService: TopScorerService) { }
  
  ngOnInit(): void {
    this.loadTopScorers();
  }

  loadTopScorers(): void {
    this.topScorerService.getTopScorers().subscribe((data: any[]) => {
      this.topScorers = data;
      this.sortData('goals');
    });
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  sortData(column: string): void {
    if(this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    else
    {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }

    this.topScorers = [...this.topScorers].sort((a, b) => {
      const valueA = this.getSortableValue(a, column);
      const valueB = this.getSortableValue(b, column);

      if(valueA === null || valueB === null)
      {
        return 0;
      }
      return this.sortDirection === 'asc' ? valueA - valueB: valueB - valueA;
    });
  }

  getSortableValue(player: any, column: string): number {
    const value = player[column];
    return value ? value : 0;
  }
}
