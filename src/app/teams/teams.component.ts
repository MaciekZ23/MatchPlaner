import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamCardComponent } from './components/team-card/team-card.component';
import { TeamTableComponent } from './components/team-table/team-table.component';
import { TeamService } from './services/team.service';
import { Team } from './models/team';

@Component({
  selector: 'app-teams',
  imports: [CommonModule, TeamCardComponent, TeamTableComponent],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  standalone: true
})

export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  selectedTeam: Team | null = null;

  constructor(private teamService: TeamService) { }

  ngOnInit(): void {
    this.teams = this.teamService.getTeams();
  }

  onTeamClick(team: Team): void {
    this.selectedTeam = team;
    this.selectedTeam.logo = this.selectedTeam.logo || undefined;
  }

  onBackClick(): void {
    this.selectedTeam = null;
  }
}
