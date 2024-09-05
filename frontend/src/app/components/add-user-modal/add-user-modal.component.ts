import {Component, DestroyRef, ElementRef, inject, Input, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {GroupService} from "../../services/group.service";
import {User} from "../../models/user.model";
import {NgClass} from "@angular/common";
import {NgSelectComponent} from "@ng-select/ng-select";
import {take} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Channel} from "../../models/channel.model";

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgSelectComponent
  ],
  templateUrl: './add-user-modal.component.html',
  styleUrl: './add-user-modal.component.css'
})
export class AddUserModalComponent {
  @Input() users: User[] = [];
  @Input() channel?: Channel;

  @ViewChild('addUserModal', { static: true }) addUserModal?: ElementRef<HTMLDialogElement>;
  addUserForm: FormGroup;
  private destroyRef = inject(DestroyRef);

  constructor(private fb: FormBuilder, public groupService: GroupService) {
    this.addUserForm = this.fb.group({
      userId: ['', Validators.required],
    });
  }

  add(): void {
    if (this.addUserForm.valid) {
      const group = this.groupService.currentGroup.value!;
      const userId = this.addUserForm.get('userId')?.value;
      this.groupService.addUser(group._id!, userId, this.channel?._id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      this.addUserForm.reset();
      this.addUserModal?.nativeElement.close();

    }
  }

  public open(): void {
    this.addUserModal?.nativeElement.showModal();
  }
}
