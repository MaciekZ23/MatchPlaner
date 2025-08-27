import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CalendarDay } from './models/calendar-day.model';
import { CalendarDayComponent } from './components/calendar-day/calendar-day.component';
import { Match } from './models/match.model';
import { MatchService } from './services/match.service';
import { MatchDetailsModalComponent } from './components/match-details-modal/match-details-modal.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { stringsCalendar } from './misc';

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarDayComponent,
    CommonModule,
    MatchDetailsModalComponent,
    PageHeaderComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
})
export class CalendarComponent implements OnInit {
  moduleStrings = stringsCalendar;
  days$!: Observable<CalendarDay[]>;
  selectedMatch: Match | null = null;

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.days$ = this.matchService.getCalendarDays$();
  }

  openDetails(match: Match): void {
    this.selectedMatch = match;
  }

  closeDetails(): void {
    this.selectedMatch = null;
  }
}
