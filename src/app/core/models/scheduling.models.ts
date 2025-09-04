export interface RoundRobinRound {
  round: number;
  pairs: [string, string][];
}

export interface ScheduleOptions {
  startDateISO: string;
  intervalDays?: number;
  kickoffTimes?: string[];
  idPrefix?: string;
}
