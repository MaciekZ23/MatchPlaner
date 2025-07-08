import { MatchDetail } from "./match-detail.model";

export interface Match {
    teamA: string;
    teamB: string;
    scoreA: number;
    scoreB: number;
    group?: string;
    details: MatchDetail[];
}