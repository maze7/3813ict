import { Routes } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {GroupComponent} from "./pages/group/group.component";
import {authGuard} from "./guards/auth.guard";
import {AdminComponent} from "./pages/admin/admin.component";
import {adminGuard} from "./guards/admin.guard";
import {CallComponent} from "./pages/call/call.component";

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
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'call/:channelId',
    component: CallComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
