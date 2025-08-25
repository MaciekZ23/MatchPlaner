import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamStats } from '../../models/team-table.model';
import { stringsPointsTable } from '../../misc';

@Component({
  selector: 'app-points-table',
  imports: [CommonModule],
  templateUrl: './points-table.component.html',
  styleUrls: ['./points-table.component.scss'],
  standalone: true,
})
export class PointsTableComponent {
  moduleStrings = stringsPointsTable;

  @Input() rows: TeamStats[] = [];
  @Input() groupTitle: string = '';

  trackRow = (_: number, r: TeamStats) => r.id ?? r.name;
}
