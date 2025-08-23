import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { stringsTournamentTitle } from '../../misc';
import { TournamentStore } from '../../../core/services/tournament-store.service';

@Component({
  selector: 'app-tournament-title',
  imports: [CommonModule],
  templateUrl: './tournament-title.component.html',
  styleUrls: ['./tournament-title.component.scss'],
  standalone: true,
})
export class TournamentTitleComponent {
  moduleStrings = stringsTournamentTitle;

  private readonly store = inject(TournamentStore);

  title$ = this.store.tournament$.pipe(map((t) => t.name));
  mode$ = this.store.tournament$.pipe(map((t) => t.mode));
  startDate$ = this.store.tournament$.pipe(map((t) => t.startDate ?? ''));
  endDate$ = this.store.tournament$.pipe(map((t) => t.endDate ?? ''));
}
