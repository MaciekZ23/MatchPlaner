export interface UiVoteSummary {
  playerId: string;
  name: string;
  teamId: string;
  teamName?: string;
  votes: number;
  percent: number;
  isWinner: boolean;
}
