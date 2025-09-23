import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { map, tap, Observable, shareReplay } from 'rxjs';
import { TeamCardComponent } from './components/team-card/team-card.component';
import { TeamTableComponent } from './components/team-table/team-table.component';
import { TeamService } from './services/team.service';
import { Team } from './models/team';
import { Team as CoreTeam } from '../core/models';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { stringsTeams } from './misc';
import { FormField } from '../shared/components/dynamic-form/models/form-field';
import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-teams',
  imports: [
    CommonModule,
    TeamCardComponent,
    TeamTableComponent,
    SpinnerComponent,
    PageHeaderComponent,
    DynamicFormComponent,
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

  formTitleAddTeam = this.moduleStrings.formTitleAddTeam;
  openAddTeamFormModal = false;
  addTeamFormFields: FormField[] = this.getEmptyTeamFields();

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

  onAddTeam() {
    this.resetAddTeamFormFields();
    this.openAddTeamFormModal = true;
  }

  onAddTeamFormSubmitted(fields: FormField[]): void {
    this.openAddTeamFormModal = false;

    const f = this.reduceFields<{ name: string; logo?: string }>(fields);
    const id = this.generateId();

    const payload: CoreTeam = {
      id,
      name: String(f.name ?? '').trim(),
      logo: f.logo ? String(f.logo).trim() : undefined,
      playerIds: [],
    };

    this.isLoading = true;
    this.teamService.createTeam$(payload).subscribe({
      next: () => {
        this.teams$ = this.teamService.getTeams$().pipe(
          tap({
            next: () => (this.isLoading = false),
            error: () => (this.isLoading = false),
          }),
          shareReplay(1)
        );
      },
      error: (err: unknown) => {
        console.error('Błąd dodawania drużyny:', err);
        this.isLoading = false;
      },
    });
  }

  private getEmptyTeamFields(): FormField[] {
    return [
      {
        name: 'name',
        label: 'Nazwa drużyny',
        type: 'text',
        required: true,
        value: '',
      },
      {
        name: 'logo',
        label: 'Logo',
        type: 'text',
        required: false,
        value: '',
      },
    ];
  }

  private resetAddTeamFormFields(): void {
    this.addTeamFormFields = this.getEmptyTeamFields();
  }

  private reduceFields<
    T extends Record<string, unknown> = Record<string, unknown>
  >(fields: FormField[]): T {
    return fields.reduce((acc, f) => {
      (acc as Record<string, unknown>)[f.name] = f.value as unknown;
      return acc;
    }, {} as T);
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `team_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
}
