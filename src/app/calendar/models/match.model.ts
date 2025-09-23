import { MatchDetail } from './match-detail.model';
import { MatchId, TeamId, MatchStatus } from '../../core/types';

export interface Match {
  id: MatchId;
  homeTeamId: TeamId | null;
  awayTeamId: TeamId | null;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  logoA?: string;
  logoB?: string;
  group?: string | null;
  details: MatchDetail[];
  status: MatchStatus;
  date: string;
  lineups?: {
    homeGKIds?: string[];
    awayGKIds?: string[];
  };
}
