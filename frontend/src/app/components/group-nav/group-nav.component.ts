import {Component, inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AsyncPipe, NgClass} from "@angular/common";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    NgClass,
    AsyncPipe
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
