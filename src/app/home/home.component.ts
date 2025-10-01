import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LokalizacjaComponent } from './components/lokalizacja/lokalizacja.component';
import { LeagueDescriptionComponent } from './components/league-description/league-description.component';
import { MatchTimerComponent } from './components/match-timer/match-timer.component';
import { TournamentTitleComponent } from './components/tournament-title/tournament-title.component';
import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { stringsHome } from './misc';
import { TournamentStore } from '../core/services/tournament-store.service';
import { HttpTournamentApi } from '../core/api/http-tournament.api';
import { FormField } from '../shared/components/dynamic-form/models/form-field';
import { finalize, take, tap } from 'rxjs';
import {
  CreateTournamentPayload,
  UpdateTournamentPayload,
} from '../core/models';
import { TournamentMode } from '../core/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    LokalizacjaComponent,
    LeagueDescriptionComponent,
    MatchTimerComponent,
    TournamentTitleComponent,
    DynamicFormComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('deleteConfirm') deleteConfirm!: ConfirmModalComponent;

  moduleStrings = stringsHome;

  private readonly store = inject(TournamentStore);
  private readonly api = inject(HttpTournamentApi);

  formTitleAddTournament = this.moduleStrings.formTitleAddTournament;
  formTitleEditTournament = this.moduleStrings.formTitleEditTournament;

  openAddTournamentFormModal = false;
  openEditTournamentFormModal = false;

  addTournamentFormFields: FormField[] = this.getEmptyTournamentFields();
  editTournamentFormFields: FormField[] = this.getEmptyTournamentFields();

  isLoading = false;

  onAddTournamentClick(): void {
    this.addTournamentFormFields = this.getEmptyTournamentFields();
    this.openAddTournamentFormModal = true;
  }

  onEditTournamentClick(): void {
    this.store.tournament$.pipe(take(1)).subscribe({
      next: (t) => {
        if (!t) {
          console.warn('Brak turnieju do edycji');
          return;
        }

        const fields = this.getEmptyTournamentFields();
        const set = (name: string, val: any) => {
          const f = fields.find((x) => x.name === name);
          if (f) {
            f.value = (val ?? '') as any;
          }
        };

        set('name', t.name ?? '');
        set('mode', t.mode ?? 'LEAGUE');
        set('season', t.season ?? '');

        set('startDate', this.toDateInput(t.startDate));
        set('endDate', this.toDateInput(t.endDate));
        set('timezone', t.timezone ?? 'Europe/Warsaw');

        set('description', t.description ?? '');
        set('additionalInfo', t.additionalInfo ?? '');

        set('venue', t.venue ?? '');
        set('venueAddress', t.venueAddress ?? '');
        set('venueImageUrl', t.venueImageUrl ?? '');

        this.editTournamentFormFields = [...fields];
        this.openEditTournamentFormModal = true;
      },
      error: (err) =>
        console.error('Nie można przygotować edycji turnieju:', err),
    });
  }

  async onDeleteTournamentClick(): Promise<void> {
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
    this.store.tournament$.pipe(take(1)).subscribe({
      next: (t) => {
        if (!t?.id) {
          console.warn('Brak ID turnieju do usunięcia');
          this.isLoading = false;
          return;
        }
        this.api
          .deleteTournament(t.id)
          .pipe(
            tap(() => this.store.refreshTournament()),
            finalize(() => (this.isLoading = false))
          )
          .subscribe({
            next: () => {},
            error: (err) => console.error('Błąd usuwania turnieju:', err),
          });
      },
      error: (err) => {
        console.error('Błąd pobierania turnieju do usunięcia:', err);
        this.isLoading = false;
      },
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

    this.isLoading = true;
    this.api
      .createTournament(payload)
      .pipe(
        tap(() => {
          this.openAddTournamentFormModal = false;
          this.addTournamentFormFields = this.getEmptyTournamentFields();
          this.store.refreshTournament();
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd tworzenia turnieju:', err),
      });
  }

  onEditTournamentFormSubmitted(fields: FormField[]): void {
    this.store.tournament$.pipe(take(1)).subscribe({
      next: (t) => {
        if (!t?.id) {
          console.warn('Brak ID turnieju do edycji.');
          return;
        }

        const f = this.reduceFields(fields);

        const name = String(f['name'] ?? '')
          .trim()
          .replace(/\s+/g, ' ');
        if (!name) {
          console.warn('Nazwa turnieju jest wymagana');
          return;
        }

        const patch: UpdateTournamentPayload = { name };

        const rawMode = String(f['mode'] ?? '').toUpperCase();
        if (rawMode) {
          const allowed: TournamentMode[] = [
            'LEAGUE',
            'KNOCKOUT',
            'LEAGUE_PLAYOFFS',
          ];
          if (allowed.includes(rawMode as TournamentMode)) {
            patch.mode = rawMode as TournamentMode;
          }
        }

        const desc = String(f['description'] ?? '').trim();
        patch.description = desc === '' ? null : desc;

        const addInfo = String(f['additionalInfo'] ?? '').trim();
        patch.additionalInfo = addInfo === '' ? null : addInfo;

        const season = String(f['season'] ?? '').trim();
        patch.season = season === '' ? null : season;

        const start = String(f['startDate'] ?? '').trim();
        patch.startDate = start === '' ? null : start;

        const end = String(f['endDate'] ?? '').trim();
        patch.endDate = end === '' ? null : end;

        const tz = String(f['timezone'] ?? '').trim();
        patch.timezone = tz === '' ? null : tz;

        const venue = String(f['venue'] ?? '').trim();
        patch.venue = venue === '' ? null : venue;

        const addr = String(f['venueAddress'] ?? '').trim();
        patch.venueAddress = addr === '' ? null : addr;

        const img = String(f['venueImageUrl'] ?? '').trim();
        patch.venueImageUrl = img === '' ? null : img;

        this.isLoading = true;
        this.api
          .updateTournament(t.id, patch)
          .pipe(
            tap(() => {
              this.openEditTournamentFormModal = false;
              this.editTournamentFormFields = this.getEmptyTournamentFields();
              this.store.refreshTournament();
            }),
            finalize(() => (this.isLoading = false))
          )
          .subscribe({
            next: () => {},
            error: (err) => console.error('Błąd edycji turnieju:', err),
          });
      },
      error: (err) => console.error('Błąd pobierania turnieju do edycji:', err),
    });
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

  private getEmptyTournamentFields(): FormField[] {
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
        value: '',
        placeholder: 'Scieżka zdjęcia obiektu turnieju',
      },
    ];
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
