import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../models/team';

@Component({
  selector: 'app-team-card',
  imports: [CommonModule],
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss'],
  standalone: true,
})
export class TeamCardComponent implements AfterViewInit, OnDestroy {
  @Input() team!: Team;
  @Input() canManage = false;

  @Output() teamClick = new EventEmitter<Team>();
  @Output() editTeam = new EventEmitter<Team>();
  @Output() deleteTeam = new EventEmitter<Team>();

  private tooltipInstances: any[] = [];
  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const bs = (window as any).bootstrap;
    if (!bs?.Tooltip) {
      return;
    }
    const scope = this.host.nativeElement;
    const triggers = scope.querySelectorAll<HTMLElement>(
      '[data-bs-toggle="tooltip"]'
    );
    this.tooltipInstances = Array.from(triggers).map(
      (el) =>
        bs.Tooltip.getInstance?.(el) ?? new bs.Tooltip(el, { placement: 'top' })
    );
  }

  ngOnDestroy(): void {
    this.tooltipInstances.forEach((t) => t?.dispose?.());
    this.tooltipInstances = [];
  }

  hideTooltip(ev: Event) {
    const el = ev.currentTarget as HTMLElement;
    const bs = (window as any).bootstrap;
    const inst = bs?.Tooltip?.getInstance?.(el);
    inst?.hide();
    el.blur();
  }

  onClick(): void {
    this.teamClick.emit(this.team);
  }

  onEdit(ev: MouseEvent) {
    ev.stopPropagation();
    this.editTeam.emit(this.team);
  }

  onDelete(ev: MouseEvent) {
    ev.stopPropagation();
    this.deleteTeam.emit(this.team);
  }
}
