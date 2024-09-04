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
}
