import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-teams',
  imports: [
    CommonModule,
    TeamCardComponent,
    TeamTableComponent,
    SpinnerComponent,
    PageHeaderComponent,
    DynamicFormComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  standalone: true,
})
export class TeamsComponent implements OnInit {
  @ViewChild('teamConfirm') teamConfirmModal!: ConfirmModalComponent;
  @ViewChild('playerConfirm') playerConfirmModal!: ConfirmModalComponent;

  private readonly teamService = inject(TeamService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  moduleStrings = stringsTeams;

  teams$!: Observable<Team[]>;
  selectedTeam$!: Observable<Team | null>;
  isAdmin$ = this.auth.isAdmin$;

  isLoading = false;

  formTitleAddTeam = this.moduleStrings.formTitleAddTeam;
  openAddTeamFormModal = false;
  addTeamFormFields: FormField[] = this.getEmptyTeamFields();

  formTitleAddPlayer = this.moduleStrings.formTitleAddPlayer;
  openAddPlayerFormModal = false;
  addPlayerFormFields: FormField[] = this.getEmptyPlayerFields();
  private addPlayerForTeamId?: number;

  formTitleEditTeam = this.moduleStrings.formTitleEditTeam;
  openEditTeamFormModal = false;
  editTeamFormFields: FormField[] = this.getEmptyTeamFields();
  private editingTeamCoreId?: string;

  formTitleEditPlayer = this.moduleStrings.formTitleEditPlayer;
  openEditPlayerFormModal = false;
  editPlayerFormFields: FormField[] = this.getEmptyPlayerFields();
  private editingPlayerId?: string;

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

  onEditTeam(team: Team) {
    this.teamService
      .getCoreTeamIdByUiId$(team.id)
      .pipe(take(1))
      .subscribe({
        next: (coreId) => {
          this.editingTeamCoreId = coreId;

          this.editTeamFormFields = this.getEmptyTeamFields().map((f) => {
            if (f.name === 'name') {
              return { ...f, value: team.name };
            }
            if (f.name === 'logo') {
              return { ...f, value: team.logo ?? '' };
            }
            return f;
          });

          this.openEditTeamFormModal = true;
        },
        error: (err) => {
          console.error('Nie udało się przygotować edycji drużyny:', err);
        },
      });
  }

  onEditTeamFormSubmitted(fields: FormField[]) {
    if (!this.editingTeamCoreId) {
      return;
    }

    // bierzemy wartości bezpośrednio z this.editTeamFormFields (bez parametru)
    const f = this.editTeamFormFields.reduce<Record<string, unknown>>(
      (acc, field) => {
        acc[field.name] = field.value as unknown;
        return acc;
      },
      {}
    );

    const name = String(f['name'] ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    const logoStr = f['logo'] != null ? String(f['logo']).trim() : undefined;

    if (!name) {
      return;
    }

    const patch =
      logoStr === undefined
        ? { name }
        : logoStr
        ? { name, logo: logoStr }
        : { name, logo: '' };

    this.isLoading = true;

    this.teamService
      .updateTeam$(this.editingTeamCoreId, patch)
      .pipe(
        tap(() => {
          this.openEditTeamFormModal = false;
          this.editingTeamCoreId = undefined;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Błąd aktualizacji drużyny:', err);
        },
      });
  }

  async onDeleteTeam(team: Team) {
    const ok = await this.teamConfirmModal.open({
      title: 'Usuń drużynę',
      message: `Czy na pewno chcesz usunąć drużynę „${team.name}”?`,
      confirmVariant: 'danger',
      labels: { confirm: 'Usuń', cancel: 'Anuluj' },
    });

    if (!ok) {
      return;
    }

    this.isLoading = true;

    this.teamService
      .getCoreTeamIdByUiId$(team.id)
      .pipe(
        take(1),
        switchMap((coreId) => {
          return this.teamService.deleteTeam$(coreId);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Błąd usuwania drużyny:', err);
        },
      });
  }

  onEditPlayer(player: any) {
    // potrzebujemy aktualnie wybranej drużyny (UI id) i z cache ustalamy core playerId
    this.selectedTeam$.pipe(take(1)).subscribe({
      next: (uiTeam) => {
        if (!uiTeam) {
          console.warn('Brak wybranej drużyny.');
          return;
        }

        this.teamService
          .getCoreTeamIdByUiId$(uiTeam.id)
          .pipe(take(1))
          .subscribe({
            next: (coreTeamId) => {
              // UŻYWAMY cache graczy ze store przez service (bez dodawania nowych helperów)
              const svcAny = this.teamService as any;
              const players$ = svcAny?.store?.players$;

              if (!players$) {
                console.error('Brak dostępu do listy zawodników.');
                return;
              }

              players$.pipe(take(1)).subscribe({
                next: (corePlayers: any[]) => {
                  // 1) po numerze w obrębie teamu, 2) w razie braku numeru po nazwie (znormalizowanej)
                  let found: any | null = null;

                  if (player.shirtNumber != null) {
                    for (const p of corePlayers) {
                      if (
                        p.teamId === coreTeamId &&
                        p.shirtNumber === player.shirtNumber
                      ) {
                        found = p;
                        break;
                      }
                    }
                  }

                  if (!found) {
                    const norm = (s: string) =>
                      s.trim().toLowerCase().replace(/\s+/g, ' ');
                    const wanted = norm(String(player.name ?? ''));
                    for (const p of corePlayers) {
                      if (p.teamId === coreTeamId && norm(p.name) === wanted) {
                        found = p;
                        break;
                      }
                    }
                  }

                  if (!found) {
                    console.error('Nie znaleziono zawodnika (Core).');
                    return;
                  }

                  this.editingPlayerId = found.id;

                  // Prefill wartościami KODÓW z backendu
                  this.editPlayerFormFields = this.getEmptyPlayerFields().map(
                    (f) => {
                      if (f.name === 'name') {
                        return { ...f, value: found.name ?? '' };
                      }
                      if (f.name === 'position') {
                        return { ...f, value: found.position }; // 'GK'|'DEF'|'MID'|'FWD'
                      }
                      if (f.name === 'number') {
                        return { ...f, value: found.shirtNumber ?? '' };
                      }
                      if (f.name === 'health') {
                        return { ...f, value: found.healthStatus }; // 'HEALTHY'|'INJURED'
                      }
                      return f;
                    }
                  );

                  this.openEditPlayerFormModal = true;
                },
                error: (err: unknown) => {
                  console.error('Błąd pobierania zawodników ze store:', err);
                },
              });
            },
            error: (err) => {
              console.error('Błąd ustalenia CoreTeamId:', err);
            },
          });
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onEditPlayerFormSubmitted(fields: FormField[]) {
    if (!this.editingPlayerId) {
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
        .toUpperCase() as 'GK' | 'DEF' | 'MID' | 'FWD') || undefined;
    const healthStatus =
      (String(f.health ?? '')
        .trim()
        .toUpperCase() as 'HEALTHY' | 'INJURED') || undefined;

    const numStr = String(f.number ?? '').trim();
    const shirtNumber = numStr ? Number(numStr) : undefined;

    if (shirtNumber != null) {
      if (
        !Number.isInteger(shirtNumber) ||
        shirtNumber < 1 ||
        shirtNumber > 99
      ) {
        console.warn('Nieprawidłowy numer na koszulce (1–99)');
        return;
      }
    }

    const patch: Partial<CreatePlayerPayload> = {};
    if (name) {
      patch.name = name;
    }
    if (position) {
      patch.position = position as any;
    }
    if (healthStatus) {
      patch.healthStatus = healthStatus as any;
    }
    if (numStr !== '') {
      patch.shirtNumber = shirtNumber;
    }

    if (Object.keys(patch).length === 0) {
      this.openEditPlayerFormModal = false;
      this.editingPlayerId = undefined;
      return;
    }

    this.isLoading = true;

    this.teamService
      .updatePlayer$(this.editingPlayerId, patch)
      .pipe(
        tap(() => {
          this.openEditPlayerFormModal = false;
          this.editingPlayerId = undefined;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Błąd aktualizacji zawodnika:', err);
        },
      });
  }

  async onDeletePlayer(player: any) {}

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
