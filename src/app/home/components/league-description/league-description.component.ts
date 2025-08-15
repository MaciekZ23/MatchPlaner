import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsLeagueDescription } from '../../misc';

@Component({
  selector: 'app-league-description',
  imports: [CommonModule],
  templateUrl: './league-description.component.html',
  styleUrls: ['./league-description.component.scss'],
  standalone: true,
})
export class LeagueDescriptionComponent {
  moduleStrings = stringsLeagueDescription;
}
