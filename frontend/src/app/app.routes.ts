import { Routes } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {ChatComponent} from "./pages/chat/chat.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {RegisterComponent} from "./pages/register/register.component";
import {GroupComponent} from "./pages/group/group.component";

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
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'chat',
    component: ChatComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'group/:groupId',
    component: GroupComponent,
  }
];
