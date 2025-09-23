export type TournamentMode = 'LEAGUE' | 'KNOCKOUT' | 'LEAGUE_PLAYOFFS';
export type StageKind = 'GROUP' | 'PLAYOFF';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';
export type SlotSource = 'TEAM' | 'WINNER' | 'LOSER';

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type HealthStatus = 'HEALTHY' | 'INJURED';
export type MatchEventType = 'GOAL' | 'ASSIST' | 'OWN_GOAL' | 'CARD';
export type CardKind = 'YELLOW' | 'RED' | 'SECOND_YELLOW';
