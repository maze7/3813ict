import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AddUserModalComponent} from "../../components/add-user-modal/add-user-modal.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LucideAngularModule} from "lucide-angular";
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";
import {AsyncPipe} from "@angular/common";
import {User} from "../../models/user.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    AddUserModalComponent,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule,
    AsyncPipe
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  public users: User[] = [];
  public banned: User[] = [];

  private destroyRef = inject(DestroyRef);

  constructor(protected router: Router, protected userService: UserService) {}

  ngOnInit() {
    this.userService.list({}).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((data) => {
      this.users = data;
      this.banned = data;
    });
  }
}
