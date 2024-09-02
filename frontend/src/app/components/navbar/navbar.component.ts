import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(public groupService: GroupService) {
  }
}
