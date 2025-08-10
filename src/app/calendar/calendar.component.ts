import { Component, OnInit } from '@angular/core';
import { CalendarDayComponent } from './components/calendar-day/calendar-day.component';
import { CalendarDay } from './models/calendar-day.model';
import { Match } from './models/match.model';
import { MatchService } from './services/match.service';
import { CommonModule } from '@angular/common';
import { MatchDetailsModalComponent } from './components/match-details-modal/match-details-modal.component';

@Component({
  selector: 'app-calendar',
  imports: [CalendarDayComponent, CommonModule, MatchDetailsModalComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
})
export class CalendarComponent implements OnInit {
  days: CalendarDay[] = [];
  selectedMatch: Match | null = null;

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.days = this.matchService.getMockData();
  }

  openDetails(match: Match): void {
    this.selectedMatch = match;
  }

  closeDetails(): void {
    this.selectedMatch = null;
  }
}
