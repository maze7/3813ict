import {Component, ElementRef, inject, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AsyncPipe, NgClass} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ChannelService} from "../../services/channel.service";
import {Group} from "../../models/group.model";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    NgClass,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './group-nav.component.html',
  styleUrl: './group-nav.component.css'
})
export class GroupNavComponent {

  @ViewChild('newGroupModal', { static: true }) newGroupModal?: ElementRef<HTMLDialogElement>;
  newGroupForm: FormGroup;

  constructor(private fb: FormBuilder, public groupService: GroupService, private router: Router) {
    this.newGroupForm = this.fb.group({
      name: ['', Validators.required],
      acronym: ['', Validators.required],
    });
  }

  addGroup(): void {
    if (this.newGroupForm.valid) {
      const group: Group = {
        id: this.groupService.getGroups().length.toString(),
        name: this.newGroupForm.get('name')!.value,
        acronym: this.newGroupForm.get('acronym')!.value,
        members: [],
        admins: [],
        pendingAdmins: [],
        pendingMembers: [],
      };

      this.groupService.createGroup(group);
      this.newGroupForm.reset();
      this.newGroupModal?.nativeElement.close();
    }
  }

  showGroup(id: string): void {
    this.router.navigate([`/group`, id]);
  }
}
