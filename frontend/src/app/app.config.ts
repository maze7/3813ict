import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {
  AudioLines,
  AudioWaveform, Bell, Forward,
  LayoutDashboard,
  LucideAngularModule,
  MessageCircle, MessageCirclePlus, PhoneCall, Plus, Send, SendHorizontal, Settings, Shield,
  ShieldX, UserCog, UserMinus, UserPlus,
  UsersRound, Video
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
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
    })),
  ]
};
