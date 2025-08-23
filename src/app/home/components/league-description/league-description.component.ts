import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { TournamentStore } from '../../../core/services/tournament-store.service';

@Component({
  selector: 'app-league-description',
  imports: [CommonModule],
  templateUrl: './league-description.component.html',
  styleUrls: ['./league-description.component.scss'],
  standalone: true,
})
export class LeagueDescriptionComponent {
  private readonly store = inject(TournamentStore);

  description$ = this.store.tournament$.pipe(map((t) => t.description ?? ''));
  additionalInfo$ = this.store.tournament$.pipe(
    map((t) => t.additionalInfo ?? '')
  );
}
