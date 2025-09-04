import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeagueDescriptionService } from '../../services/league-description.service';

@Component({
  selector: 'app-league-description',
  imports: [CommonModule],
  templateUrl: './league-description.component.html',
  styleUrls: ['./league-description.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeagueDescriptionComponent {
  private service = inject(LeagueDescriptionService);

  description$ = this.service.description$;
  additionalInfo$ = this.service.additionalInfo$;
}
