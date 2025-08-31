import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../models/match.model';
import { stringsMatchDetails } from '../../misc';
import { MatchDetailsActiveTab } from '../../../core/types';
import { VotingState, VotingCandidate } from '../../../core/models';
import { VoteService } from '../../services/vote.service';

declare const bootstrap: any;

@Component({
  selector: 'app-match-details-modal',
  imports: [CommonModule],
  templateUrl: './match-details-modal.component.html',
  styleUrl: './match-details-modal.component.scss',
  standalone: true,
})
export class MatchDetailsModalComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() match: Match | null = null;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalRef', { static: true })
  modalRef!: ElementRef<HTMLDivElement>;

  moduleStrings = stringsMatchDetails;
  private modalInstance: any;

  activeTab: MatchDetailsActiveTab = 'DETAILS';
  voting: VotingState | null = null;
  selectedPlayerId: string | null = null;
  candidateById: Record<string, VotingCandidate> = {};

  private vote = inject(VoteService);

  ngAfterViewInit(): void {
    this.modalInstance = bootstrap.Modal.getOrCreateInstance(
      this.modalRef.nativeElement,
      {
        backdrop: 'static',
        keyboard: false,
        focus: true,
      }
    );

    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.close.emit();
    });

    // Jeśli @Input(match) już był ustawiony przez AfterViewInit
    if (this.match) {
      this.modalInstance.show();
      this.bootstrapVotingState();
      this.activeTab = 'DETAILS';
      this.selectedPlayerId = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match']) {
      if (this.match) {
        if (this.modalInstance) {
          this.modalInstance.show();
        }
        this.activeTab = 'DETAILS';
        this.selectedPlayerId = null;
        this.bootstrapVotingState();
      } else {
        if (this.modalInstance) this.modalInstance.hide();
        this.voting = null;
        this.selectedPlayerId = null;
        this.candidateById = {};
      }
    }
  }

  ngOnDestroy(): void {
    try {
      this.modalInstance?.dispose?.();
    } catch {}
  }

  onRequestClose(): void {
    this.modalInstance?.hide();
  }

  onClose() {
    this.close.emit();
  }

  switchTab(tab: MatchDetailsActiveTab) {
    this.activeTab = tab;
    if (tab === 'MVP' && !this.voting) {
      this.bootstrapVotingState();
    }
  }

  onToggleCandidate(playerId: string) {
    this.selectedPlayerId =
      this.selectedPlayerId === playerId ? null : playerId;
  }

  onVoteConfirm() {
    if (!this.match || !this.voting || !this.selectedPlayerId) {
      return;
    }
    if (this.voting.status !== 'OPEN' || this.voting.hasVoted) {
      return;
    }

    const candidate =
      this.voting.candidates.find((c) => c.playerId === this.selectedPlayerId)
        ?.name ?? '';

    const ok = window.confirm(`Głosujesz na: ${candidate}. Potwierdzasz?`);
    if (!ok) {
      return;
    }

    const matchId = this.computeMatchId(this.match);
    this.voting = this.vote.vote(matchId, this.selectedPlayerId);
    this.rebuildCandidateIndex();
  }

  get teamAScorers() {
    return this.match?.details.filter((d) => d.scoringTeam === 'A') ?? [];
  }

  get teamBScorers() {
    return this.match?.details.filter((d) => d.scoringTeam === 'B') ?? [];
  }

  get isFinished(): boolean {
    return this.match?.status === 'FINISHED';
  }

  get goalsA(): number {
    return this.teamAScorers.length;
  }

  get goalsB(): number {
    return this.teamBScorers.length;
  }

  get showScore(): boolean {
    if (!this.match) return false;
    return this.isFinished || this.goalsA + this.goalsB > 0;
  }

  get scoreText(): string {
    if (!this.match) return '';
    if (this.isFinished) return `${this.match.scoreA} - ${this.match.scoreB}`;
    return `${this.goalsA} - ${this.goalsB}`;
  }

  private rebuildCandidateIndex(): void {
    this.candidateById = Object.fromEntries(
      (this.voting?.candidates ?? []).map((c) => [c.playerId, c] as const)
    );
  }

  private bootstrapVotingState() {
    if (!this.match) {
      this.voting = null;
      return;
    }

    const matchId = this.computeMatchId(this.match);
    const status = this.isFinished ? 'OPEN' : 'NOT_STARTED';
    const candidates = this.buildCandidatesFromMatch(this.match);
    this.voting = this.vote.getState(matchId, {
      matchId,
      status,
      candidates,
      summary: [],
    });
    this.rebuildCandidateIndex();
  }

  private computeMatchId(m: Match): string {
    return `${m.teamA}|${m.teamB}|${m.kickoffISO ?? ''}`;
  }

  private buildCandidatesFromMatch(m: Match): VotingCandidate[] {
    type Tmp = {
      name: string;
      teamCode: 'A' | 'B';
      goals?: number;
      assists?: number;
      yellow?: number;
      red?: number;
      ownGoals?: number;
    };

    const tmp = new Map<string, Tmp>();

    for (const d of m.details ?? []) {
      const key = `${d.player}|${d.scoringTeam}`;
      if (!tmp.has(key)) {
        tmp.set(key, { name: d.player, teamCode: d.scoringTeam as 'A' | 'B' });
      }
      const row = tmp.get(key)!;

      switch (d.event) {
        case 'GOAL':
          row.goals = (row.goals ?? 0) + 1;
          break;
        case 'OWN_GOAL':
          row.ownGoals = (row.ownGoals ?? 0) + 1;
          break;
        case 'CARD':
          if (d.card === 'RED') {
            row.red = (row.red ?? 0) + 1;
          } else {
            row.yellow = (row.yellow ?? 0) + 1;
            break;
          }
      }
    }

    const list: VotingCandidate[] = [];
    for (const [key, v] of tmp) {
      const teamName = v.teamCode === 'A' ? m.teamA : m.teamB;
      list.push({
        playerId: key, // na mocku klucz łączony; docelowo: realne Player.id
        teamId: teamName, // na mocku nazwa; docelowo: Team.id
        name: v.name,
        position: 'MID', // docelowo weź z Player.position
        healthStatus: 'HEALTHY', // docelowo weź z Player.healthStatus
        events: {
          goals: v.goals,
          assists: v.assists,
          yellow: v.yellow,
          red: v.red,
          ownGoals: v.ownGoals,
        },
      });
    }

    return list.sort((a, b) => {
      const wa =
        (a.events?.goals ?? 0) +
        (a.events?.assists ?? 0) +
        (a.events?.yellow ?? 0) +
        (a.events?.red ?? 0) +
        (a.events?.ownGoals ?? 0);
      const wb =
        (b.events?.goals ?? 0) +
        (b.events?.assists ?? 0) +
        (b.events?.yellow ?? 0) +
        (b.events?.red ?? 0) +
        (b.events?.ownGoals ?? 0);
      if (wa !== wb) return wb - wa;
      return a.name.localeCompare(b.name, 'pl');
    });
  }
}
