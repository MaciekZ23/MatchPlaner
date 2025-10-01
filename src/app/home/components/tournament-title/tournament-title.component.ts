import {
  Component,
  ChangeDetectionStrategy,
  inject,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentTitleService } from '../../services/tournament-title.service';
import { stringsTournamentTitle } from '../../misc';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-tournament-title',
  imports: [CommonModule],
  templateUrl: './tournament-title.component.html',
  styleUrls: ['./tournament-title.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TournamentTitleComponent {
  @Output() addTournament = new EventEmitter<void>();
  @Output() editTournament = new EventEmitter<void>();
  @Output() deleteTournament = new EventEmitter<void>();

  moduleStrings = stringsTournamentTitle;

  private service = inject(TournamentTitleService);
  private readonly auth = inject(AuthService);

  isAdmin$ = this.auth.isAdmin$;

  title$ = this.service.title$;
  dateRange$ = this.service.dateRange$;

  onAddTournament(): void {
    this.addTournament.emit();
  }

  onEditTournament(): void {
    this.editTournament.emit();
  }

  onDeleteTournament(): void {
    this.deleteTournament.emit();
  }
}
