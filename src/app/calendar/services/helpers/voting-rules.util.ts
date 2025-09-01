import { MatchStatus, VotingStatus } from '../../../core/types';

// Domyślna długość meczu – około 110 minut
const DEFAULT_MATCH_DURATION_MIN = 110;

// ISO końca meczu na podstawie kickoff
export function calcFinishISOFromKickoff(
  kickoffISO: string,
  matchDurationMin = DEFAULT_MATCH_DURATION_MIN
): string {
  const start = new Date(kickoffISO).getTime();
  const end = start + matchDurationMin * 60 * 1000;
  return new Date(end).toISOString();
}

// ISO zamknięcia głosowania – 2 dni po zakończeniu meczu
export function calcCloseISOFromFinish(finishISO: string, days = 2): string {
  const finish = new Date(finishISO).getTime();
  const closeAt = finish + days * 24 * 60 * 60 * 1000;
  return new Date(closeAt).toISOString();
}

// Wyliczenie aktualnego statusu głosowania dla meczu
export function statusFromMatch(
  match: { date: string; status: MatchStatus },
  nowISO = new Date().toISOString(),
  matchDurationMin = DEFAULT_MATCH_DURATION_MIN
): { status: VotingStatus; closesAtISO: string } {
  const now = new Date(nowISO).getTime();
  const kickoff = new Date(match.date).getTime();
  const finishISO = calcFinishISOFromKickoff(match.date, matchDurationMin);
  const closeISO = calcCloseISOFromFinish(finishISO, 2);
  const closeTs = new Date(closeISO).getTime();
  if (match.status === 'SCHEDULED') {
    return now < kickoff
      ? { status: 'NOT_STARTED', closesAtISO: closeISO }
      : { status: 'OPEN', closesAtISO: closeISO };
  }
  if (match.status === 'LIVE') {
    return { status: 'OPEN', closesAtISO: closeISO };
  }
  return now < closeTs
    ? { status: 'OPEN', closesAtISO: closeISO }
    : { status: 'CLOSED', closesAtISO: closeISO };
}
