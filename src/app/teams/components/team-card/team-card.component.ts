import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team';

@Component({
  selector: 'app-team-card',
  imports: [CommonModule],
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss'],
  standalone: true,
})
export class TeamCardComponent {
  @Input() team!: Team;
  @Output() teamClick = new EventEmitter<Team>();

  onClick(): void {
    this.teamClick.emit(this.team);
  }
}
