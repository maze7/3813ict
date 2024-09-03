import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {
  AudioLines,
  AudioWaveform, Bell, Forward,
  LayoutDashboard,
  LucideAngularModule,
  MessageCircle, MessageCirclePlus, MessageSquare, PhoneCall, Plus, Send, SendHorizontal, Settings, Shield,
  ShieldX, UserCog, UserMinus, UserPlus, UserRoundCheck, UserRoundX,
  UsersRound, Video, Lock,
} from 'lucide-angular';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {authInterceptor} from "./interceptors/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(LucideAngularModule.pick({
      ShieldX,
      MessageCircle,
      UsersRound,
      LayoutDashboard,
      AudioLines,
      AudioWaveform,
      MessageCirclePlus,
      Plus,
      Settings,
      Bell,
      Send,
      Forward,
      SendHorizontal,
      UserPlus,
      UserMinus,
      UserCog,
      Shield,
      Video,
      PhoneCall,
      MessageSquare,
      UserRoundCheck,
      UserRoundX,
      Lock,
    })),
  ]
};
