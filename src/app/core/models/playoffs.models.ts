export interface GeneratePlayoffsPayload {
  stageName?: string;
  startDate: string;
  matchTimes?: string[];
  firstMatchTime?: string;
  matchIntervalMinutes?: number;
  dayInterval?: number;
  roundInSingleDay?: boolean;
  withThirdPlace?: boolean;
  clearExisting?: boolean;
}
