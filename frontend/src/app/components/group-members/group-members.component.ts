import { Component } from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";

@Component({
  selector: 'app-group-members',
  standalone: true,
  imports: [
    AsyncPipe,
    LucideAngularModule
  ],
  templateUrl: './group-members.component.html',
  styleUrl: './group-members.component.css'
})
export class GroupMembersComponent {
  constructor(protected groupService: GroupService) {}
}
