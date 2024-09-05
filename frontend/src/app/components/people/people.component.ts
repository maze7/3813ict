import {Component, DestroyRef, inject} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/user.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AddUserModalComponent} from "../add-user-modal/add-user-modal.component";
import {take} from "rxjs";

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

    if (ban) {
      this.groupService.ban(user, ban).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    } else {
      this.groupService.kick(user, channel).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  getUsers(): User[] {
    const group = this.groupService.currentGroup.value!;

    // Combine members and admins, create a Set of unique user IDs
    const uniqueUserIds = new Set([...group.members, ...group.admins].map(user => user._id));

    // Map back to user objects, filtering out any undefined results from `find`
    return Array.from(uniqueUserIds)
      .map(id => group.members.concat(group.admins).find(user => user._id === id))
      .filter((user): user is User => !!user); // Type guard to filter out undefined
  }
}
