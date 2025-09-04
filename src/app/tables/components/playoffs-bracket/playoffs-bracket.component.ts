import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from '../../services/bracket.service';
import { BracketMatch } from '../../models';
import { BracketRoundPipe } from '../../pipes/bracket-round.pipe';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-playoffs-bracket',
  imports: [CommonModule, BracketRoundPipe],
  templateUrl: './playoffs-bracket.component.html',
  styleUrl: './playoffs-bracket.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayoffsBracketComponent implements OnInit {
  @Input() stageId!: string;

  matches$!: Observable<BracketMatch[]>;
  rounds$!: Observable<number[]>;

  readonly MATCH_H = 120;
  readonly GAP_V = 16;

  constructor(private bracket: BracketService) {}

  ngOnInit(): void {
    this.matches$ = this.bracket.getMatches$(this.stageId);
    this.rounds$ = this.matches$.pipe(
      map((ms) =>
        Array.from(new Set(ms.map((m) => m.round))).sort((a, b) => a - b)
      )
    );
  }

  // Odstęp pionowy (px) dla pierwszego meczu w grupie „łączeniowej” – daje efekt schodków
  offsetTopPx(maxRound: number, round: number): number {
    const step = this.stepPx(maxRound, round);
    return round === maxRound ? 0 : step / 2;
  }

  // Dystans między parami w danej rundzie (px)
  blockGapPx(maxRound: number, round: number): number {
    const step = this.stepPx(maxRound, round);
    return step - this.GAP_V;
  }

  private stepPx(maxRound: number, round: number): number {
    const scale = Math.pow(2, maxRound - round);
    return scale * (this.MATCH_H + this.GAP_V);
  }

  isBye(slotType: string) {
    return slotType === 'BYE';
  }
}
