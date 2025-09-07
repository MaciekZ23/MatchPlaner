import { TournamentMode } from '../types';
import { PointsTableGroup } from './team-table.model';

export interface TablesVM {
  mode: TournamentMode;
  groups: PointsTableGroup[];
  playoffStageId: string | null;
}
