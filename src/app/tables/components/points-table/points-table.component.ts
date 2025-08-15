import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamStats } from '../../models/team-table.model';
import { TeamTableService } from '../../services/team-table.service';
import { stringsPointsTable } from '../../misc';

@Component({
  selector: 'app-points-table',
  imports: [CommonModule],
  templateUrl: './points-table.component.html',
  styleUrls: ['./points-table.component.scss'],
  standalone: true,
})
export class PointsTableComponent implements OnInit {
  moduleStrings = stringsPointsTable;
  tableData: TeamStats[] = [];

  constructor(private tableService: TeamTableService) {}

  ngOnInit(): void {
    this.tableData = this.tableService.getTable();
    this.sortTableByPoints();
  }

  sortTableByPoints() {
    this.tableData.sort((a, b) => b.pkt - a.pkt);
  }
}
