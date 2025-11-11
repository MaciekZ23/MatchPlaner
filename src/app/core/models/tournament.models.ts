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
  description?: string;
  additionalInfo?: string;
  season?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  venue?: string;
  venueAddress?: string;
  venueImageUrl?: string;
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
  startDate: string;
  matchTimes?: string[];
  dayInterval?: number;
  doubleRound?: boolean;
  groupIds?: string[];
  clearExisting?: boolean;
  shuffleTeams?: boolean;
  matchIntervalMinutes?: number;
  firstMatchTime?: string;
  roundInSingleDay?: boolean;
}
