import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {AsyncPipe, NgClass} from "@angular/common";
import {ChatComponent} from "../../pages/chat/chat.component";
import {PeopleComponent} from "../people/people.component";
import {GroupService} from "../../services/group.service";
import {User} from "../../models/user.model";
import {Group} from "../../models/group.model";

@Component({
  selector: 'app-group-settings',
  standalone: true,
  imports: [
    LucideAngularModule,
    AsyncPipe,
    ChatComponent,
    PeopleComponent,
    NgClass
  ],
  templateUrl: './group-settings.component.html',
  styleUrl: './group-settings.component.css'
})
export class GroupSettingsComponent {

  protected tabs = ['General', 'Users', 'Channels'];
  protected currentTab: string = this.tabs[1];

  @Output() closed = new EventEmitter();

  constructor(protected groupService: GroupService) {}

  setTab(tab: string) {
    this.currentTab = tab;
  }

  demoteAdmin(user: User): void {
    const group = this.groupService.currentGroup.value;

    if (group) {
      this.moveUser(user, group.admins, group.members);
    }
  }

  makeAdmin(user: User): void {
    const group = this.groupService.currentGroup.value;

    if (group) {
      this.moveUser(user, group.members, group.admins);
    }
  }

  kickUser(user: User): void {
    const group = this.groupService.currentGroup.value;

    if (group) {
      this.moveUser(user, group.admins, undefined);
      this.moveUser(user, group.members, undefined);
    }
  }

  banUser(user: User): void {
    const group = this.groupService.currentGroup.value;

    if (group) {
      this.moveUser(user, group.admins, group.banned);
    }
  }

  unbanUser(user: User): void {
    const group = this.groupService.currentGroup.value;

    if (group) {
      this.moveUser(user, group.banned, undefined);
    }
  }

  acceptPending(user: User): void {
    const group = this.groupService.currentGroup.value;

    if (group) {
      this.moveUser(user, group.pendingMembers, group.members);
    }
  }

  rejectPending(user: User): void {
    const group = this.groupService.currentGroup.value;

    if (group) {
      this.moveUser(user, group.pendingMembers, undefined);
    }
  }

  /**
   * Used to move users into different roles within the group
   * @param user
   * @param arr1
   * @param arr2
   */
  moveUser(user: User, arr1: User[], arr2?: User[]) {
    // Find the index of the user in arr1
    const userIndex = arr1.findIndex(u => u._id === user._id);

    // If the user is found in arr1, remove the user from arr1 and add to arr2
    if (userIndex !== -1) {
      arr1.splice(userIndex, 1); // Remove user from arr1

      // if a destination was provided, add the user to the new array
      if (arr2) {
        arr2.push(user);
      }
    }
  }
}
