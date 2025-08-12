import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../models/match.model';
import { STRINGS_MATCH_DETAILS } from '../../misc/strings-match-details';
@Component({
  selector: 'app-match-card',
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
})
export class MatchCardComponent {
  @Input() match!: Match;
  @Output() openDetails = new EventEmitter<Match>();

  moduleStrings = STRINGS_MATCH_DETAILS;

  onClick() {
    this.openDetails.emit(this.match);
  }

  getBadgeClass(score: number, opponentScore: number) {
    if (score > opponentScore) {
      return 'bg-success';
    }
    if (score < opponentScore) {
      return 'bg-danger';
    }
    return 'bg-warning text-dark';
  }
}
