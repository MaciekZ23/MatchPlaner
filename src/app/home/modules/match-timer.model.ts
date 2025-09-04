import { CountdownStatus } from '../types';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: CountdownStatus;
}
