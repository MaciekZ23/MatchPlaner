export type TournamentMode = 'LEAGUE' | 'KNOCKOUT' | 'LEAGUE_PLAYOFFS';
export type StageKind = 'GROUP' | 'PLAYOFF';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';
export type SlotSource = 'TEAM' | 'WINNER' | 'LOSER';

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type HealthStatus = 'HEALTHY' | 'INJURED';
export type MatchEventType = 'GOAL' | 'ASSIST' | 'OWN_GOAL' | 'CARD';
export type CardKind = 'YELLOW' | 'RED' | 'SECOND_YELLOW';
export type CreateTeamPayload = { name: string; logo?: string };
export interface CreatePlayerPayload {
  name: string;
  position: Position;
  shirtNumber?: number;
  healthStatus: HealthStatus;
}
export type UpdateTeamPayload = Partial<CreateTeamPayload>;
export type UpdatePlayerPayload = Partial<CreatePlayerPayload>;
export type UserRole = 'ADMIN' | 'USER' | 'GUEST' | 'NONE';
