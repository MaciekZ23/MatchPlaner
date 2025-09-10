import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TopScorersComponent } from './components/top-scorers/top-scorers.component';
import { GoalkeepersCleanSheetsComponent } from './components/goalkeepers-clean-sheets/goalkeepers-clean-sheets.component';
import { PointsTableComponent } from './components/points-table/points-table.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { TeamTableService } from './services/team-table.service';
import { PointsTableGroup, TablesVM } from './models';
import { stringsTables } from './misc';
import { PlayoffsBracketComponent } from './components/playoffs-bracket/playoffs-bracket.component';

@Component({
  selector: 'app-tables',
  imports: [
    CommonModule,
    TopScorersComponent,
    GoalkeepersCleanSheetsComponent,
    PointsTableComponent,
    PageHeaderComponent,
    PlayoffsBracketComponent,
  ],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesComponent implements OnInit {
  moduleStrings = stringsTables;
  viewmodel$!: Observable<TablesVM>;

  constructor(private teamTable: TeamTableService) {}

  ngOnInit(): void {
    this.viewmodel$ = this.teamTable.getTablesVM$();
  }

  trackGroup = (_: number, g: PointsTableGroup) => g.groupId;
}
