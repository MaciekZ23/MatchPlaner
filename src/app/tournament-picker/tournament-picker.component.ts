import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpTournamentApi } from '../core/api/http-tournament.api';
import { TournamentStore } from '../core/services/tournament-store.service';
import { Tournament } from '../core/models';
import {
  BehaviorSubject,
  finalize,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { FormField } from '../shared/components/dynamic-form/models/form-field';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import {
  CreateTournamentPayload,
  UpdateTournamentPayload,
} from '../core/models';
import { TournamentMode, StageKind } from '../core/types';
import { stringsTournamentPicker } from './misc/strings-picker';
import { capitalizeFirst, formatFullDate } from '../core/utils';

@Component({
  selector: 'app-tournament-picker',
  imports: [
    CommonModule,
    PageHeaderComponent,
    DynamicFormComponent,
    ConfirmModalComponent,
    SpinnerComponent,
  ],
  templateUrl: './tournament-picker.component.html',
  styleUrl: './tournament-picker.component.scss',
  standalone: true,
})
export class TournamentPickerComponent {
  @ViewChild('deleteConfirm') deleteConfirm!: ConfirmModalComponent;

  private api = inject(HttpTournamentApi);
  private store = inject(TournamentStore);
  private router = inject(Router);
  private auth = inject(AuthService);

  private reload$ = new BehaviorSubject<void>(undefined);

  moduleStrings = stringsTournamentPicker;
  isAdmin$ = this.auth.isAdmin$;

  isLoading = false;

  tournaments$ = this.reload$.pipe(
    switchMap(() => this.api.getTournaments()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  refresh() {
    this.reload$.next();
  }

  selectTournament(id: string) {
    this.store.setTournament(id);
    this.router.navigate(['/', id, 'home']);
  }

  teamsOptions$ = this.store.teams$.pipe(
    map((teams) => teams.map((t) => ({ label: t.name, value: t.id }))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  formTitleAddTournament = this.moduleStrings.formTitleAddTournament;
  formTitleEditTournament = this.moduleStrings.formTitleEditTournament;

  openAddTournamentFormModal = false;
  openEditTournamentFormModal = false;

  addTournamentFormFields: FormField[] = this.getTournamentFields();
  editTournamentFormFields: FormField[] = this.getTournamentFields();

  private editGroupsInitialIds: Set<string> = new Set<string>();
  private editStagesInitialIds: Set<string> = new Set<string>();
  private editingId = '';

  modeLabel(mode?: string | null): string {
    if (!mode) {
      return '-';
    }
    return this.moduleStrings.modeLabel[mode] ?? mode;
  }

  dateRange(t: Tournament): string {
    const tz = t.timezone || 'Europe/Warsaw';
    const start = t.startDate
      ? capitalizeFirst(formatFullDate(t.startDate, tz))
      : '—';
    const end = t.endDate
      ? capitalizeFirst(formatFullDate(t.endDate, tz))
      : '—';
    return `${start} – ${end}`;
  }

  private normKind(val: unknown): StageKind {
    const v = Array.isArray(val) ? val[0] : val;
    const raw = String(v ?? '')
      .trim()
      .toUpperCase();
    return raw.includes('PLAY') ? 'PLAYOFF' : 'GROUP';
  }

  onAddTournamentClick(): void {
    this.isLoading = true;

    const teamOptions: { label: string; value: string }[] = [];

    const base: FormField[] = this.getTournamentFields();
    const groups: FormField = this.groupsRepeaterFields(
      'groups',
      [{ id: '', name: '', teamIds: [] }],
      teamOptions
    );

    const stages: FormField = this.stagesRepeaterFields('stages', [
      { id: '', name: '', kind: 'GROUP', order: 1 },
    ]);

    this.addTournamentFormFields = [...base, groups, stages];
    this.openAddTournamentFormModal = true;

    this.isLoading = false;
  }

  onEditTournamentClick(t: Tournament): void {
    this.editingId = t.id;
    this.isLoading = true;

    forkJoin({
      tt: this.api.getTournament(this.editingId).pipe(take(1)),
      teamOptions: this.api.getTeams(this.editingId).pipe(
        take(1),
        map((teams) => teams.map((x) => ({ label: x.name, value: x.id })))
      ),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(({ tt, teamOptions }) => {
        if (!tt) {
          console.warn('Brak turnieju do edycji');
          return;
        }

        this.editGroupsInitialIds = new Set((tt.groups ?? []).map((g) => g.id));
        this.editStagesInitialIds = new Set((tt.stages ?? []).map((s) => s.id));

        const fields: FormField[] = this.getTournamentFields();
        const set = (name: string, val: any) => {
          const f = fields.find((x) => x.name === name);
          if (f) {
            f.value = (val ?? '') as any;
          }
        };

        set('name', tt.name ?? '');
        set('mode', tt.mode ?? 'LEAGUE');
        set('season', tt.season ?? '');
        set('startDate', this.toDateInput(tt.startDate));
        set('endDate', this.toDateInput(tt.endDate));
        set('timezone', tt.timezone ?? 'Europe/Warsaw');
        set('description', tt.description ?? '');
        set('additionalInfo', tt.additionalInfo ?? '');
        set('venue', tt.venue ?? '');
        set('venueAddress', tt.venueAddress ?? '');
        set('venueImageUrl', tt.venueImageUrl ?? '');
        const fImgFile = fields.find((x) => x.name === 'venueImageFile');
        if (fImgFile) {
          fImgFile.value = undefined;
        }

        const groups: FormField = this.groupsRepeaterFields(
          'groups',
          (tt.groups || []).map((g) => {
            return { id: g.id, name: g.name };
          }),
          teamOptions
        );

        const stages: FormField = this.stagesRepeaterFields(
          'stages',
          (tt.stages || []).map((s) => {
            return { id: s.id, name: s.name, kind: s.kind, order: s.order };
          })
        );

        this.editTournamentFormFields = [...fields, groups, stages];
        this.openEditTournamentFormModal = true;
      });
  }

  async onDeleteTournamentClick(t: Tournament): Promise<void> {
    const ok = await this.deleteConfirm.open({
      title: 'Usuń turniej',
      message: 'Czy na pewno chcesz usunąć ten turniej?',
      confirmVariant: 'danger',
      labels: { confirm: 'Usuń', cancel: 'Anuluj' },
    });
    if (!ok) {
      return;
    }

    this.isLoading = true;
    this.api
      .deleteTournament(t.id)
      .pipe(
        tap(() => {
          this.refresh();
          const selected = this.store.getSelectedIdSync();
          if (selected === t.id) {
            this.store.clearTournament();
          }
          this.store.refreshTournament();
          if (this.editingId === t.id) {
            this.editingId = '';
          }
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd usuwania turnieju:', err),
      });
  }

  onAddTournamentFormSubmitted(fields: FormField[]): void {
    const f = this.reduceFields(fields);

    const name = String(f['name'] ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    if (!name) {
      console.warn('Nazwa turnieju jest wymagana');
      return;
    }

    const rawMode = String(f['mode'] ?? '').toUpperCase();
    const allowedModes: TournamentMode[] = [
      'LEAGUE',
      'KNOCKOUT',
      'LEAGUE_PLAYOFFS',
    ];
    const mode: TournamentMode = allowedModes.includes(
      rawMode as TournamentMode
    )
      ? (rawMode as TournamentMode)
      : 'LEAGUE';

    const payload: CreateTournamentPayload = { name, mode };

    const desc = String(f['description'] ?? '').trim();
    if (desc !== '') {
      payload.description = desc;
    }

    const addInfo = String(f['additionalInfo'] ?? '').trim();
    if (addInfo !== '') {
      payload.additionalInfo = addInfo;
    }

    const season = String(f['season'] ?? '').trim();
    if (season !== '') {
      payload.season = season;
    }

    const start = String(f['startDate'] ?? '').trim();
    if (start !== '') {
      payload.startDate = start;
    }

    const end = String(f['endDate'] ?? '').trim();
    if (end !== '') {
      payload.endDate = end;
    }

    const tz = String(f['timezone'] ?? '').trim();
    if (tz !== '') {
      payload.timezone = tz;
    }

    const venue = String(f['venue'] ?? '').trim();
    if (venue !== '') {
      payload.venue = venue;
    }

    const addr = String(f['venueAddress'] ?? '').trim();
    if (addr !== '') {
      payload.venueAddress = addr;
    }

    const img = String(f['venueImageUrl'] ?? '').trim();
    if (img !== '') {
      payload.venueImageUrl = img;
    }

    const groups = (f['groups'] as any[]) || [];
    if (groups.length > 0) {
      (payload as any).groups = groups.map((g) => {
        return {
          name: String(g?.name || '').trim(),
        };
      });
    }

    const stages = (f['stages'] as any[]) || [];
    if (stages.length > 0) {
      (payload as any).stages = stages.map((s) => {
        return {
          name: String(s?.name || '').trim(),
          kind: this.normKind(s?.kind),
          order: Number(s?.order ?? 1) || 1,
        };
      });
    }

    const imgFile = f['venueImageFile'] as File | undefined;

    this.isLoading = true;
    this.api
      .createTournament(payload)
      .pipe(
        switchMap((t) => {
          if (imgFile) {
            return this.api.uploadTournamentVenueImage(t.id, imgFile);
          }
          return of(t);
        }),
        tap(() => {
          this.openAddTournamentFormModal = false;
          this.addTournamentFormFields = this.getTournamentFields();
          this.refresh();
          this.store.refreshTournament();
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Błąd tworzenia turnieju:', err);
        },
      });
  }

  onEditTournamentFormSubmitted(fields: FormField[]): void {
    if (!this.editingId) {
      console.warn('Brak ID turnieju do edycji.');
      return;
    }

    const f = this.reduceFields(fields);
    const patch: UpdateTournamentPayload = {};

    const name = String(f['name'] ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    if (name) {
      patch.name = name;
    }

    const rawMode = String(f['mode'] ?? '').toUpperCase();
    const allowed: TournamentMode[] = ['LEAGUE', 'KNOCKOUT', 'LEAGUE_PLAYOFFS'];
    if (allowed.includes(rawMode as TournamentMode)) {
      patch.mode = rawMode as TournamentMode;
    }

    const nullOr = (key: keyof UpdateTournamentPayload, val: unknown) => {
      const v = String(val ?? '').trim();
      (patch as any)[key] = v === '' ? null : v;
    };
    nullOr('description', f['description']);
    nullOr('additionalInfo', f['additionalInfo']);
    nullOr('season', f['season']);
    nullOr('startDate', f['startDate']);
    nullOr('endDate', f['endDate']);
    nullOr('timezone', f['timezone']);
    nullOr('venue', f['venue']);
    nullOr('venueAddress', f['venueAddress']);
    nullOr('venueImageUrl', f['venueImageUrl']);
    const imgFile = f['venueImageFile'] as File | undefined;

    const groups: any[] = (f['groups'] as any[]) || [];
    const currentGroupIds: Set<string> = new Set<string>(
      groups
        .map((g) => String(g?.id || '').trim())
        .filter((id) => id.length > 0)
    );

    const groupsDelete: string[] = Array.from(this.editGroupsInitialIds).filter(
      (id) => !currentGroupIds.has(id)
    );

    const groupsUpdate = groups
      .filter((g) => !!String(g?.id || '').trim())
      .map((g) => {
        return {
          id: String(g.id),
          name: String(g.name || '').trim(),
        };
      });

    const groupsAppend = groups
      .filter((g) => !String(g?.id || '').trim())
      .map((g) => {
        return {
          name: String(g?.name || '').trim(),
        };
      });

    if (groupsUpdate.length > 0) {
      (patch as any).groupsUpdate = groupsUpdate;
    }
    if (groupsAppend.length > 0) {
      (patch as any).groupsAppend = groupsAppend;
    }
    if (groupsDelete.length > 0) {
      (patch as any).groupsDelete = groupsDelete;
    }

    const stages: any[] = (f['stages'] as any[]) || [];
    const currentStageIds: Set<string> = new Set<string>(
      stages
        .map((s) => String(s?.id || '').trim())
        .filter((id) => id.length > 0)
    );

    const stagesDelete: string[] = Array.from(this.editStagesInitialIds).filter(
      (id) => !currentStageIds.has(id)
    );

    const stagesUpdate = stages
      .filter((s) => !!String(s?.id || '').trim())
      .map((s) => {
        return {
          id: String(s.id),
          name: String(s.name || '').trim(),
          kind: this.normKind(s?.kind),
          order: Number(s.order ?? 1) || 1,
        };
      });

    const stagesAppend = stages
      .filter((s) => !String(s?.id || '').trim())
      .map((s) => {
        return {
          name: String(s?.name || '').trim(),
          kind: (s?.kind === 'PLAYOFF' ? 'PLAYOFF' : 'GROUP') as StageKind,
          order: Number(s?.order ?? 1) || 1,
        };
      });

    if (stagesUpdate.length > 0) {
      (patch as any).stagesUpdate = stagesUpdate;
    }
    if (stagesAppend.length > 0) {
      (patch as any).stagesAppend = stagesAppend;
    }
    if (stagesDelete.length > 0) {
      (patch as any).stagesDelete = stagesDelete;
    }

    this.isLoading = true;
    this.api
      .updateTournament(this.editingId, patch)
      .pipe(
        switchMap((t) => {
          if (imgFile) {
            return this.api.uploadTournamentVenueImage(t.id, imgFile);
          }
          return of(t);
        }),
        tap(() => {
          this.openEditTournamentFormModal = false;
          this.editTournamentFormFields = this.getTournamentFields();
          this.refresh();
          this.store.refreshTournament();
          this.editingId = '';
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Błąd edycji turnieju:', err);
        },
      });
  }

  onEditModalClose(): void {
    this.openEditTournamentFormModal = false;
    this.editingId = '';
  }

  private reduceFields<
    T extends Record<string, unknown> = Record<string, unknown>
  >(fields: FormField[]): T {
    return fields.reduce((acc, f) => {
      (acc as Record<string, unknown>)[f.name] = f.value as unknown;
      return acc;
    }, {} as T);
  }

  private toDateInput(iso?: string | null): string {
    if (!iso) {
      return '';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : '';
    }
    return d.toISOString().slice(0, 10);
  }

  private getTournamentFields(): FormField[] {
    return [
      {
        name: 'name',
        label: 'Nazwa turnieju',
        type: 'text',
        required: true,
        value: '',
        placeholder: 'Nazwa turnieju',
      },
      {
        name: 'mode',
        label: 'Tryb turnieju',
        type: 'select',
        required: true,
        value: 'LEAGUE',
        options: [
          { label: 'Liga', value: 'LEAGUE' },
          { label: 'Puchar (KO)', value: 'KNOCKOUT' },
          { label: 'Liga + Play-off', value: 'LEAGUE_PLAYOFFS' },
        ],
      },
      {
        name: 'season',
        label: 'Sezon/edycja turnieju',
        type: 'text',
        value: '',
        placeholder: '2025/26',
      },
      {
        name: 'startDate',
        label: 'Data startu turnieju',
        type: 'date',
        value: '',
      },
      {
        name: 'endDate',
        label: 'Data zakończenia turnieju',
        type: 'date',
        value: '',
      },
      {
        name: 'timezone',
        label: 'Strefa czasowa turnieju',
        type: 'text',
        value: 'Europe/Warsaw',
      },
      {
        name: 'description',
        label: 'Opis turnieju',
        type: 'textarea',
        value: '',
        rows: 4,
      },
      {
        name: 'additionalInfo',
        label: 'Informacje dodatkowe o turnieju',
        type: 'textarea',
        value: '',
        rows: 3,
      },
      {
        name: 'venue',
        label: 'Nazwa obiektu turnieju',
        type: 'text',
        value: '',
        placeholder: 'Nazwa obiektu turnieju',
      },
      {
        name: 'venueAddress',
        label: 'Adres rozgrywania turnieju',
        type: 'text',
        value: '',
        placeholder: 'Adres rozgrywania turnieju',
      },
      {
        name: 'venueImageUrl',
        label: 'Zdjęcie obiektu turnieju',
        type: 'text',
        required: false,
        value: '',
        placeholder: 'Scieżka zdjęcia obiektu turnieju',
      },
      {
        name: 'venueImageFile',
        label: 'Wgraj zdjęcie obiektu turnieju',
        type: 'file',
        required: false,
      },
    ];
  }

  private groupsRepeaterFields(
    name: string,
    value: any[],
    teamOptions: { label: string; value: string }[]
  ): FormField {
    const fields: FormField[] = [
      { name: 'id', label: 'Id', type: 'hidden', value: '' },
      {
        name: 'name',
        label: 'Nazwa grupy',
        type: 'text',
        required: true,
        value: '',
        placeholder: 'Grupa A',
      },
    ];

    return {
      name,
      label: 'Grupy turnieju',
      type: 'repeater',
      itemLabel: 'Grupa',
      addLabel: 'Dodaj grupę',
      removeLabel: 'Usuń grupę',
      fields,
      value: value ?? [],
      totalSpan: 12,
      actualSpan: 12,
    } as FormField;
  }

  private stagesRepeaterFields(
    name: string,
    value: any[],
    existing = false
  ): FormField {
    const fields: FormField[] = [
      { name: 'id', label: 'Id', type: 'hidden', value: '' },
      {
        name: 'name',
        label: 'Nazwa etapu',
        type: 'text',
        required: true,
        value: '',
        placeholder: 'Faza grupowa',
      },
      {
        name: 'kind',
        label: 'Rodzaj etapu',
        type: 'select',
        options: [
          { label: 'Faza grupowa', value: 'GROUP' },
          { label: 'Play-off', value: 'PLAYOFF' },
        ],
        value: 'GROUP',
        //disabled: existing,
      },
      {
        name: 'order',
        label: 'Kolejność',
        type: 'number',
        value: 1,
        min: 1,
        step: 1,
      },
    ];
    return {
      name,
      label: 'Etapy turnieju',
      type: 'repeater',
      itemLabel: 'Etap',
      addLabel: 'Dodaj etap',
      removeLabel: 'Usuń etap',
      fields,
      value: value ?? [],
      totalSpan: 12,
      actualSpan: 12,
    } as FormField;
  }
}
