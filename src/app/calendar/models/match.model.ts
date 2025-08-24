import { MatchDetail } from './match-detail.model';

export interface Match {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  group?: string;
  logoA?: string;
  logoB?: string;
  details: MatchDetail[];
  status?: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  kickoffISO?: string;
}
