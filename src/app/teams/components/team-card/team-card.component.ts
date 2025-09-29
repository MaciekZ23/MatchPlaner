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
  @Input() canManage = false;

  @Output() teamClick = new EventEmitter<Team>();
  @Output() editTeam = new EventEmitter<Team>();
  @Output() deleteTeam = new EventEmitter<Team>();

  onClick(): void {
    this.teamClick.emit(this.team);
  }

  onEdit(ev: MouseEvent) {
    ev.stopPropagation();
    this.editTeam.emit(this.team);
  }

  onDelete(ev: MouseEvent) {
    ev.stopPropagation();
    this.deleteTeam.emit(this.team);
  }
}
