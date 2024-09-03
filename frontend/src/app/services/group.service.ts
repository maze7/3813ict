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
      pendingMembers: [
        { username: 'Chase Meise', id: '0' },
        { username: 'Shrek', id: '0', avatar: 'https://www.cnet.com/a/img/resize/4cd1618a335631f7c0b7caa5fdc421b024f20f06/hub/2018/11/30/5ccd3953-6edf-4435-b4d1-615d3d0274b1/shrekretoldstill.jpg?auto=webp&width=1920' },
      ],
    },
    {
      id: '2',
      name: 'Group Two',
      acronym: 'G2',
      members: [],
      admins: [],
      pendingAdmins: [],
      pendingMembers: [],
    },
    {
      id: '3',
      name: 'Group Three',
      acronym: 'G3',
      members: [],
      admins: [],
      pendingAdmins: [],
      pendingMembers: [],
    }
  ];

  getGroups(): Group[] {
    return this.groups;
  }

  setGroup(groupId: string | null): void {
    this.currentGroup.next(this.groups.find(g => g.id === groupId) ?? null);
  }
}
