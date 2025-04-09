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
  constructor(private topScorerService: TopScorerService) { }
  ngOnInit(): void {
    this.loadTopScorers();
  }

  loadTopScorers(): void {
    this.topScorerService.getTopScorers().subscribe((data: any[]) => {
      this.topScorers = data;
    });
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
