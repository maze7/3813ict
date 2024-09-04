import {Component, DestroyRef, ElementRef, inject, Input, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {GroupService} from "../../services/group.service";
import {Router} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-new-group-modal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './new-group-modal.component.html',
  styleUrl: './new-group-modal.component.css'
})
export class NewGroupModalComponent {
  @Input() show: boolean = false;
  @ViewChild('newGroupModal', { static: true }) newGroupModal?: ElementRef<HTMLDialogElement>;

  private destroyRef = inject(DestroyRef);
  newGroupForm: FormGroup;

  constructor(public auth: AuthService, private fb: FormBuilder, public groupService: GroupService, private router: Router) {
    this.newGroupForm = this.fb.group({
      name: ['', Validators.required],
      acronym: ['', Validators.required],
    });
  }

  addGroup(): void {
    if (this.newGroupForm.valid) {
      const name = this.newGroupForm.get('name')!.value;
      const acronym = this.newGroupForm.get('acronym')!.value;

      this.groupService.createGroup(name, acronym).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      this.newGroupForm.reset();
      this.newGroupModal?.nativeElement.close();
    }
  }

  public open(): void {
    this.newGroupModal?.nativeElement.showModal();
  }

  public close(): void {
    this.newGroupModal?.nativeElement.close();
  }
}
