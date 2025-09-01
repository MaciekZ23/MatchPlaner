import { MatchDetail } from './match-detail.model';
import { MatchId, TeamId, MatchStatus } from '../../core/types';

export interface Match {
  id: MatchId;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  logoA?: string;
  logoB?: string;
  group?: string;
  details: MatchDetail[];
  status: MatchStatus;
  date: string;
}
