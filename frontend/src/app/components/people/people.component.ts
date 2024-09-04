import { Component } from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [
    AsyncPipe,
    LucideAngularModule
  ],
  templateUrl: './people.component.html',
  styleUrl: './people.component.css'
})
export class PeopleComponent {
  constructor(protected groupService: GroupService, protected auth: AuthService) {}
}
