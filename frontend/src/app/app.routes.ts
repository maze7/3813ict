import { Routes } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {GroupComponent} from "./pages/group/group.component";
import {authGuard} from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: GroupComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
