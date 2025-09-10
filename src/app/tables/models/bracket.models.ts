import { SlotType } from '../types';

export interface BracketTeamSlot {
  type: SlotType;
  ref?: string;
  teamId?: string;
}

export interface BracketMatch {
  id: string;
  stageId: string;
  round: number;
  index: number;
  home: BracketTeamSlot;
  away: BracketTeamSlot;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  score?: { home: number; away: number };
  date: string;
  parentMatchId?: string;
}
