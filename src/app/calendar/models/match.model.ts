import { MatchDetail } from './match-detail.model';
import { MatchId, TeamId, MatchStatus, SlotSource } from '../../core/types';
import { MatchEvent } from '../../core/models';

export interface MatchScore {
  home: number;
  away: number;
}

export interface Match {
  id: MatchId;
  stageId: string;
  groupId?: string | null;
  groupName?: string | null;
  round?: number | null;
  index?: number | null;
  date: string;
  status: MatchStatus;
  homeTeamId: TeamId | null;
  awayTeamId: TeamId | null;
  homeSourceKind: SlotSource | null;
  homeSourceRef: string | null;
  awaySourceKind: SlotSource | null;
  awaySourceRef: string | null;
  score?: MatchScore;
  events?: MatchEvent[];
  lineups?: {
    homeGKIds?: string[];
    awayGKIds?: string[];
  };

  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  logoA?: string;
  logoB?: string;
  details: MatchDetail[];
}
