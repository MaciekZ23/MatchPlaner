import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stringsMatchTimer } from '../../misc';
import { MatchTimerService } from '../../services/match-timer.service';

@Component({
  selector: 'app-match-timer',
  imports: [CommonModule],
  templateUrl: './match-timer.component.html',
  styleUrls: ['./match-timer.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchTimerComponent {
  moduleStrings = stringsMatchTimer;
  isTimerOpen = false;

  private service = inject(MatchTimerService);

  countdown$ = this.service.countdown$;

  toggleTimer(): void {
    this.isTimerOpen = !this.isTimerOpen;
  }
}
