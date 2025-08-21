import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopScorersComponent } from './components/top-scorers/top-scorers.component';
import { GoalkeepersCleanSheetsComponent } from './components/goalkeepers-clean-sheets/goalkeepers-clean-sheets.component';
import { PointsTableComponent } from './components/points-table/points-table.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { stringsTables } from './misc';

@Component({
  selector: 'app-tables',
  imports: [
    CommonModule,
    TopScorersComponent,
    GoalkeepersCleanSheetsComponent,
    PointsTableComponent,
    PageHeaderComponent,
  ],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  standalone: true,
})
export class TablesComponent {
  moduleStrings = stringsTables;
}
