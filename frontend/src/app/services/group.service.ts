import { Injectable } from '@angular/core';
import {Group} from "../models/group.model";
import {Channel} from "../models/channel.model";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor() { }

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
}
