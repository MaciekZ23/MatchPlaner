import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { map, tap, Observable, shareReplay } from 'rxjs';
import { TeamCardComponent } from './components/team-card/team-card.component';
import { TeamTableComponent } from './components/team-table/team-table.component';
import { TeamService } from './services/team.service';
import { Team } from './models/team';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { stringsTeams } from './misc';

@Component({
  selector: 'app-teams',
  imports: [
    CommonModule,
    TeamCardComponent,
    TeamTableComponent,
    SpinnerComponent,
    PageHeaderComponent,
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  standalone: true,
})
export class TeamsComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  moduleStrings = stringsTeams;

  teams$!: Observable<Team[]>;
  selectedTeam$!: Observable<Team | null>;

  isLoading = false;

  ngOnInit(): void {
    this.teams$ = this.teamService.getTeams$().pipe(shareReplay(1));

    this.selectedTeam$ = this.route.data.pipe(
      map((d) => (d && 'team' in d ? (d['team'] as Team | null) : null)),
      tap(() => (this.isLoading = false)),
      shareReplay(1)
    );
  }

  onTeamClick(team: Team): void {
    this.isLoading = true;
    this.router.navigate(['/teams', team.id]);
  }

  onBackClick(): void {
    this.isLoading = true;
    this.router.navigate(['/teams']).then(() => {
      this.teams$ = this.teamService.getTeams$().pipe(
        tap({
          next: () => (this.isLoading = false),
          error: () => (this.isLoading = false),
        }),
        shareReplay(1)
      );
    });
  }
}
