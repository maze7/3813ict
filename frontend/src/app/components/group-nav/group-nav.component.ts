import { Component } from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule
  ],
  templateUrl: './group-nav.component.html',
  styleUrl: './group-nav.component.css'
})
export class GroupNavComponent {
  constructor(public groupService: GroupService, private router: Router) {}

  showGroup(id: string): void {
    this.router.navigate([`/group`, id]);
  }
}
