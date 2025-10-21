import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TeamsComponent } from './teams/teams.component';
import { CalendarComponent } from './calendar/calendar.component';
import { TablesComponent } from './tables/tables.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { TournamentPickerComponent } from './tournament-picker/tournament-picker.component';
import { TeamResolver } from './teams/services/team.resolver';
import { AuthGuard } from './core/auth/auth.guard';
import { TournamentParamGuard } from './core/guards/tournament-param.guard';
import { DefaultRouteGuard } from './core/guards/default-route.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'tournaments',
    component: TournamentPickerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':tid',
    canActivate: [AuthGuard, TournamentParamGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: HomeComponent },
      {
        path: 'teams',
        children: [
          { path: '', component: TeamsComponent },
          {
            path: ':id',
            component: TeamsComponent,
            resolve: { team: TeamResolver },
          },
        ],
      },
      { path: 'calendar', component: CalendarComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'redirect',
  },
  {
    path: 'redirect',
    canActivate: [AuthGuard, DefaultRouteGuard],
    component: HomeComponent,
  },
  { path: '**', redirectTo: '' },
];
