import { Component, OnInit } from '@angular/core';
import { TeamStats } from './models/team-table.model';
import { TeamTableService } from './services/team-table.service';
import { TableRowComponent } from './components/table-row/table-row.component';
import { CommonModule } from '@angular/common';
import { TopScorersComponent } from './components/top-scorers/top-scorers.component';
import { GoalkeepersCleanSheetsComponent } from './components/goalkeepers-clean-sheets/goalkeepers-clean-sheets.component';

@Component({
  selector: 'app-tables',
  imports: [
    CommonModule,
    TableRowComponent,
    TopScorersComponent,
    GoalkeepersCleanSheetsComponent,
  ],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  standalone: true,
})
export class TablesComponent implements OnInit {
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
