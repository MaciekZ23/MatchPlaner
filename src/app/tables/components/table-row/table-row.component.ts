import { Component, Input } from '@angular/core';
import { TeamStats } from '../../models/team-table.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-row',
  imports: [CommonModule],
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.scss'],
  standalone: true,
})

export class TableRowComponent {
  @Input() team!: TeamStats;
  @Input() index!: number;
}
