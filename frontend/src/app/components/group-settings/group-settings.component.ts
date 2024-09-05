import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {AsyncPipe, NgClass} from "@angular/common";
import {ChatComponent} from "../../pages/chat/chat.component";
import {PeopleComponent} from "../people/people.component";
import {GroupService} from "../../services/group.service";
import {User} from "../../models/user.model";
import {Group} from "../../models/group.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AddUserModalComponent} from "../add-user-modal/add-user-modal.component";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-group-settings',
  standalone: true,
  imports: [
    LucideAngularModule,
    AsyncPipe,
    ChatComponent,
    PeopleComponent,
    NgClass,
    AddUserModalComponent
  ],
  templateUrl: './group-settings.component.html',
  styleUrl: './group-settings.component.css'
})
export class GroupSettingsComponent implements OnInit {

  protected tabs = ['General', 'Users'];
  protected currentTab: string = this.tabs[0];
  private destroyRef = inject(DestroyRef);

  @Output() closed = new EventEmitter();

  protected users: User[] = [];

  constructor(protected groupService: GroupService, private userService: UserService) {}

  ngOnInit() {
    this.userService.list({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.users = data;
    });
  }

  setTab(tab: string) {
    this.currentTab = tab;
  }

  kick(user: User, ban: boolean) {
    this.groupService.kick(user, undefined, ban).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  accept(user: User, decision: boolean): void {
    const group = this.groupService.currentGroup.value!;
    this.groupService.accept(user, group, decision).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  setAdmin(user: User, status: boolean): void {
    const group = this.groupService.currentGroup.value!;
    this.groupService.setAdmin(user, group, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
