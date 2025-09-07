export function roundBaseSingular(round: number): string {
  if (round === 1) {
    return 'Finał';
  }
  if (round === 2) {
    return 'Półfinał';
  }
  const d = 2 ** (round - 1);
  return d === 4 ? 'Ćwierćfinał' : `1/${d} finału`;
}

export function groupLabelFor(round: number, index?: number): string {
  if (round === 1) {
    return index === 2 ? '3. miejsce' : 'Finał';
  }
  if (round === 2) {
    return 'Półfinały';
  }
  const d = 2 ** (round - 1);
  return d === 4 ? 'Ćwierćfinały' : `1/${d} finału`;
}

export function matchTitle(round: number, index: number): string {
  if (round === 1) {
    return index === 1 ? 'Finał' : 'Mecz o 3. miejsce';
  }
  return `${roundBaseSingular(round)} ${index}.`;
}
