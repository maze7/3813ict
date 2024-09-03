import {Component, DestroyRef, ElementRef, inject, ViewChild} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Group} from "../../models/group.model";
import {AuthService} from "../../services/auth.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

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
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {

  private destroyRef = inject(DestroyRef);

  @ViewChild('newGroupModal', { static: true }) newGroupModal?: ElementRef<HTMLDialogElement>;
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

  showGroup(id: string): void {
    this.groupService.setGroup(id);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
