import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LokalizacjaComponent } from './components/lokalizacja/lokalizacja.component';
import { LeagueDescriptionComponent } from './components/league-description/league-description.component';
import { MatchTimerComponent } from './components/match-timer/match-timer.component';
import { TournamentTitleComponent } from './components/tournament-title/tournament-title.component';
import { stringsHome } from './misc';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    LokalizacjaComponent,
    LeagueDescriptionComponent,
    MatchTimerComponent,
    TournamentTitleComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  moduleStrings = stringsHome;
}
