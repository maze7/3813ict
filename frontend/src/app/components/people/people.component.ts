import {Component, DestroyRef, inject} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/user.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AddUserModalComponent} from "../add-user-modal/add-user-modal.component";

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [
    AsyncPipe,
    LucideAngularModule,
    AddUserModalComponent
  ],
  templateUrl: './people.component.html',
  styleUrl: './people.component.css'
})
export class PeopleComponent {

  private destroyRef = inject(DestroyRef);

  constructor(protected groupService: GroupService, protected auth: AuthService) {}

  kick(user: User, ban: boolean) {
    const channel = this.groupService.currentChannel.value!;
    this.groupService.kick(user, channel, ban).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  getUsers(): User[] {
    const group = this.groupService.currentGroup.value!;
    return [...group.members, ...group.admins];
  }
}
