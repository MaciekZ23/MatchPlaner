import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchCardComponent } from '../match-card/match-card.component';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-calendar-day',
  imports: [CommonModule, MatchCardComponent],
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.scss',
  standalone: true,
})
export class CalendarDayComponent {
  @Input() date: string = '';
  @Input() matches: any[] = [];
  @Output() matchClicked = new EventEmitter<Match>();
  @Output() editMatch = new EventEmitter<Match>();
  @Output() deleteMatch = new EventEmitter<Match>();

  expanded = false;

  toggle() {
    this.expanded = !this.expanded;
  }

  onMatchClick(match: any) {
    this.matchClicked.emit(match);
  }

  onEditMatch(match: any): void {
    this.editMatch.emit(match);
  }

  onDeleteMatch(match: any): void {
    this.deleteMatch.emit(match);
  }
}
