import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsTournamentTitle } from '../../misc';

@Component({
  selector: 'app-tournament-title',
  imports: [CommonModule],
  templateUrl: './tournament-title.component.html',
  styleUrls: ['./tournament-title.component.scss'],
  standalone: true,
})
export class TournamentTitleComponent {
  moduleStrings = stringsTournamentTitle;
}
