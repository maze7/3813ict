import { Injectable } from '@angular/core';
import {Group} from "../models/group.model";
import {Channel} from "../models/channel.model";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor() { }

  private currentGroup: BehaviorSubject<Group | null> = new BehaviorSubject<Group | null>(null);
  public group$ = this.currentGroup.asObservable();

  // dummy data for now
  private groups: Group[] = [
    {
      id: '1',
      name: 'Group 1',
      acronym: 'G1',
      members: [
        { username: 'Nathan Wilson', id: '0', avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp' },
        { username: 'Tara Templeman', id: '0' },
      ],
      admins: [
        { username: 'Callan Acton', id: '0', avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp' },
      ],
      pendingAdmins: [],
    },
    {
      id: '2',
      name: 'Group Two',
      acronym: 'G2',
      members: [],
      admins: [],
      pendingAdmins: [],
    },
    {
      id: '3',
      name: 'Group Three',
      acronym: 'G3',
      members: [],
      admins: [],
      pendingAdmins: [],
    }
  ];

  getGroups(): Group[] {
    return this.groups;
  }

  setGroup(groupId: string | null): void {
    this.currentGroup.next(this.groups.find(g => g.id === groupId) ?? null);
  }
}
