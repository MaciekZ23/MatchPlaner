import {
  TournamentMode,
  StageKind,
  MatchStatus,
  Position,
  HealthStatus,
  MatchEventType,
} from '../types';

export interface Tournament {
  id: string;
  name: string;
  mode: TournamentMode;
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
  shirtNumber: number;
  healthStatus: HealthStatus;
}

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  playerId: string;
  teamId: string;
}

export interface Match {
  id: string;
  stageId: string;
  groupId?: string;
  round?: number;
  date: string;
  status: MatchStatus;
  homeTeamId: string;
  awayTeamId: string;
  score?: { home: number; away: number };
  events?: MatchEvent[];
}
