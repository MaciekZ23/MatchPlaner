import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchCardComponent } from '../match-card/match-card.component';

@Component({
  selector: 'app-calendar-day',
  imports: [CommonModule, MatchCardComponent],
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.scss',
  standalone: true
})
export class CalendarDayComponent {
  @Input() date: string = '';
  @Input() matches: any[] = [];
  @Output() matchClicked = new EventEmitter<any>();

  expanded = false;

  toggle() {
    this.expanded = !this.expanded;
  }

  onMatchClick(match: any) {
    this.matchClicked.emit(match);
  }
}
