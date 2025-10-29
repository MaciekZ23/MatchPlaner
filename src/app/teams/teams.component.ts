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
  of,
} from 'rxjs';
import { TeamCardComponent } from './components/team-card/team-card.component';
import { TeamTableComponent } from './components/team-table/team-table.component';
import { TeamService } from './services/team.service';
import { Team } from './models/team';
import {
  CreateTeamPayload,
  CreatePlayerPayload,
  UpdateTeamPayload,
  UpdatePlayerPayload,
} from '../core/types';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { stringsTeams } from './misc';
import { FormField } from '../shared/components/dynamic-form/models/form-field';
import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from '../core/auth/auth.service';
import { TournamentStore } from '../core/services/tournament-store.service';

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
  private readonly store = inject(TournamentStore);

  moduleStrings = stringsTeams;

  teams$!: Observable<Team[]>;
  selectedTeam$!: Observable<Team | null>;
  isAdmin$ = this.auth.isAdmin$;

  isLoading = false;
  selectedLogoFile?: File;

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
    this.isLoading = true;
    this.teams$ = this.teamService.getTeams$().pipe(
      tap({
        next: () => (this.isLoading = false),
        error: () => (this.isLoading = false),
      }),
      shareReplay(1)
    );

    this.selectedTeam$ = combineLatest([
      this.route.paramMap,
      this.route.firstChild?.paramMap ?? this.route.paramMap,
      this.teams$,
    ]).pipe(
      map(([parentParams, childParams, teams]) => {
        const idStr = childParams.get('id') ?? parentParams.get('id');
        const id = idStr ? Number(idStr) : NaN;
        return teams.find((t) => t.id === id) ?? null;
      }),
      tap(() => (this.isLoading = false)),
      shareReplay(1)
    );
  }

  onTeamClick(team: Team): void {
    this.isLoading = true;
    const tid = this.route.snapshot.paramMap.get('tid');
    this.router.navigate(['/', tid, 'teams', team.id]);
  }

  onBackClick(): void {
    this.isLoading = true;
    const tid = this.route.snapshot.paramMap.get('tid');

    this.router.navigate(['/', tid, 'teams']).then(() => {
      this.teams$ = this.teamService.getTeams$().pipe(
        tap({
          next: () => (this.isLoading = false),
          error: () => (this.isLoading = false),
        }),
        shareReplay(1)
      );
    });
  }

  onLogoSelected(file?: File) {
    this.selectedLogoFile = file;
  }

  onAddTeam() {
    this.resetAddTeamFormFields();
    this.store.groups$.pipe(take(1)).subscribe((groups) => {
      const groupField = this.addTeamFormFields.find(
        (f) => f.name === 'groupId'
      );
      if (groupField && groupField.type === 'select') {
        (groupField as any).options = [
          { label: '— brak —', value: '' },
          ...groups.map((g) => ({
            label: g.name,
            value: g.id,
          })),
        ];
      }

      this.openAddTeamFormModal = true;
    });
  }

  onAddTeamFormSubmitted(fields: FormField[]): void {
    const f = this.reduceFields<{
      name: unknown;
      logoText?: unknown;
      groupId?: unknown;
      logoFile?: File;
    }>(fields);
    const name = String(f.name ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    const logoStr = f.logoText != null ? String(f.logoText).trim() : '';
    if (!name) {
      return;
    }

    const groupId = f.groupId ? String(f.groupId).trim() : null;
    const logoFile = f.logoFile as File | undefined;

    const payload: CreateTeamPayload = {
      name,
      ...(logoStr ? { logo: logoStr } : {}),
      ...(groupId ? { groupId } : {}),
    };

    this.isLoading = true;

    this.teamService
      .createTeam$(payload)
      .pipe(
        switchMap((team) => {
          if (!logoStr && logoFile) {
            return this.teamService.uploadLogo$(team.id, logoFile);
          } else {
            return of(team);
          }
        }),
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
    this.addPlayerForTeamId = team.id;
    this.addPlayerFormFields = this.getEmptyPlayerFields();
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

          const fields = this.getEmptyTeamFields();
          const fName = fields.find((f) => f.name === 'name');
          if (fName) {
            fName.value = team.name ?? '';
          }
          const fLogoText = fields.find((f) => f.name === 'logoText');
          if (fLogoText) {
            fLogoText.value = team.logo ?? '';
          }

          const fGroup = fields.find((f) => f.name === 'groupId');
          if (fGroup && fGroup.type === 'select') {
            this.store.groups$.pipe(take(1)).subscribe((groups) => {
              fGroup.options = [
                { label: '— brak —', value: '' },
                ...groups.map((g) => ({ label: g.name, value: g.id })),
              ];
              fGroup.value = team.groupId ?? '';
            });
          }

          this.editTeamFormFields = [...fields];
          this.openEditTeamFormModal = true;
        },
        error: (err) =>
          console.error('Nie udało się pobrać coreId drużyny:', err),
      });
  }

  onEditTeamFormSubmitted(fields: FormField[]) {
    if (!this.editingTeamCoreId) {
      return;
    }

    const f = this.reduceFields<{
      name?: unknown;
      logoText?: unknown;
      groupId?: unknown;
      logoFile?: File;
    }>(fields);
    const name = String(f.name ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    const logoStr = f.logoText != null ? String(f.logoText).trim() : '';
    const groupId = f.groupId ? String(f.groupId).trim() : null;
    const logoFile = f.logoFile as File | undefined;
    if (!name) {
      return;
    }

    const payload: UpdateTeamPayload = {
      name,
      ...(logoStr !== '' ? { logo: logoStr } : { logo: null }),
      ...(groupId ? { groupId } : { groupId: null }),
    };

    this.isLoading = true;
    this.teamService
      .updateTeam$(this.editingTeamCoreId, payload)
      .pipe(
        switchMap((team) => {
          if (!logoStr && logoFile) {
            return this.teamService.uploadLogo$(team.id, logoFile);
          } else {
            return of(team);
          }
        }),
        tap(() => {
          this.openEditTeamFormModal = false;
          this.editTeamFormFields = this.getEmptyTeamFields();
          this.editingTeamCoreId = undefined;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd edycji drużyny:', err),
      });
  }

  async onDeleteTeam(team: Team) {
    const ok = await this.teamConfirmModal.open({
      title: 'Usuń drużynę',
      message: `Czy na pewno chcesz usunąć drużynę ${team.name}?`,
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
        switchMap((coreTeamId: string) => {
          return this.teamService.deleteTeam$(coreTeamId);
        }),
        tap(() => {
          const idStr = this.route.snapshot.paramMap.get('id');
          const currentId = idStr ? Number(idStr) : NaN;
          if (currentId === team.id) {
            this.router.navigate(['/teams']);
          }
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
    const idStr = this.route.snapshot.paramMap.get('id');
    const uiTeamId = idStr ? Number(idStr) : NaN;
    if (!Number.isFinite(uiTeamId)) {
      console.warn('Brak UI id drużyny w URL.');
      return;
    }

    this.teamService
      .getCoreTeamIdByUiId$(uiTeamId)
      .pipe(
        take(1),
        switchMap((coreTeamId: string) => {
          return this.teamService.getCorePlayers$().pipe(
            take(1),
            map((corePlayers: any[]) => {
              const byNum =
                player.shirtNumber != null && player.shirtNumber !== ''
                  ? corePlayers.find(
                      (p) =>
                        p.teamId === coreTeamId &&
                        p.shirtNumber === player.shirtNumber
                    )
                  : null;

              if (byNum) {
                return String(byNum.id);
              }

              const norm = (s: string) =>
                s.trim().toLowerCase().replace(/\s+/g, ' ');
              const wanted = norm(String(player.name ?? ''));
              const byName = corePlayers.find(
                (p) => p.teamId === coreTeamId && norm(p.name) === wanted
              );
              if (byName) {
                return String(byName.id);
              }

              throw new Error('Nie znaleziono zawodnika (Core).');
            })
          );
        })
      )
      .subscribe({
        next: (corePlayerId: string) => {
          this.editingPlayerId = corePlayerId;

          const fields = this.getEmptyPlayerFields();

          const fName = fields.find((f) => f.name === 'name');
          if (fName) {
            fName.value = player.name ?? '';
          }

          const fPos = fields.find((f) => f.name === 'position');
          if (fPos) {
            fPos.value = this.positionCoreFromUi(player.position);
          }

          const fNum = fields.find((f) => f.name === 'number');
          if (fNum) {
            fNum.value =
              player.shirtNumber == null || player.shirtNumber === ''
                ? null
                : Number(player.shirtNumber);
          }

          const fHealth = fields.find((f) => f.name === 'health');
          if (fHealth) {
            fHealth.value = this.healthCoreFromUi(player.healthStatus);
          }

          this.editPlayerFormFields = [...fields];
          this.openEditPlayerFormModal = true;
        },
        error: (err) =>
          console.error('Nie udało się przygotować edycji zawodnika:', err),
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
    if (!name) return;

    const position =
      (String(f.position ?? 'MID')
        .trim()
        .toUpperCase() as 'GK' | 'DEF' | 'MID' | 'FWD') || 'MID';
    const healthStatus =
      (String(f.health ?? 'HEALTHY')
        .trim()
        .toUpperCase() as 'HEALTHY' | 'INJURED') || 'HEALTHY';

    const numStr = String(f.number ?? '').trim();
    const shirtNumber = numStr ? Number(numStr) : undefined;
    if (
      shirtNumber != null &&
      (!Number.isInteger(shirtNumber) || shirtNumber < 1 || shirtNumber > 99)
    ) {
      console.warn('Nieprawidłowy numer na koszulce (1–99)');
      return;
    }

    const payload: UpdatePlayerPayload = {
      name,
      position,
      healthStatus,
      ...(shirtNumber != null ? { shirtNumber } : {}),
    };

    this.isLoading = true;
    this.teamService
      .updatePlayer$(this.editingPlayerId, payload)
      .pipe(
        tap(() => {
          this.openEditPlayerFormModal = false;
          this.editPlayerFormFields = this.getEmptyPlayerFields();
          this.editingPlayerId = undefined;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd edycji zawodnika:', err),
      });
  }

  async onDeletePlayer(player: any) {
    const ok = await this.playerConfirmModal.open({
      title: 'Usuń zawodnika',
      message: `Czy na pewno chcesz usunąć zawodnika ${player.name}?`,
      confirmVariant: 'danger',
      labels: { confirm: 'Usuń', cancel: 'Anuluj' },
    });

    if (!ok) {
      return;
    }

    const idStr = this.route.snapshot.paramMap.get('id');
    const uiTeamId = idStr ? Number(idStr) : NaN;
    if (!Number.isFinite(uiTeamId)) {
      console.warn('Brak UI id drużyny w URL.');
      return;
    }

    this.isLoading = true;

    this.teamService
      .getCoreTeamIdByUiId$(uiTeamId)
      .pipe(
        take(1),
        switchMap((coreTeamId: string) => {
          return this.teamService.getCorePlayers$().pipe(
            take(1),
            map((corePlayers: any[]): string => {
              let found: any = null;

              if (player.shirtNumber != null && player.shirtNumber !== '') {
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
                throw new Error('Nie znaleziono zawodnika (Core).');
              }
              return String(found.id);
            })
          );
        }),
        switchMap((corePlayerId: string) => {
          return this.teamService.deletePlayer$(corePlayerId);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Błąd usuwania zawodnika:', err);
        },
      });
  }

  private positionCoreFromUi(ui: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
    switch ((ui ?? '').toLowerCase()) {
      case 'bramkarz':
        return 'GK';
      case 'obrońca':
        return 'DEF';
      case 'pomocnik':
        return 'MID';
      case 'napastnik':
        return 'FWD';
      default:
        return 'MID';
    }
  }

  private healthCoreFromUi(ui: string): 'HEALTHY' | 'INJURED' {
    return (ui ?? '').toLowerCase() === 'zdrowy' ? 'HEALTHY' : 'INJURED';
  }

  private getEmptyTeamFields(): FormField[] {
    return [
      {
        name: 'name',
        label: 'Nazwa drużyny',
        type: 'text',
        required: true,
        value: '',
        placeholder: 'Wpisz nazwę drużyny',
      },
      {
        name: 'logoText',
        label: 'Adres logo drużyny (opcjonalnie)',
        type: 'text',
        required: false,
        value: '',
        placeholder: 'Adres URL loga drużyny',
      },
      {
        name: 'logoFile',
        label: 'Wgraj logo drużyny (opcjonalnie)',
        type: 'file',
        required: false,
      },
      {
        name: 'groupId',
        label: 'Grupa (opcjonalnie)',
        type: 'select',
        required: false,
        value: '',
        options: [{ label: '— brak —', value: '' }],
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
        placeholder: 'Wpisz imię i nazwisko',
      },
      {
        name: 'position',
        label: 'Pozycja',
        type: 'select',
        required: true,
        value: 'GK',
        options: [
          { label: 'Bramkarz', value: 'GK' },
          { label: 'Obrońca', value: 'DEF' },
          { label: 'Pomocnik', value: 'MID' },
          { label: 'Napastnik', value: 'FWD' },
        ],
      },
      {
        name: 'number',
        label: 'Numer na koszulce (opcjonalnie)',
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
