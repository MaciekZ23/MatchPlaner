import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  map,
  tap,
  Observable,
  shareReplay,
  finalize,
  switchMap,
  take,
  combineLatest,
} from 'rxjs';
import { TeamCardComponent } from './components/team-card/team-card.component';
import { TeamTableComponent } from './components/team-table/team-table.component';
import { TeamService } from './services/team.service';
import { Team } from './models/team';
import { CreateTeamPayload, CreatePlayerPayload } from '../core/types';
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

  formTitleAddPlayer = this.moduleStrings.formTitleAddPlayer;
  openAddPlayerFormModal = false;
  addPlayerFormFields: FormField[] = this.getEmptyPlayerFields();
  private addPlayerForTeamId?: number;

  ngOnInit(): void {
    this.teams$ = this.teamService.getTeams$().pipe(shareReplay(1));

    this.selectedTeam$ = combineLatest([this.route.paramMap, this.teams$]).pipe(
      map(([pm, teams]) => {
        const idStr = pm.get('id');
        const id = idStr ? Number(idStr) : NaN;
        return teams.find((t) => t.id === id) ?? null;
      }),
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
    const f = this.reduceFields<{ name: unknown; logo?: unknown }>(fields);
    const name = String(f.name ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    const logoStr = f.logo != null ? String(f.logo).trim() : '';
    if (!name) {
      return;
    }

    const payload: CreateTeamPayload = logoStr
      ? { name, logo: logoStr }
      : { name };

    this.isLoading = true;

    this.teamService
      .createTeam$(payload)
      .pipe(
        tap(() => {
          this.openAddTeamFormModal = false;
          this.resetAddTeamFormFields();
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err: unknown) => {
          console.error('Błąd dodawania drużyny:', err);
        },
      });
  }

  onAddPlayer(team: Team): void {
    this.addPlayerForTeamId = team.id; // zapamiętaj UI id drużyny
    this.addPlayerFormFields = this.getEmptyPlayerFields(); // reset pól
    this.openAddPlayerFormModal = true;
  }

  onAddPlayerFormSubmitted(fields: FormField[]): void {
    if (!this.addPlayerForTeamId) {
      return;
    }

    const f = this.reduceFields<{
      name?: unknown;
      position?: unknown;
      number?: unknown;
      health?: unknown;
    }>(fields);

    const name = String(f.name ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    const position =
      (String(f.position ?? '')
        .trim()
        .toUpperCase() as 'GK' | 'DEF' | 'MID' | 'FWD') || 'MID';
    const healthStatus =
      (String(f.health ?? '')
        .trim()
        .toUpperCase() as 'HEALTHY' | 'INJURED') || 'HEALTHY';

    if (!name) {
      return;
    }

    const numStr = String(f.number ?? '').trim();
    const shirtNumber = numStr ? Number(numStr) : undefined;
    if (
      shirtNumber != null &&
      (!Number.isInteger(shirtNumber) || shirtNumber < 1 || shirtNumber > 99)
    ) {
      console.warn('Nieprawidłowy numer na koszulce (1–99)');
      return;
    }

    const payload: CreatePlayerPayload = {
      name,
      position,
      healthStatus,
      ...(shirtNumber != null ? { shirtNumber } : {}),
    };

    this.isLoading = true;

    this.teamService
      .getTeamById$(this.addPlayerForTeamId)
      .pipe(
        take(1),
        switchMap((uiTeam) => {
          if (!uiTeam) {
            throw new Error('Nie znaleziono wybranej drużyny');
          }
          return this.teamService.createPlayer$(uiTeam.name, payload);
        }),
        tap(() => {
          this.openAddPlayerFormModal = false;
          this.addPlayerFormFields = this.getEmptyPlayerFields();
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Błąd dodawania zawodnika:', err);
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
        placeholder: 'Nazwa drużyny',
      },
      {
        name: 'logo',
        label: 'Logo',
        type: 'text',
        required: false,
        value: '',
        placeholder: 'Logo druzyny',
      },
    ];
  }

  private getEmptyPlayerFields(): FormField[] {
    return [
      {
        name: 'name',
        label: 'Imię i nazwisko',
        type: 'text',
        required: true,
        value: '',
        placeholder: 'Jan Kowalski',
      },
      {
        name: 'position',
        label: 'Pozycja',
        type: 'select',
        required: true,
        value: 'MID',
        options: [
          { label: 'Bramkarz', value: 'GK' },
          { label: 'Obrońca', value: 'DEF' },
          { label: 'Pomocnik', value: 'MID' },
          { label: 'Napastnik', value: 'FWD' },
        ],
      },
      {
        name: 'number',
        label: 'Numer na koszulce',
        type: 'number',
        required: false,
        value: '',
        min: 1,
        max: 99,
        placeholder: '1–99',
        totalSpan: 6,
        actualSpan: 12,
      },
      {
        name: 'health',
        label: 'Status zdrowia',
        type: 'select',
        required: true,
        value: 'HEALTHY',
        options: [
          { label: 'Zdrowy', value: 'HEALTHY' },
          { label: 'Kontuzjowany', value: 'INJURED' },
        ],
        totalSpan: 6,
        actualSpan: 12,
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
}
