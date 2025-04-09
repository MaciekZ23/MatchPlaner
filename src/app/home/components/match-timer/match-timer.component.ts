import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-timer',
  imports: [CommonModule],
  templateUrl: './match-timer.component.html',
  styleUrls: ['./match-timer.component.scss'],
  standalone: true
})
export class MatchTimerComponent {
  targetDate: Date = new Date('2026-01-10T00:00:00');
  timeLeft: any = {};
  isTimerOpen = false;

  ngOnInit(): void {
    this.updateTimeLeft();
    setInterval(() => {
      this.updateTimeLeft();
    }, 1000);
  }

  updateTimeLeft(): void {
    const now = new Date();
    const timeDiff = this.targetDate.getTime() - now.getTime();

    if (timeDiff > 0) {
      const days = Math.floor(timeDiff / (1000 * 3600 * 24));
      const hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
      const minutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      this.timeLeft = {
        days, hours, minutes, seconds
      };
    }
    else {
      this.timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }

  toggleTimer(): void {
    this.isTimerOpen = !this.isTimerOpen;
  }
}
