export interface GeneratePlayoffsPayload {
  startDateISO: string;
  matchDurationMin: number;
  gapBetweenMatchesMin: number;
  matchesPerDay: number;
  withThirdPlace: boolean;
  stageName?: string;
}
