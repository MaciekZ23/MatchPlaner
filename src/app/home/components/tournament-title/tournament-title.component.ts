import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tournament-title',
  imports: [CommonModule],
  templateUrl: './tournament-title.component.html',
  styleUrls: ['./tournament-title.component.scss'],
  standalone: true
})
export class TournamentTitleComponent {
  title = "Halowa Liga Piłki Nożnej Toruń 2026";
  startDate = "Piątek 10 stycznia 2026";
  endDate = "Sobota 22 lutego 2026";
}
