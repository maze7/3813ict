import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AddUserModalComponent} from "../../components/add-user-modal/add-user-modal.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LucideAngularModule} from "lucide-angular";
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";
import {AsyncPipe} from "@angular/common";
import {User} from "../../models/user.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CreateUserComponent} from "../../components/create-user/create-user.component";
import {take} from "rxjs";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    AddUserModalComponent,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule,
    AsyncPipe,
    CreateUserComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  public users: User[] = [];
  public banned: User[] = [];
  public flagged: User[] = [];

  private destroyRef = inject(DestroyRef);

  constructor(protected router: Router, protected userService: UserService) {}

  ngOnInit() {
    this.listUsers();
  }

  listUsers(): void {
    this.userService.list({}).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((data) => {
      this.users = data.filter(u => !u.flagged && !u.banned);
      this.flagged = data.filter(u => u.flagged);
      this.banned = data.filter(u => u.banned);
    });
  }

  ban(user: User, banned: boolean) {
    this.userService.ban(user, banned).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((data) => {
      this.listUsers();
    })
  }

  flag(user: User, flagged: boolean) {
    this.userService.flag(user, flagged).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((data) => {
      this.listUsers();
    })
  }

  promote(user: User): void {
    if (user.roles.includes('groupAdmin') && !user.roles.includes('superAdmin')) {
      user.roles.push('superAdmin');
    } else if (!user.roles.includes('groupAdmin')) {
      user.roles.push('groupAdmin');
    }

    this.userService.update(user).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  demote(user: User): void {
    if (user.roles.includes('superAdmin')) {
      user.roles = ['user', 'groupAdmin'];
    } else if (user.roles.includes('groupAdmin') && !user.roles.includes('superAdmin')) {
      user.roles = ['user'];
    }

    // save the change
    this.userService.update(user).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  delete(user: User): void {
    this.userService.delete(user).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.listUsers();
    });
  }
}
