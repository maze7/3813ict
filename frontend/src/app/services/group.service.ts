import { Injectable } from '@angular/core';
import {Group} from "../models/group.model";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor() { }

  // dummy data for now
  private groups: Group[] = [
    {
      name: 'G1',
    },
    {
      name: 'G2',
    },
    {
      name: 'G3',
    }
  ];

  getGroups(): Group[] {
    return this.groups;
  }
}
