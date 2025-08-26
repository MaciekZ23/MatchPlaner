import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TeamsComponent } from './teams/teams.component';
import { CalendarComponent } from './calendar/calendar.component';
import { TablesComponent } from './tables/tables.component';
import { TeamResolver } from './teams/services/team.resolver';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'teams', component: TeamsComponent },
  {
    path: 'teams/:id',
    component: TeamsComponent,
    resolve: { team: TeamResolver },
  },
  { path: 'calendar', component: CalendarComponent },
  { path: 'tables', component: TablesComponent },
  { path: '**', redirectTo: '' },
];
