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
      name: 'G1',
    },
    {
      id: '2',
      name: 'G2',
    },
    {
      id: '3',
      name: 'G3',
    }
  ];

  getGroups(): Group[] {
    return this.groups;
  }

  setGroup(groupId: string | null): void {
    this.currentGroup.next(this.groups.find(g => g.id === groupId) ?? null);
  }
}
