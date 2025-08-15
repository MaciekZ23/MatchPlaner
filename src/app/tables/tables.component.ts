import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopScorersComponent } from './components/top-scorers/top-scorers.component';
import { GoalkeepersCleanSheetsComponent } from './components/goalkeepers-clean-sheets/goalkeepers-clean-sheets.component';
import { PointsTableComponent } from './components/points-table/points-table.component';

@Component({
  selector: 'app-tables',
  imports: [
    CommonModule,
    TopScorersComponent,
    GoalkeepersCleanSheetsComponent,
    PointsTableComponent,
  ],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  standalone: true,
})
export class TablesComponent {}
