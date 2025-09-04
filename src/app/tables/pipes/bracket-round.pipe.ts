import { Pipe, PipeTransform } from '@angular/core';
import { BracketMatch } from '../models';

@Pipe({ name: 'bracketRound', standalone: true })
export class BracketRoundPipe implements PipeTransform {
  transform(matches: BracketMatch[] | null | undefined, round: number) {
    if (!matches) {
      return [];
    }
    return matches
      .filter((m) => m.round === round)
      .sort((a, b) => a.index - b.index);
  }
}
