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
  teamIds: string[];
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
  id: string;
  name: string;
  teamIds: string[];
}

export interface CreateStagePayload {
  id: string;
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
  groups?: CreateGroupPayload[];
  stages?: CreateStagePayload[];
}
