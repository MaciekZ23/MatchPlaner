import { MatchDetailCard, MatchDetailEvent } from '../types';

export interface MatchDetail {
  player: string;
  time: string;
  score: string;
  scoringTeam: 'A' | 'B';
  event: MatchDetailEvent;
  card?: MatchDetailCard;
}
