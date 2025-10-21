import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentTitleService } from '../../services/tournament-title.service';
import { stringsTournamentTitle } from '../../misc';

@Component({
  selector: 'app-tournament-title',
  imports: [CommonModule],
  templateUrl: './tournament-title.component.html',
  styleUrls: ['./tournament-title.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TournamentTitleComponent {
  moduleStrings = stringsTournamentTitle;

  private service = inject(TournamentTitleService);

  title$ = this.service.title$;
  dateRange$ = this.service.dateRange$;
}
