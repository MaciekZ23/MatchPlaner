import {
  MatchEventType,
  CardKind,
  TeamId,
  MatchStatus,
} from '../../core/types';

export interface VotingSeedInput {
  matchId: string;
  date: string;
  status: MatchStatus;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  events: Array<{
    playerId: string;
    type: MatchEventType;
    card?: CardKind;
  }>;
}
