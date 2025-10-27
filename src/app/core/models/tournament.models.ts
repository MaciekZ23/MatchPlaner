import {
  TournamentMode,
  StageKind,
  MatchStatus,
  Position,
  HealthStatus,
  MatchEventType,
  CardKind,
  SlotSource,
} from '../types';

export interface Tournament {
  id: string;
  name: string;
  mode: TournamentMode;
  description?: string; // dłuższy opis turnieju/ligi
  additionalInfo?: string; // informacje dodatkowe dla widzów/uczestników
  season?: string; // np. "2025/26" albo "Edycja 2026"
  startDate?: string; // ISO: "2025-08-01"
  endDate?: string; // ISO: "2025-12-15"
  timezone?: string;
  venue?: string; // nazwa obiektu (np. "Arena Toruń")
  venueAddress?: string; // adres (np. "ul. Bema 73/89, 87-100 Toruń")
  venueImageUrl?: string; // zdjęcie obiektu
  groups: Group[];
  stages: Stage[];
}

export interface Group {
  id: string;
  name: string;
}

export interface Stage {
  id: string;
  name: string;
  kind: StageKind;
  order: number;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  groupId?: string | null;
  playerIds: string[];
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  position: Position;
  shirtNumber?: number;
  healthStatus: HealthStatus;
}

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  playerId: string;
  teamId: string;
  card?: CardKind;
}

export interface Match {
  id: string;
  stageId: string;
  groupId?: string | null;
  round?: number | null;
  index?: number | null;
  date: string;
  status: MatchStatus;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeSourceKind: SlotSource | null;
  homeSourceRef: string | null;
  awaySourceKind: SlotSource | null;
  awaySourceRef: string | null;
  score?: { home: number; away: number };
  events?: MatchEvent[];
  lineups?: {
    homeGKIds?: string[];
    awayGKIds?: string[];
  };
}

export interface CreateGroupPayload {
  name: string;
}

export interface CreateStagePayload {
  name: string;
  kind: StageKind;
  order: number;
}

export interface CreateTournamentPayload {
  name: string;
  mode: TournamentMode;
  description?: string | null;
  additionalInfo?: string | null;
  season?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  timezone?: string | null;
  venue?: string | null;
  venueAddress?: string | null;
  venueImageUrl?: string | null;
  groups?: CreateGroupPayload[];
  stages?: CreateStagePayload[];
}

export interface UpdateTournamentPayload {
  name?: string;
  mode?: TournamentMode;
  description?: string | null;
  additionalInfo?: string | null;
  season?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  timezone?: string | null;
  venue?: string | null;
  venueAddress?: string | null;
  venueImageUrl?: string | null;
  groupsAppend?: CreateGroupPayload[];
  groupsDelete?: string[];
  groupsUpdate?: Array<{ id: string; name?: string }>;
  stagesAppend?: CreateStagePayload[];
  stagesDelete?: string[];
  stagesUpdate?: Array<{ id: string; name?: string; order?: number }>;
}

export interface MatchEventInput {
  minute: number;
  type: MatchEventType;
  playerId: string;
  teamId: string;
  card?: CardKind;
}

export interface MatchEventUpdateInput {
  id: string;
  minute?: number;
  type?: MatchEventType;
  playerId?: string;
  teamId?: string;
  card?: CardKind | null;
}

export interface CreateMatchPayload {
  stageId: string;
  groupId?: string;
  round?: number;
  index?: number;
  date: string;
  status?: MatchStatus;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  score?: { home: number; away: number };
  homeGKIds?: string[];
  awayGKIds?: string[];
  events?: MatchEventInput[];
}

export interface UpdateMatchPayload {
  stageId?: string;
  groupId?: string | null;
  round?: number | null;
  index?: number | null;
  date?: string;
  status?: MatchStatus;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  score?: { home: number | null; away: number | null } | null;
  homeGKIds?: string[] | null;
  awayGKIds?: string[] | null;
  eventsUpdate?: MatchEventUpdateInput[];
  eventsAppend?: MatchEventInput[];
  eventsDelete?: string[];
}

export interface GenerateRoundRobinPayload {
  startDate: string; // 'YYYY-MM-DD'
  matchTimes?: string[]; // np. ['14:00','16:00','18:00']
  dayInterval?: number; // co ile dni nowa kolejka
  doubleRound?: boolean; // dwie rundy (mecz i rewanż)
  groupIds?: string[]; // które grupy generować
  clearExisting?: boolean; // wyczyść poprzednie mecze z/ dla tych grup (stage GROUP)
  shuffleTeams?: boolean; // potasuj kolejność przed Bergerem
  matchIntervalMinutes?: number; // alternatywa dla matchTimes (interwał w minutach)
  firstMatchTime?: string; // start pierwszego meczu (gdy używasz interwału)
  roundInSingleDay?: boolean; // czy cała kolejka ma się zmieścić jednego dnia
}
