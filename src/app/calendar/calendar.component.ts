import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  finalize,
  forkJoin,
  map,
  Observable,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { CalendarDay } from './models/calendar-day.model';
import { CalendarDayComponent } from './components/calendar-day/calendar-day.component';
import { Match } from './models/match.model';
import { MatchService } from './services/match.service';
import { MatchDetailsModalComponent } from './components/match-details-modal/match-details-modal.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import {
  Team as CoreTeam,
  Player as CorePlayer,
  MatchEventInput,
  UpdateMatchPayload,
  CreateMatchPayload,
  Tournament,
} from '../core/models';
import { TournamentStore } from '../core/services/tournament-store.service';
import { VoteFacade } from './services/vote.facade';
import { stringsCalendar } from './misc';
import { stringsConfirmModal } from './misc';
import { AuthService } from '../core/auth/auth.service';
import {
  FormField,
  RepeaterFormField,
  SelectFormField,
  SelectOption,
} from '../shared/components/dynamic-form/models/form-field';

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarDayComponent,
    CommonModule,
    MatchDetailsModalComponent,
    PageHeaderComponent,
    DynamicFormComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
})
export class CalendarComponent {
  @ViewChild('confirmModal', { static: true })
  confirmModal!: ConfirmModalComponent;

  @ViewChild('deleteAllMatchesConfirm')
  deleteAllMatchesConfirm!: ConfirmModalComponent;

  @ViewChild('deleteMatchConfirm') deleteMatchConfirm!: ConfirmModalComponent;

  moduleStrings = stringsCalendar;
  confirmStrings = stringsConfirmModal;
  selectedMatch: Match | null = null;

  private readonly voteFacade = inject(VoteFacade);
  private readonly matchService = inject(MatchService);
  private readonly store = inject(TournamentStore);
  private readonly auth = inject(AuthService);

  private latestTeamMap = new Map<string, CoreTeam>();
  private latestPlayerMap = new Map<string, CorePlayer>();

  readonly days$: Observable<CalendarDay[]> =
    this.matchService.getCalendarDays$();
  readonly teamMap$: Observable<Map<string, CoreTeam>> = this.store.teamMap$;
  readonly playerMap$: Observable<Map<string, CorePlayer>> =
    this.store.playerMap$;

  constructor() {
    this.teamMap$.subscribe((m) => (this.latestTeamMap = m));
    this.playerMap$.subscribe((m) => (this.latestPlayerMap = m));
  }

  readonly teamsOptions$ = this.teamMap$.pipe(
    map((tm) =>
      Array.from(tm.values()).map((t) => ({
        label: t.name,
        value: String(t.id),
      }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly playersOptions$ = this.playerMap$.pipe(
    map((pm) =>
      Array.from(pm.values()).map((p) => ({
        label: p.name,
        value: String(p.id),
      }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly stagesOptions$ = this.store.tournament$.pipe(
    map((t) =>
      (t?.stages ?? []).map((s) => ({ label: s.name, value: String(s.id) }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly groupsOptions$ = this.store.tournament$.pipe(
    map((t) =>
      (t?.groups ?? []).map((g) => ({ label: g.name, value: String(g.id) }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  isAdmin$ = this.auth.isAdmin$;
  isLoading = false;

  formTitleAddMatch = this.moduleStrings.addMatch;
  openAddMatchFormModal = false;
  addMatchFormFields: FormField[] = [];

  formTitleEditMatch = this.moduleStrings.editMatch;
  openEditMatchFormModal = false;
  editMatchFormFields: FormField[] = [];
  private editingMatch: Match | null = null;

  formTitleGenerate = this.moduleStrings.generateMatchesTitleForm;
  openGenerateFormModal = false;
  generateFormFields: FormField[] = [];

  private gkOptionsForTeam(teamId?: string | null) {
    if (!teamId) return [];
    return Array.from(this.latestPlayerMap.values())
      .filter((p) => p.teamId === teamId && p.position === 'GK')
      .map((p) => ({ label: p.name, value: String(p.id) }));
  }

  async onRequestVoteConfirm(e: {
    matchId: string;
    playerId: string;
    playerName?: string;
  }) {
    const playerName = e.playerName ?? e.playerId;
    const ok = await this.confirmModal.open({
      title: this.confirmStrings.title,
      message: `${this.confirmStrings.message} (${playerName})`,
      labels: this.confirmStrings.labels,
    });

    if (ok) {
      this.voteFacade.voteFor(e.matchId as any, e.playerId);
    }
  }

  onAddMatch(): void {
    this.isLoading = true;
    forkJoin({
      t: this.store.tournament$.pipe(take(1)),
      stageOpts: this.stagesOptions$.pipe(take(1)),
      groupOpts: this.groupsOptions$.pipe(take(1)),
      teamOpts: this.teamsOptions$.pipe(take(1)),
      playerOpts: this.playersOptions$.pipe(take(1)),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(({ t, stageOpts, groupOpts, teamOpts, playerOpts }) => {
        this.addMatchFormFields = this.getCreateMatchFields(
          t,
          stageOpts,
          groupOpts,
          teamOpts,
          playerOpts
        );
        this.openAddMatchFormModal = true;
      });
  }

  onAddMatchFormSubmitted(fields: FormField[]): void {
    const f = this.reduceFields(fields);

    const stageId = String(f['stageId'] ?? '').trim();
    const dateLocal = String(f['date'] ?? '').trim();
    if (!stageId || !dateLocal) {
      console.warn('stageId oraz data są wymagane.');
      return;
    }

    const payload: CreateMatchPayload = {
      stageId,
      date: this.toIsoFromLocal(dateLocal),
    };

    const groupId = String(f['groupId'] ?? '').trim();
    if (groupId) {
      payload.groupId = groupId;
    }

    const round = this.numOrUndefined(f['round']);
    if (round !== undefined) {
      payload.round = round;
    }

    const index = this.numOrUndefined(f['index']);
    if (!groupId && index !== undefined && index >= 1) {
      payload.index = index;
    }

    const status = String(f['status'] ?? '')
      .trim()
      .toUpperCase();
    if (status) {
      payload.status = status as any;
    }

    const homeTeamId = String(f['homeTeamId'] ?? '').trim();
    if (homeTeamId !== '') {
      payload.homeTeamId = homeTeamId || null;
    }

    const awayTeamId = String(f['awayTeamId'] ?? '').trim();
    if (awayTeamId !== '') {
      payload.awayTeamId = awayTeamId || null;
    }

    const scoreHome = this.numOrUndefined(f['scoreHome']);
    const scoreAway = this.numOrUndefined(f['scoreAway']);
    if (scoreHome !== undefined || scoreAway !== undefined) {
      payload.score = {
        home: scoreHome ?? 0,
        away: scoreAway ?? 0,
      };
    }

    const homeGKIds = Array.isArray(f['homeGKIds'])
      ? (f['homeGKIds'] as string[])
      : [];
    if (homeGKIds.length > 0) {
      payload.homeGKIds = homeGKIds;
    }

    const awayGKIds = Array.isArray(f['awayGKIds'])
      ? (f['awayGKIds'] as string[])
      : [];
    if (awayGKIds.length > 0) {
      payload.awayGKIds = awayGKIds;
    }

    const eventsArr = Array.isArray(f['events']) ? (f['events'] as any[]) : [];
    if (eventsArr.length > 0) {
      payload.events = eventsArr
        .filter((e) => !!e)
        .map((e) => {
          const minute = this.numOrUndefined(e['minute']) ?? 0;
          const type = String(e['type'] ?? '').toUpperCase();
          const playerId = String(e['playerId'] ?? '').trim();
          const teamId = String(e['teamId'] ?? '').trim();
          const card = String(e['card'] ?? '').toUpperCase();
          const ev: MatchEventInput = {
            minute,
            type: type as any,
            playerId,
            teamId,
          };
          if (card) {
            (ev as any).card = card;
          }
          return ev;
        });
    }

    this.isLoading = true;
    this.matchService
      .createMatch$(payload)
      .pipe(
        tap(() => {
          this.openAddMatchFormModal = false;
          this.addMatchFormFields = [];
          this.store.refreshMatches();
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd tworzenia meczu:', err),
      });
  }

  onAddMatchFormChanged(val: Record<string, any>) {
    const fields = this.addMatchFormFields;

    const homeTeamId =
      (val['homeTeamId'] ?? this.fieldValue(fields, 'homeTeamId') ?? '')
        .toString()
        .trim() || null;

    const awayTeamId =
      (val['awayTeamId'] ?? this.fieldValue(fields, 'awayTeamId') ?? '')
        .toString()
        .trim() || null;

    this.setSelectOptions(
      fields,
      'homeGKIds',
      this.gkOptionsForTeam(homeTeamId)
    );
    this.setSelectOptions(
      fields,
      'awayGKIds',
      this.gkOptionsForTeam(awayTeamId)
    );

    this.setRepeaterSelectOptions(fields, 'events', 'teamId', [
      ...(homeTeamId
        ? [
            {
              label: this.latestTeamMap.get(homeTeamId)?.name ?? homeTeamId,
              value: homeTeamId,
            },
          ]
        : []),
      ...(awayTeamId
        ? [
            {
              label: this.latestTeamMap.get(awayTeamId)?.name ?? awayTeamId,
              value: awayTeamId,
            },
          ]
        : []),
    ]);
    const eventsVal = Array.isArray(val['events']) ? val['events'] : [];
    this.setRepeaterPlayersOptionsByIndex(
      fields,
      'events',
      eventsVal,
      homeTeamId,
      awayTeamId
    );
  }

  onEditMatchFormChanged(val: Record<string, any>) {
    if (!this.editingMatch) return;
    const fields = this.editMatchFormFields;

    const homeTeamId =
      (val['homeTeamId'] ?? this.fieldValue(fields, 'homeTeamId') ?? '')
        .toString()
        .trim() || null;

    const awayTeamId =
      (val['awayTeamId'] ?? this.fieldValue(fields, 'awayTeamId') ?? '')
        .toString()
        .trim() || null;

    this.setSelectOptions(
      fields,
      'homeGKIds',
      this.gkOptionsForTeam(homeTeamId)
    );
    this.setSelectOptions(
      fields,
      'awayGKIds',
      this.gkOptionsForTeam(awayTeamId)
    );

    this.setRepeaterSelectOptions(fields, 'events', 'teamId', [
      ...(homeTeamId
        ? [
            {
              label: this.latestTeamMap.get(homeTeamId)?.name ?? homeTeamId,
              value: homeTeamId,
            },
          ]
        : []),
      ...(awayTeamId
        ? [
            {
              label: this.latestTeamMap.get(awayTeamId)?.name ?? awayTeamId,
              value: awayTeamId,
            },
          ]
        : []),
    ]);

    const eventsVal = Array.isArray(val['events']) ? val['events'] : [];
    this.setRepeaterPlayersOptionsByIndex(
      fields,
      'events',
      eventsVal,
      homeTeamId,
      awayTeamId
    );
  }

  onEditMatch(match: Match): void {
    this.isLoading = true;
    forkJoin({
      t: this.store.tournament$.pipe(take(1)),
      stageOpts: this.stagesOptions$.pipe(take(1)),
      groupOpts: this.groupsOptions$.pipe(take(1)),
      teamOpts: this.teamsOptions$.pipe(take(1)),
      playerOpts: this.playersOptions$.pipe(take(1)),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(({ t, stageOpts, groupOpts, teamOpts, playerOpts }) => {
        this.editingMatch = match;
        this.editMatchFormFields = this.getEditMatchFields(
          t,
          match,
          stageOpts,
          groupOpts,
          teamOpts,
          playerOpts
        );

        const homeTeamId = match.homeTeamId ? String(match.homeTeamId) : null;
        const awayTeamId = match.awayTeamId ? String(match.awayTeamId) : null;
        const existingEvents = Array.isArray(match.events) ? match.events : [];
        this.setRepeaterPlayersOptionsByIndex(
          this.editMatchFormFields,
          'events',
          existingEvents,
          homeTeamId,
          awayTeamId
        );

        this.openEditMatchFormModal = true;
      });
  }

  onEditMatchFormSubmitted(fields: FormField[]): void {
    if (!this.editingMatch) {
      this.openEditMatchFormModal = false;
      return;
    }

    const base = this.editingMatch;
    const f = this.reduceFields(fields);
    const patch: UpdateMatchPayload = {};

    const stageId = String(f['stageId'] ?? '').trim();
    if (stageId && stageId !== base.stageId) {
      patch.stageId = stageId;
    }

    const groupIdRaw = String(f['groupId'] ?? '').trim();
    const newGroupId = groupIdRaw === '' ? null : groupIdRaw;

    const index = this.numOrUndefined(f['index']);
    if (!newGroupId && index !== undefined && index >= 1) {
      patch.index = index;
    } else if (newGroupId) {
      patch.index = null;
    }

    const editedEvents = Array.isArray(f['events'])
      ? (f['events'] as any[])
      : [];
    const baseEvents = Array.isArray(base.events) ? (base.events as any[]) : [];
    const { append, update, del } = this.diffEvents(baseEvents, editedEvents);
    if (append.length) patch.eventsAppend = append;
    if (update.length) patch.eventsUpdate = update as any[];
    if (del.length) patch.eventsDelete = del;

    const round = this.numOrUndefined(f['round']);
    if (round !== undefined) {
      patch.round = round;
    }

    const dateLocal = String(f['date'] ?? '').trim();
    if (dateLocal) {
      patch.date = this.toIsoFromLocal(dateLocal);
    }

    const status = String(f['status'] ?? '')
      .trim()
      .toUpperCase();
    if (status) {
      patch.status = status as any;
    }

    const homeTeamId = String(f['homeTeamId'] ?? '').trim();
    if (homeTeamId !== '') {
      patch.homeTeamId = homeTeamId || null;
    }

    const awayTeamId = String(f['awayTeamId'] ?? '').trim();
    if (awayTeamId !== '') {
      patch.awayTeamId = awayTeamId || null;
    }

    const scoreHome = this.numOrUndefined(f['scoreHome']);
    const scoreAway = this.numOrUndefined(f['scoreAway']);
    if (scoreHome !== undefined || scoreAway !== undefined) {
      patch.score = {
        home: scoreHome !== undefined ? scoreHome : base.score?.home ?? null,
        away: scoreAway !== undefined ? scoreAway : base.score?.away ?? null,
      };
    }

    const homeGKIds = Array.isArray(f['homeGKIds'])
      ? (f['homeGKIds'] as string[])
      : undefined;
    if (homeGKIds && homeGKIds.length > 0) {
      patch.homeGKIds = homeGKIds;
    }

    const awayGKIds = Array.isArray(f['awayGKIds'])
      ? (f['awayGKIds'] as string[])
      : undefined;
    if (awayGKIds && awayGKIds.length > 0) {
      patch.awayGKIds = awayGKIds;
    }

    this.isLoading = true;
    this.matchService
      .updateMatch$(base.id, patch)
      .pipe(
        tap(() => {
          this.openEditMatchFormModal = false;
          this.editMatchFormFields = [];
          this.editingMatch = null;
          this.store.refreshMatches();
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd edycji meczu:', err),
      });
  }

  private playersOptionsForTeams(teamIds: string[]): SelectOption[] {
    const wanted = new Set(teamIds.filter(Boolean));
    return Array.from(this.latestPlayerMap.values())
      .filter((p) => (wanted.size ? wanted.has(p.teamId) : false))
      .map((p) => ({ label: p.name, value: String(p.id) }));
  }

  private playersOptionsForEventTeam(
    teamId: string | null,
    homeTeamId: string | null,
    awayTeamId: string | null
  ): SelectOption[] {
    if (teamId) return this.playersOptionsForTeams([teamId]);
    const tids = [homeTeamId ?? '', awayTeamId ?? ''].filter(
      Boolean
    ) as string[];
    return this.playersOptionsForTeams(tids);
  }

  private setRepeaterPlayersOptionsByIndex(
    arr: FormField[],
    repeaterName: string,
    eventsVal: any[],
    homeTeamId: string | null,
    awayTeamId: string | null
  ) {
    const i = arr.findIndex(
      (f) => f.name === repeaterName && f.type === 'repeater'
    );
    if (i < 0) return;
    const rep = arr[i] as RepeaterFormField;

    const byIndex: Record<number, Record<string, SelectOption[]>> = {};
    (eventsVal ?? []).forEach((ev, idx) => {
      const tid = String(ev?.teamId ?? '').trim() || null;
      byIndex[idx] = {
        playerId: this.playersOptionsForEventTeam(tid, homeTeamId, awayTeamId),
      };
    });
    rep.optionsByIndex = byIndex;
  }

  private diffEvents(baseEvents: any[], editedEvents: any[]) {
    const baseById = new Map<string, any>();
    baseEvents.forEach((e, i) => baseById.set(String(e.id ?? i), e));

    const seen = new Set<string>();
    const append: MatchEventInput[] = [];
    const update: Array<{
      id: string;
      minute?: number;
      type?: string;
      playerId?: string;
      teamId?: string;
      card?: string | null;
    }> = [];

    const num = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const up = (s: any) =>
      String(s ?? '')
        .trim()
        .toUpperCase();

    for (const e of editedEvents) {
      const idRaw = String(e['id'] ?? '').trim();
      const minute = num(e['minute']) ?? 0;
      const type = up(e['type']);
      const playerId = String(e['playerId'] ?? '').trim();
      const teamId = String(e['teamId'] ?? '').trim();
      const card = up(e['card']);

      if (!idRaw || !baseById.has(idRaw)) {
        const ev: any = { minute, type, playerId, teamId };
        if (type === 'CARD') ev.card = card || 'YELLOW';
        append.push(ev as MatchEventInput);
      } else {
        seen.add(idRaw);
        const old = baseById.get(idRaw) ?? {};
        const out: any = { id: idRaw };
        let changed = false;

        if ((old.minute ?? 0) !== minute) {
          out.minute = minute;
          changed = true;
        }
        if (up(old.type) !== type) {
          out.type = type;
          changed = true;
        }
        if ((old.playerId ?? '') !== playerId) {
          out.playerId = playerId;
          changed = true;
        }
        if ((old.teamId ?? '') !== teamId) {
          out.teamId = teamId;
          changed = true;
        }

        const oldCard = up(old.card);
        if (type === 'CARD') {
          if (oldCard !== (card || 'YELLOW')) {
            out.card = card || 'YELLOW';
            changed = true;
          }
        } else if (oldCard) {
          out.card = null;
          changed = true;
        }

        if (changed) update.push(out);
      }
    }

    const del: string[] = [];
    for (const id of baseById.keys()) {
      if (!seen.has(id)) del.push(id);
    }

    return { append, update, del };
  }

  async onDeleteMatch(match: Match): Promise<void> {
    const ok = await this.deleteMatchConfirm.open({
      title: this.moduleStrings.deleteMatch,
      message: `Czy na pewno chcesz usunąć mecz: ${match.teamA} – ${match.teamB}?`,
      confirmVariant: 'danger',
      labels: {
        confirm: this.moduleStrings.deleteModalLabels.confirm,
        cancel: this.moduleStrings.deleteModalLabels.cancel,
      },
    });
    if (!ok) {
      return;
    }

    this.isLoading = true;
    this.matchService
      .deleteMatch$(match.id)
      .pipe(
        tap(() => this.store.refreshMatches()),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd usuwania meczu:', err),
      });
  }

  async onDeleteAllMatches(): Promise<void> {
    const ok = await this.deleteAllMatchesConfirm.open({
      title: this.moduleStrings.deleteAllMatchesByGroup,
      message:
        'Czy na pewno chcesz usunąć wszystkie mecze z etapu fazy grupowej?',
      confirmVariant: 'danger',
      labels: {
        confirm: this.moduleStrings.deleteModalLabels.confirm,
        cancel: this.moduleStrings.deleteModalLabels.cancel,
      },
    });
    if (!ok) {
      return;
    }

    this.isLoading = true;

    this.store.tournament$
      .pipe(
        take(1),
        map((t) => t.stages.find((s) => s.kind === 'GROUP')?.id ?? null),
        tap((stageId) => {
          if (!stageId) throw new Error('Brak etapu GROUP w turnieju.');
        }),
        switchMap((stageId) => this.matchService.deleteAllByStage$(stageId!)),
        tap(() => this.store.refreshMatches()),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: ({ count }) =>
          console.log(`Usunięto ${count} mecz(e/y) z etapu GROUP`),
        error: (err) =>
          console.error('Błąd usuwania wszystkich meczów (GROUP):', err),
      });
  }

  onGenerateMatches(): void {
    this.isLoading = true;
    forkJoin({
      t: this.store.tournament$.pipe(take(1)),
      groupOpts: this.groupsOptions$.pipe(take(1)),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(({ t, groupOpts }) => {
        this.generateFormFields = this.getGenerateRoundRobinFields(
          t,
          groupOpts
        );
        this.openGenerateFormModal = true;
      });
  }

  onGenerateFormSubmitted(fields: FormField[]): void {
    const f = this.reduceFields<Record<string, any>>(fields);

    let startDate = String(f['startDate'] ?? '').trim();
    if (startDate.includes('T')) {
      startDate = startDate.split('T')[0];
    }

    const groupIds: string[] = Array.isArray(f['groupIds'])
      ? (f['groupIds'] as string[])
      : [];

    const matchTimesArr = Array.isArray(f['matchTimes']) ? f['matchTimes'] : [];
    const matchTimes = matchTimesArr
      .map((row: any) => String(row?.time ?? '').trim())
      .filter((v: string) => v.length > 0);

    const matchIntervalMinutes = this.numOrUndefined(f['matchIntervalMinutes']);
    const firstMatchTime =
      String(f['firstMatchTime'] ?? '').trim() || undefined;

    const dayInterval = this.numOrUndefined(f['dayInterval']) ?? 7;
    const doubleRound = String(f['doubleRound'] ?? 'false') === 'true';
    const shuffleTeams = String(f['shuffleTeams'] ?? 'true') === 'true';
    const clearExisting = String(f['clearExisting'] ?? 'true') === 'true';
    const roundInSingleDay =
      String(f['roundInSingleDay'] ?? 'false') === 'true';

    const payload = {
      startDate,
      groupIds: groupIds.length ? groupIds : undefined,
      dayInterval,
      doubleRound,
      shuffleTeams,
      clearExisting,
      roundInSingleDay,
      matchTimes: matchTimes.length ? matchTimes : undefined,
      matchIntervalMinutes: matchTimes.length
        ? undefined
        : matchIntervalMinutes,
      firstMatchTime: matchTimes.length ? undefined : firstMatchTime,
    };

    this.openGenerateFormModal = false;
    this.isLoading = true;

    this.store.tournament$.pipe(take(1)).subscribe((t) => {
      if (!t) {
        this.isLoading = false;
        return;
      }
      this.matchService
        .generateRoundRobin$(t.id, payload)
        .pipe(
          tap((res) => {
            console.log('Utworzono meczów:', res.created);
            this.store.refreshMatches();
          }),
          finalize(() => (this.isLoading = false))
        )
        .subscribe({
          error: (err) => console.error('Błąd generowania Round Robin:', err),
        });
    });
  }

  private setRepeaterSelectOptions(
    arr: FormField[],
    repeaterName: string,
    subFieldName: string,
    options: { label: string; value: string }[]
  ) {
    const i = arr.findIndex(
      (f) => f.name === repeaterName && f.type === 'repeater'
    );
    if (i < 0) return;
    const rep = arr[i] as RepeaterFormField;
    rep.fields = rep.fields.map((f) =>
      f.type === 'select' && f.name === subFieldName
        ? { ...(f as SelectFormField), options }
        : f
    );
  }

  onGenerateFormChanged(val: Record<string, any>) {
    const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

    const fields = this.generateFormFields;
    const get = (name: string) => fields.find((f) => f.name === name);
    const set = (name: string, patch: Partial<FormField>) =>
      this.setField(fields, name, patch);

    const timesRaw: Array<{ time?: string }> = Array.isArray(val['matchTimes'])
      ? val['matchTimes']
      : [];
    const cleanedTimes = Array.from(
      new Set(
        timesRaw
          .map((r) => String(r?.time ?? '').trim())
          .filter((t) => t.length > 0 && HHMM.test(t))
      )
    ).sort((a, b) => a.localeCompare(b));

    const mt = get('matchTimes');
    if (
      mt &&
      JSON.stringify(mt.value?.map((x: any) => x.time)) !==
        JSON.stringify(cleanedTimes)
    ) {
      set('matchTimes', { value: cleanedTimes.map((t) => ({ time: t })) });
    }

    const hasTimes = cleanedTimes.length > 0;

    if (hasTimes) {
      set('matchIntervalMinutes', { value: '' });
      set('firstMatchTime', { value: '' });
    } else {
      const first = String(val['firstMatchTime'] ?? '').trim();
      if (!first || !HHMM.test(first)) {
        set('firstMatchTime', { value: '10:00' });
      }

      const mim = Number(val['matchIntervalMinutes']);
      if (!Number.isFinite(mim) || mim < 1) {
        set('matchIntervalMinutes', { value: 120 });
      } else {
        set('matchIntervalMinutes', { value: Math.floor(mim) });
      }
    }

    const dayIntRaw = Number(val['dayInterval']);
    if (!Number.isFinite(dayIntRaw) || dayIntRaw < 1) {
      set('dayInterval', { value: 1 });
    } else if (!Number.isInteger(dayIntRaw)) {
      set('dayInterval', { value: Math.floor(dayIntRaw) });
    }
  }

  private reduceFields<
    T extends Record<string, unknown> = Record<string, unknown>
  >(fields: FormField[]): T {
    return fields.reduce((acc, f) => {
      (acc as any)[f.name] = f.value as unknown;
      return acc;
    }, {} as T);
  }

  private toIsoFromLocal(local: string): string {
    const d = new Date(local);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }

  private toLocalDatetimeInput(iso?: string | null): string {
    if (!iso) {
      return '';
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private numOrUndefined(v: any): number | undefined {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  private fieldValue(fields: FormField[], name: string): any {
    return fields.find((f) => f.name === name)?.value;
  }

  private setField(arr: FormField[], name: string, patch: Partial<FormField>) {
    const i = arr.findIndex((f) => f.name === name);
    if (i >= 0) arr[i] = { ...(arr[i] as any), ...(patch as any) } as FormField;
  }

  private setSelectOptions(
    arr: FormField[],
    fieldName: string,
    options: { label: string; value: string }[]
  ) {
    const i = arr.findIndex((f) => f.name === fieldName && f.type === 'select');
    if (i < 0) return;
    const sf = arr[i] as SelectFormField;
    sf.options = options;
  }

  private toYyyyMmDd(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private yesNoOptions = [
    {
      label:
        this.moduleStrings.generateRoundRobinFieldsFormLabels.yesNoOptions.yes,
      value: 'true',
    },
    {
      label:
        this.moduleStrings.generateRoundRobinFieldsFormLabels.yesNoOptions.no,
      value: 'false',
    },
  ];

  private getCreateMatchFields(
    t: Tournament | null | undefined,
    stageOptions: { label: string; value: string }[],
    groupOptions: { label: string; value: string }[],
    teamOptions: { label: string; value: string }[],
    playerOptions: { label: string; value: string }[]
  ): FormField[] {
    const defaultStageId = String(
      t?.stages.find((s) => s.kind === 'GROUP')?.id ?? t?.stages[0]?.id ?? ''
    );

    return [
      {
        name: 'stageId',
        label: this.moduleStrings.createeditMatchFieldsLabels.stage,
        type: 'select',
        required: true,
        options: stageOptions,
        value: defaultStageId,
      },
      {
        name: 'groupId',
        label: this.moduleStrings.createeditMatchFieldsLabels.group,
        type: 'select',
        options: [
          { label: this.moduleStrings.common.noneOption, value: '' },
          ...groupOptions,
        ],
        value: '',
      },
      {
        name: 'round',
        label: this.moduleStrings.createeditMatchFieldsLabels.round,
        type: 'number',
        min: 1,
        step: 1,
        value: '',
      },
      {
        name: 'index',
        label: this.moduleStrings.createeditMatchFieldsLabels.index,
        type: 'number',
        min: 1,
        step: 1,
        value: '',
      },
      {
        name: 'date',
        label: this.moduleStrings.createeditMatchFieldsLabels.date,
        type: 'datetime',
        required: true,
        value: this.toLocalDatetimeInput(new Date().toISOString()),
      },
      {
        name: 'status',
        label: this.moduleStrings.createeditMatchFieldsLabels.status,
        type: 'select',
        options: [
          {
            label:
              this.moduleStrings.createeditMatchFieldsLabels.statusOptions
                .SCHEDULED,
            value: 'SCHEDULED',
          },
          {
            label:
              this.moduleStrings.createeditMatchFieldsLabels.statusOptions.LIVE,
            value: 'LIVE',
          },
          {
            label:
              this.moduleStrings.createeditMatchFieldsLabels.statusOptions
                .FINISHED,
            value: 'FINISHED',
          },
        ],
        value: 'SCHEDULED',
      },
      {
        name: 'homeTeamId',
        label: this.moduleStrings.createeditMatchFieldsLabels.homeTeam,
        type: 'select',
        options: [
          { label: this.moduleStrings.common.noneOption, value: '' },
          ...teamOptions,
        ],
        value: '',
      },
      {
        name: 'awayTeamId',
        label: this.moduleStrings.createeditMatchFieldsLabels.awayTeam,
        type: 'select',
        options: [
          { label: this.moduleStrings.common.noneOption, value: '' },
          ...teamOptions,
        ],
        value: '',
      },
      {
        name: 'scoreHome',
        label: this.moduleStrings.createeditMatchFieldsLabels.scoreHome,
        type: 'number',
        min: 0,
        step: 1,
        value: '',
      },
      {
        name: 'scoreAway',
        label: this.moduleStrings.createeditMatchFieldsLabels.scoreAway,
        type: 'number',
        min: 0,
        step: 1,
        value: '',
      },
      {
        name: 'homeGKIds',
        label: this.moduleStrings.createeditMatchFieldsLabels.homeGKIds,
        type: 'select',
        multiple: true,
        options: [],
        value: [],
      },
      {
        name: 'awayGKIds',
        label: this.moduleStrings.createeditMatchFieldsLabels.awayGKIds,
        type: 'select',
        multiple: true,
        options: [],
        value: [],
      },
      this.eventsRepeater(
        'events',
        [],
        [],
        playerOptions,
        this.moduleStrings.matchEvents
      ),
    ];
  }

  private getEditMatchFields(
    t: Tournament | null | undefined,
    m: Match,
    stageOptions: { label: string; value: string }[],
    groupOptions: { label: string; value: string }[],
    teamOptions: { label: string; value: string }[],
    playerOptions: { label: string; value: string }[]
  ): FormField[] {
    const homeId = m.homeTeamId ? String(m.homeTeamId) : '';
    const awayId = m.awayTeamId ? String(m.awayTeamId) : '';

    const teamOptionsForEvents = [
      ...(homeId
        ? [
            {
              label: this.latestTeamMap.get(homeId)?.name ?? homeId,
              value: homeId,
            },
          ]
        : []),
      ...(awayId
        ? [
            {
              label: this.latestTeamMap.get(awayId)?.name ?? awayId,
              value: awayId,
            },
          ]
        : []),
    ];

    const playerOptionsAll = Array.from(this.latestPlayerMap.values()).map(
      (p) => ({ label: p.name, value: String(p.id) })
    );

    const existingEvents = (m.events ?? []).map((e: any) => ({
      id: String(e.id ?? ''),
      minute: e.minute ?? 0,
      type: String(e.type ?? 'GOAL'),
      playerId: String(e.playerId ?? ''),
      teamId: String(e.teamId ?? ''),
      card: String(e.card ?? ''),
    }));

    return [
      {
        name: 'stageId',
        label: this.moduleStrings.createeditMatchFieldsLabels.stage,
        type: 'select',
        options: stageOptions,
        value: String(m.stageId ?? ''),
      },
      {
        name: 'groupId',
        label: this.moduleStrings.createeditMatchFieldsLabels.group,
        type: 'select',
        options: [{ label: '— brak —', value: '' }, ...groupOptions],
        value: String(m.groupId ?? ''),
      },
      {
        name: 'round',
        label: this.moduleStrings.createeditMatchFieldsLabels.round,
        type: 'number',
        min: 1,
        step: 1,
        value: m.round ?? '',
      },
      {
        name: 'index',
        label: this.moduleStrings.createeditMatchFieldsLabels.index,
        type: 'number',
        min: 1,
        step: 1,
        value: m.index ?? '',
      },
      {
        name: 'date',
        label: this.moduleStrings.createeditMatchFieldsLabels.date,
        type: 'datetime',
        value: this.toLocalDatetimeInput(m.date),
      },
      {
        name: 'status',
        label: this.moduleStrings.createeditMatchFieldsLabels.status,
        type: 'select',
        options: [
          {
            label:
              this.moduleStrings.createeditMatchFieldsLabels.statusOptions
                .SCHEDULED,
            value: 'SCHEDULED',
          },
          {
            label:
              this.moduleStrings.createeditMatchFieldsLabels.statusOptions.LIVE,
            value: 'LIVE',
          },
          {
            label:
              this.moduleStrings.createeditMatchFieldsLabels.statusOptions
                .FINISHED,
            value: 'FINISHED',
          },
        ],
        value: String(m.status),
      },
      {
        name: 'homeTeamId',
        label: this.moduleStrings.createeditMatchFieldsLabels.homeTeam,
        type: 'select',
        options: [
          { label: this.moduleStrings.common.noneOption, value: '' },
          ...teamOptions,
        ],
        value: homeId,
      },
      {
        name: 'awayTeamId',
        label: this.moduleStrings.createeditMatchFieldsLabels.awayTeam,
        type: 'select',
        options: [
          { label: this.moduleStrings.common.noneOption, value: '' },
          ...teamOptions,
        ],
        value: awayId,
      },

      {
        name: 'scoreHome',
        label: this.moduleStrings.createeditMatchFieldsLabels.scoreHome,
        type: 'number',
        min: 0,
        step: 1,
        value: m.score?.home ?? '',
      },
      {
        name: 'scoreAway',
        label: this.moduleStrings.createeditMatchFieldsLabels.scoreAway,
        type: 'number',
        min: 0,
        step: 1,
        value: m.score?.away ?? '',
      },

      {
        name: 'homeGKIds',
        label: this.moduleStrings.createeditMatchFieldsLabels.homeGKIds,
        type: 'select',
        multiple: true,
        options: this.gkOptionsForTeam(homeId),
        value: (m.lineups?.homeGKIds ?? []).map(String),
      },
      {
        name: 'awayGKIds',
        label: this.moduleStrings.createeditMatchFieldsLabels.awayGKIds,
        type: 'select',
        multiple: true,
        options: this.gkOptionsForTeam(awayId),
        value: (m.lineups?.awayGKIds ?? []).map(String),
      },
      this.eventsRepeater(
        'events',
        existingEvents,
        teamOptionsForEvents,
        playerOptionsAll,
        this.moduleStrings.matchEvents
      ),
    ];
  }

  private eventsRepeater(
    name: string,
    value: any[],
    teamOptions: { label: string; value: string }[],
    playerOptions: { label: string; value: string }[],
    label: string
  ): FormField {
    const fields: FormField[] = [
      {
        name: 'id',
        label: this.moduleStrings.matchEventsFormLabels.id,
        type: 'hidden',
        value: '',
      },
      {
        name: 'minute',
        label: this.moduleStrings.matchEventsFormLabels.minute,
        type: 'number',
        min: 0,
        step: 1,
        value: 0,
      },
      {
        name: 'type',
        label: this.moduleStrings.matchEventsFormLabels.type,
        type: 'select',
        required: true,
        options: [
          {
            label: this.moduleStrings.matchEventsFormLabels.typeOptions.GOAL,
            value: 'GOAL',
          },
          {
            label: this.moduleStrings.matchEventsFormLabels.typeOptions.ASSIST,
            value: 'ASSIST',
          },
          {
            label:
              this.moduleStrings.matchEventsFormLabels.typeOptions.OWN_GOAL,
            value: 'OWN_GOAL',
          },
          {
            label: this.moduleStrings.matchEventsFormLabels.typeOptions.CARD,
            value: 'CARD',
          },
        ],
        value: 'GOAL',
      },
      {
        name: 'teamId',
        label: this.moduleStrings.matchEventsFormLabels.teamId,
        type: 'select',
        required: true,
        options: teamOptions,
        value: '',
      },
      {
        name: 'playerId',
        label: this.moduleStrings.matchEventsFormLabels.playerId,
        type: 'select',
        required: true,
        options: playerOptions,
        value: '',
      },
      {
        name: 'card',
        label: this.moduleStrings.matchEventsFormLabels.card,
        type: 'select',
        options: [
          {
            label: this.moduleStrings.matchEventsFormLabels.cardOptions.YELLOW,
            value: 'YELLOW',
          },
          {
            label: this.moduleStrings.matchEventsFormLabels.cardOptions.RED,
            value: 'RED',
          },
          {
            label:
              this.moduleStrings.matchEventsFormLabels.cardOptions
                .SECOND_YELLOW,
            value: 'SECOND_YELLOW',
          },
        ],
        value: '',
      },
    ];

    return {
      name,
      label,
      type: 'repeater',
      itemLabel: this.moduleStrings.matchEventsFormLabels.event,
      addLabel: this.moduleStrings.matchEventsFormLabels.addEvent,
      removeLabel: this.moduleStrings.matchEventsFormLabels.removeEvent,
      fields,
      value: value ?? [],
      totalSpan: 12,
      actualSpan: 12,
    } as FormField;
  }

  private getGenerateRoundRobinFields(
    t: Tournament | null | undefined,
    groupOptions: { label: string; value: string }[]
  ): FormField[] {
    const start =
      (t?.startDate && t.startDate.slice(0, 10)) || this.toYyyyMmDd(new Date());

    return [
      {
        name: 'groupIds',
        label: this.moduleStrings.generateRoundRobinFieldsFormLabels.groupIds,
        type: 'select',
        multiple: true,
        options: groupOptions,
        value: groupOptions.map((o) => o.value),
      },
      {
        name: 'startDate',
        label: this.moduleStrings.generateRoundRobinFieldsFormLabels.startDate,
        type: 'date',
        required: true,
        value: start,
      },
      {
        name: 'matchTimes',
        label:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.matchTimes
            .label,
        type: 'repeater',
        itemLabel:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.matchTimes.hour,
        addLabel:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.matchTimes
            .addHour,
        removeLabel:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.matchTimes
            .remove,
        totalSpan: 12,
        actualSpan: 12,
        fields: [
          {
            name: 'time',
            label:
              this.moduleStrings.generateRoundRobinFieldsFormLabels.matchTimes
                .fieldTime,
            type: 'text',
            value: '18:00',
          },
        ],
        value: [{ time: '14:00' }, { time: '16:00' }, { time: '18:00' }],
      },
      {
        name: 'matchIntervalMinutes',
        label:
          this.moduleStrings.generateRoundRobinFieldsFormLabels
            .matchIntervalMinutes,
        type: 'number',
        min: 0,
        step: 1,
        value: '',
      },
      {
        name: 'firstMatchTime',
        label:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.firstMatchTime,
        type: 'text',
        value: '10:00',
      },

      {
        name: 'dayInterval',
        label:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.dayInterval,
        type: 'number',
        min: 0,
        step: 1,
        value: 7,
      },
      {
        name: 'roundInSingleDay',
        label:
          this.moduleStrings.generateRoundRobinFieldsFormLabels
            .roundInSingleDay,
        type: 'select',
        options: this.yesNoOptions,
        value: 'false',
      },
      {
        name: 'doubleRound',
        label:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.doubleRound,
        type: 'select',
        options: this.yesNoOptions,
        value: 'false',
      },
      {
        name: 'shuffleTeams',
        label:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.shuffleTeams,
        type: 'select',
        options: this.yesNoOptions,
        value: 'true',
      },
      {
        name: 'clearExisting',
        label:
          this.moduleStrings.generateRoundRobinFieldsFormLabels.clearExisting,
        type: 'select',
        options: this.yesNoOptions,
        value: 'true',
      },
    ];
  }

  openDetails(match: Match): void {
    this.selectedMatch = match;
  }

  closeDetails(): void {
    this.selectedMatch = null;
  }

  trackByDate = (_: number, d: CalendarDay) => d.date;
}
