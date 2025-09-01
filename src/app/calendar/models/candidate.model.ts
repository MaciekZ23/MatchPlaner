import { VotingCandidate } from '../../core/models';

export interface UiCandidate extends VotingCandidate {
  positionPl: string;
  healthPl: string;
  hasCleanSheet: boolean;
}
