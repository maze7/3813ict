import {Component, DestroyRef, ElementRef, inject, ViewChild} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Group} from "../../models/group.model";
import {AuthService} from "../../services/auth.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NewGroupModalComponent} from "../new-group-modal/new-group-modal.component";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    NgClass,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    NewGroupModalComponent
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {

  @ViewChild(NewGroupModalComponent) newGroupModal?: NewGroupModalComponent;

  constructor(public auth: AuthService, public groupService: GroupService, protected router: Router) {}

  showGroup(id: string): void {
    this.groupService.setGroup(id);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
