import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  finalize,
  forkJoin,
  map,
  Observable,
  shareReplay,
  take,
  tap,
} from 'rxjs';
import { TopScorersComponent } from './components/top-scorers/top-scorers.component';
import { GoalkeepersCleanSheetsComponent } from './components/goalkeepers-clean-sheets/goalkeepers-clean-sheets.component';
import { PointsTableComponent } from './components/points-table/points-table.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { TeamTableService } from './services/team-table.service';
import { PointsTableGroup, TablesVM } from './models';
import { stringsPlayoffsBracket, stringsTables } from './misc';
import { PlayoffsBracketComponent } from './components/playoffs-bracket/playoffs-bracket.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { VoteFacade } from '../calendar/services/vote.facade';
import { MatchService } from '../calendar/services/match.service';
import { TournamentStore } from '../core/services/tournament-store.service';
import { PlayoffsBracketService } from './services/playoffs-bracket.service';
import { stringsCalendar, stringsConfirmModal } from '../calendar/misc';
import {
  FormField,
  RepeaterFormField,
  SelectFormField,
  SelectOption,
} from '../shared/components/dynamic-form/models/form-field';
import { Match } from '../calendar/models/match.model';
import {
  Team as CoreTeam,
  Player as CorePlayer,
  MatchEventInput,
  UpdateMatchPayload,
  Tournament,
} from '../core/models';
import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';
import { MatchDetailsModalComponent } from '../calendar/components/match-details-modal/match-details-modal.component';
import { isoToLocalInput, localInputToIso } from '../core/utils';

@Component({
  selector: 'app-tables',
  imports: [
    CommonModule,
    TopScorersComponent,
    GoalkeepersCleanSheetsComponent,
    PointsTableComponent,
    PageHeaderComponent,
    PlayoffsBracketComponent,
    ConfirmModalComponent,
    DynamicFormComponent,
    MatchDetailsModalComponent,
    SpinnerComponent,
  ],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesComponent implements OnInit {
  moduleStrings = stringsTables;
  playoffsStrings = stringsPlayoffsBracket;
  confirmStrings = stringsConfirmModal;
  calendarStrings = stringsCalendar;
  viewmodel$!: Observable<TablesVM>;

  isLoading = false;
  selectedMatch: Match | null = null;

  @ViewChild('dynamicForm')
  dynamicFormComponent!: DynamicFormComponent;

  @ViewChild('deleteAllPlayoffMatches', { static: true })
  deleteAllPlayoffMatchesConfirm!: ConfirmModalComponent;

  @ViewChild('voteConfirm', { static: true })
  voteConfirmModal!: ConfirmModalComponent;

  @ViewChild('deleteMatchConfirm') deleteMatchConfirm!: ConfirmModalComponent;

  private voteFacade = inject(VoteFacade);
  private matchService = inject(MatchService);
  private store = inject(TournamentStore);
  private bracket = inject(PlayoffsBracketService);

  latestTeamMap = new Map<string, CoreTeam>();
  latestPlayerMap = new Map<string, CorePlayer>();
  readonly teamMap$ = this.store.teamMap$;
  readonly playerMap$ = this.store.playerMap$;

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

  formTitleEditMatch = this.calendarStrings.editMatch;
  openEditMatchFormModal = false;
  editMatchFormFields: FormField[] = [];
  private editingMatch: Match | null = null;

  generatePlayoffsTitle = this.playoffsStrings.generatePlayoffs;
  openGeneratePlayoffsFormModal = false;
  generatePlayoffsFields: FormField[] = [];

  constructor(private teamTable: TeamTableService) {
    this.teamMap$.subscribe((m) => (this.latestTeamMap = m));
    this.playerMap$.subscribe((m) => (this.latestPlayerMap = m));
  }

  ngOnInit(): void {
    this.viewmodel$ = this.teamTable.getTablesVM$();
  }

  trackGroup = (_: number, g: PointsTableGroup) => g.groupId;

  async onRequestVoteConfirm(e: {
    matchId: string;
    playerId: string;
    playerName?: string;
  }) {
    const playerName = e.playerName ?? e.playerId;
    const ok = await this.voteConfirmModal.open({
      title: this.confirmStrings.title,
      message: `${this.confirmStrings.message} (${playerName})`,
      labels: this.confirmStrings.labels,
      confirmVariant: 'primary',
      size: 'md',
    });
    if (!ok) return;

    this.voteFacade.voteFor(e.matchId as any, e.playerId);
  }

  async onDeleteMatch(match: Match): Promise<void> {
    const ok = await this.deleteMatchConfirm.open({
      title: this.calendarStrings.deleteMatch,
      message: `Czy na pewno chcesz usunąć mecz: ${match.teamA} – ${match.teamB}?`,
      confirmVariant: 'danger',
      labels: {
        confirm: this.calendarStrings.deleteModalLabels.confirm,
        cancel: this.calendarStrings.deleteModalLabels.cancel,
      },
    });
    if (!ok) return;

    this.isLoading = true;
    this.matchService
      .deleteMatch$(match.id)
      .pipe(
        tap(() => {
          if (match.stageId) this.store.refreshMatchesForStage(match.stageId);
          else this.store.refreshMatches();
          this.bracket.loadByTournament();
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd usuwania meczu:', err),
      });
  }

  async onDeleteAllPlayoffMatches(stageId: string): Promise<void> {
    const ok = await this.deleteAllPlayoffMatchesConfirm.open({
      title: this.playoffsStrings.deleteAllMatchesTitle,
      message: this.playoffsStrings.deleteAllMatchesMsg,
      confirmVariant: 'danger',
      labels: {
        confirm: this.playoffsStrings.deleteModalLabels?.confirm ?? 'Usuń',
        cancel: this.playoffsStrings.deleteModalLabels?.cancel ?? 'Anuluj',
      },
      size: 'md',
    });
    if (!ok) return;

    this.matchService
      .deleteAllByStage$(stageId)
      .pipe(take(1))
      .subscribe({
        next: ({ count }) => {
          this.store.refreshMatchesForStage(stageId);
          this.bracket.loadByTournament();
          console.log(`Usunięto ${count} mecz(e/y) z etapu PLAYOFF`);
        },
        error: (err) =>
          console.error('Błąd usuwania wszystkich meczów playoff:', err),
      });
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

  onEditMatchFormSubmitted(fields: FormField[]): void {
    if (!this.editingMatch) {
      this.openEditMatchFormModal = false;
      return;
    }

    const base = this.editingMatch;
    const f = this.reduceFields(fields);
    const patch: UpdateMatchPayload = {};

    const stageId = String(f['stageId'] ?? '').trim();
    if (stageId && stageId !== base.stageId) patch.stageId = stageId;

    const groupIdRaw = String(f['groupId'] ?? '').trim();
    const nextGroupId = groupIdRaw === '' ? null : groupIdRaw;

    if (nextGroupId !== base.groupId) {
      patch.groupId = nextGroupId;
    }

    const index = this.numOrUndefined(f['index']);

    if (nextGroupId === null) {
      if (index !== undefined && index >= 1) {
        patch.index = index;
      }
    } else if (nextGroupId !== base.groupId) {
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
    if (round !== undefined) patch.round = round;

    const dateLocal = String(f['date'] ?? '').trim();
    if (dateLocal) patch.date = localInputToIso(dateLocal);

    const status = String(f['status'] ?? '')
      .trim()
      .toUpperCase();
    if (status) patch.status = status as any;

    const homeTeamId = String(f['homeTeamId'] ?? '').trim();
    if (homeTeamId !== '') patch.homeTeamId = homeTeamId || null;

    const awayTeamId = String(f['awayTeamId'] ?? '').trim();
    if (awayTeamId !== '') patch.awayTeamId = awayTeamId || null;

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
    if (homeGKIds && homeGKIds.length > 0) patch.homeGKIds = homeGKIds;

    const awayGKIds = Array.isArray(f['awayGKIds'])
      ? (f['awayGKIds'] as string[])
      : undefined;
    if (awayGKIds && awayGKIds.length > 0) patch.awayGKIds = awayGKIds;

    this.isLoading = true;
    this.matchService
      .updateMatch$(base.id, patch)
      .pipe(
        tap(() => {
          this.openEditMatchFormModal = false;
          this.editMatchFormFields = [];
          const stageIdToRefresh = patch.stageId ?? base.stageId;
          if (stageIdToRefresh)
            this.store.refreshMatchesForStage(stageIdToRefresh);
          else this.store.refreshMatches();
          this.bracket.loadByTournament();
          this.editingMatch = null;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Błąd edycji meczu:', err),
      });
  }

  private gkOptionsForTeam(teamId?: string | null) {
    if (!teamId) return [];
    return Array.from(this.latestPlayerMap.values())
      .filter((p) => p.teamId === teamId && p.position === 'GK')
      .map((p) => ({ label: p.name, value: String(p.id) }));
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

  private numOrUndefined(v: any): number | undefined {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  private fieldValue(fields: FormField[], name: string): any {
    return fields.find((f) => f.name === name)?.value;
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

  private setField(arr: FormField[], name: string, patch: Partial<FormField>) {
    const i = arr.findIndex((f) => f.name === name);
    if (i >= 0) arr[i] = { ...(arr[i] as any), ...(patch as any) } as FormField;
  }

  private reduceFields<
    T extends Record<string, unknown> = Record<string, unknown>
  >(fields: FormField[]): T {
    return fields.reduce((acc, f) => {
      (acc as any)[f.name] = f.value as unknown;
      return acc;
    }, {} as T);
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
        label: this.calendarStrings.matchEventsFormLabels.id,
        type: 'hidden',
        value: '',
      },
      {
        name: 'minute',
        label: this.calendarStrings.matchEventsFormLabels.minute,
        type: 'number',
        min: 0,
        step: 1,
        value: 0,
      },
      {
        name: 'type',
        label: this.calendarStrings.matchEventsFormLabels.type,
        type: 'select',
        required: true,
        options: [
          {
            label: this.calendarStrings.matchEventsFormLabels.typeOptions.GOAL,
            value: 'GOAL',
          },
          {
            label:
              this.calendarStrings.matchEventsFormLabels.typeOptions.ASSIST,
            value: 'ASSIST',
          },
          {
            label:
              this.calendarStrings.matchEventsFormLabels.typeOptions.OWN_GOAL,
            value: 'OWN_GOAL',
          },
          {
            label: this.calendarStrings.matchEventsFormLabels.typeOptions.CARD,
            value: 'CARD',
          },
        ],
        value: 'GOAL',
      },
      {
        name: 'teamId',
        label: this.calendarStrings.matchEventsFormLabels.teamId,
        type: 'select',
        required: true,
        options: teamOptions,
        value: '',
      },
      {
        name: 'playerId',
        label: this.calendarStrings.matchEventsFormLabels.playerId,
        type: 'select',
        required: true,
        options: playerOptions,
        value: '',
      },
      {
        name: 'card',
        label: this.calendarStrings.matchEventsFormLabels.card,
        type: 'select',
        options: [
          {
            label:
              this.calendarStrings.matchEventsFormLabels.cardOptions.YELLOW,
            value: 'YELLOW',
          },
          {
            label: this.calendarStrings.matchEventsFormLabels.cardOptions.RED,
            value: 'RED',
          },
          {
            label:
              this.calendarStrings.matchEventsFormLabels.cardOptions
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
      itemLabel: this.calendarStrings.matchEventsFormLabels.event,
      addLabel: this.calendarStrings.matchEventsFormLabels.addEvent,
      removeLabel: this.calendarStrings.matchEventsFormLabels.removeEvent,
      fields,
      value: value ?? [],
      totalSpan: 12,
      actualSpan: 12,
    } as FormField;
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
        label: this.calendarStrings.createeditMatchFieldsLabels.stage,
        type: 'select',
        options: stageOptions,
        value: String(m.stageId ?? ''),
      },
      {
        name: 'groupId',
        label: this.calendarStrings.createeditMatchFieldsLabels.group,
        type: 'select',
        options: [
          { label: this.calendarStrings.common.noneOption, value: '' },
          ...groupOptions,
        ],
        value: String(m.groupId ?? ''),
      },
      {
        name: 'round',
        label: this.calendarStrings.createeditMatchFieldsLabels.round,
        type: 'number',
        min: 1,
        step: 1,
        value: m.round ?? '',
      },
      {
        name: 'index',
        label: this.calendarStrings.createeditMatchFieldsLabels.index,
        type: 'number',
        min: 1,
        step: 1,
        value: m.index ?? '',
      },
      {
        name: 'date',
        label: this.calendarStrings.createeditMatchFieldsLabels.date,
        type: 'datetime',
        value: isoToLocalInput(m.date),
      },
      {
        name: 'status',
        label: this.calendarStrings.createeditMatchFieldsLabels.status,
        type: 'select',
        options: [
          {
            label:
              this.calendarStrings.createeditMatchFieldsLabels.statusOptions
                .SCHEDULED,
            value: 'SCHEDULED',
          },
          {
            label:
              this.calendarStrings.createeditMatchFieldsLabels.statusOptions
                .LIVE,
            value: 'LIVE',
          },
          {
            label:
              this.calendarStrings.createeditMatchFieldsLabels.statusOptions
                .FINISHED,
            value: 'FINISHED',
          },
        ],
        value: String(m.status),
      },
      {
        name: 'homeTeamId',
        label: this.calendarStrings.createeditMatchFieldsLabels.homeTeam,
        type: 'select',
        options: [
          { label: this.calendarStrings.common.noneOption, value: '' },
          ...teamOptions,
        ],
        value: homeId,
      },
      {
        name: 'awayTeamId',
        label: this.calendarStrings.createeditMatchFieldsLabels.awayTeam,
        type: 'select',
        options: [
          { label: this.calendarStrings.common.noneOption, value: '' },
          ...teamOptions,
        ],
        value: awayId,
      },
      {
        name: 'scoreHome',
        label: this.calendarStrings.createeditMatchFieldsLabels.scoreHome,
        type: 'number',
        min: 0,
        step: 1,
        value: m.score?.home ?? '',
      },
      {
        name: 'scoreAway',
        label: this.calendarStrings.createeditMatchFieldsLabels.scoreAway,
        type: 'number',
        min: 0,
        step: 1,
        value: m.score?.away ?? '',
      },
      {
        name: 'homeGKIds',
        label: this.calendarStrings.createeditMatchFieldsLabels.homeGKIds,
        type: 'select',
        multiple: true,
        options: this.gkOptionsForTeam(homeId),
        value: (m.lineups?.homeGKIds ?? []).map(String),
      },
      {
        name: 'awayGKIds',
        label: this.calendarStrings.createeditMatchFieldsLabels.awayGKIds,
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
        this.calendarStrings.matchEvents
      ),
    ];
  }

  onOpenGeneratePlayoffs(): void {
    const toYyyyMmDd = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const start = toYyyyMmDd(new Date());
    const yesNoOptions = [
      { label: this.playoffsStrings.form!.yesNoOptions.yes, value: 'true' },
      { label: this.playoffsStrings.form!.yesNoOptions.no, value: 'false' },
    ];

    this.generatePlayoffsTitle =
      this.playoffsStrings.form?.title ?? this.playoffsStrings.generatePlayoffs;

    this.generatePlayoffsFields = [
      {
        name: 'stageName',
        label: this.playoffsStrings.form?.stageName,
        type: 'text',
        required: false,
        placeholder: 'Wpisz nazwę etapu',
        value: '',
      },
      {
        name: 'startDate',
        label: this.playoffsStrings.form?.startDate,
        type: 'date',
        required: true,
        value: start,
      },
      {
        name: 'firstMatchTime',
        label: this.playoffsStrings.form?.firstMatchTime,
        type: 'text',
        required: false,
        value: '',
        placeholder: 'Wpisz godzinę w formacie HH:MM',
      },
      {
        name: 'matchIntervalMinutes',
        label: this.playoffsStrings.form?.matchIntervalMinutes,
        type: 'number',
        required: false,
        min: 0,
        step: 1,
        value: '',
        placeholder: 'Wpisz liczbę minut',
      },
      {
        name: 'matchTimes',
        label: this.playoffsStrings.form?.matchTimes.label,
        type: 'repeater',
        required: false,
        itemLabel: this.playoffsStrings.form?.matchTimes.hour,
        addLabel: this.playoffsStrings.form?.matchTimes.addHour,
        removeLabel: this.playoffsStrings.form?.matchTimes.remove,
        totalSpan: 12,
        actualSpan: 12,
        fields: [
          {
            name: 'time',
            label: this.playoffsStrings.form?.matchTimes.fieldTime,
            type: 'text',
            required: false,
            placeholder: 'Wpisz godzinę w formacie HH:MM',
            value: '',
          },
        ],
        value: [],
      },
      {
        name: 'roundInSingleDay',
        label: this.playoffsStrings.form?.roundInSingleDay,
        type: 'select',
        required: true,
        options: yesNoOptions,
        value: 'true',
      },
      {
        name: 'dayInterval',
        label: this.playoffsStrings.form?.dayInterval,
        type: 'number',
        required: false,
        min: 1,
        step: 1,
        value: '',
        disabled: true,
        placeholder: '0',
      },
      {
        name: 'withThirdPlace',
        label: this.playoffsStrings.form?.withThirdPlace,
        type: 'select',
        required: false,
        options: yesNoOptions,
        value: 'true',
      },
      {
        name: 'clearExisting',
        label: this.playoffsStrings.form?.clearExisting,
        type: 'select',
        required: false,
        options: yesNoOptions,
        value: 'true',
      },
    ];

    this.openGeneratePlayoffsFormModal = true;
  }

  onGeneratePlayoffsFormChanged(val: Record<string, any>) {
    const form = this.dynamicFormComponent?.form;
    if (!form) return;

    const dayControl = form.get('dayInterval');
    const intervalControl = form.get('matchIntervalMinutes');

    if (String(val['roundInSingleDay']) === 'true') {
      dayControl?.disable({ emitEvent: false });
      dayControl?.setValue(null, { emitEvent: false });
    } else {
      dayControl?.enable({ emitEvent: false });
      const di = Number(val['dayInterval']);
      if (Number.isFinite(di) && di < 1) {
        dayControl?.setValue(1, { emitEvent: false });
      }
    }

    const mim = Number(val['matchIntervalMinutes']);
    if (
      val['matchIntervalMinutes'] !== '' &&
      Number.isFinite(mim) &&
      mim >= 1 &&
      !Number.isInteger(mim)
    ) {
      intervalControl?.setValue(Math.floor(mim), { emitEvent: false });
    }
  }

  onGeneratePlayoffsFormSubmitted(fields: FormField[]): void {
    const f = this.reduceFields<Record<string, any>>(fields);

    const matchTimes = Array.isArray(f['matchTimes'])
      ? (f['matchTimes'] as Array<{ time?: string }>)
          .map((x) => String(x?.time || '').trim())
          .filter(Boolean)
      : [];

    const payload = {
      stageName: String(f['stageName'] ?? '').trim() || undefined,
      startDate: String(f['startDate'] ?? '').trim(),

      ...(matchTimes.length > 0 ? { matchTimes } : {}),

      ...(matchTimes.length === 0
        ? {
            firstMatchTime: String(f['firstMatchTime'] ?? '').trim() || '10:00',
            matchIntervalMinutes: Number(f['matchIntervalMinutes'] ?? 120),
          }
        : {}),

      roundInSingleDay: String(f['roundInSingleDay'] ?? 'true') === 'true',

      ...(String(f['roundInSingleDay']) === 'true'
        ? {}
        : {
            dayInterval:
              Number(f['dayInterval']) > 0 ? Number(f['dayInterval']) : 1,
          }),
      withThirdPlace: String(f['withThirdPlace'] ?? 'true') === 'true',
      clearExisting: String(f['clearExisting'] ?? 'false') === 'true',
    };

    this.openGeneratePlayoffsFormModal = false;
    this.isLoading = true;

    this.bracket.generateForCurrentTournament(payload);
    this.bracket.generating$.pipe(take(1)).subscribe(() => {
      this.isLoading = false;
    });
  }

  onGeneratePlayoffsRequested() {
    this.onOpenGeneratePlayoffs();
  }

  openDetails(match: Match) {
    this.selectedMatch = match;
  }

  closeDetails() {
    this.selectedMatch = null;
  }
}
