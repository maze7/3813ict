import {Component, Input} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {ActivatedRoute, RouterOutlet} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe, NgClass} from "@angular/common";
import {ChannelNavComponent} from "../../components/channel-nav/channel-nav.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GroupService} from "../../services/group.service";
import {GroupMembersComponent} from "../../components/group-members/group-members.component";
import {ChatComponent} from "../chat/chat.component";

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    LucideAngularModule,
    RouterOutlet,
    ReactiveFormsModule,
    NgClass,
    ChannelNavComponent,
    AsyncPipe,
    GroupMembersComponent,
    ChatComponent,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent {

  constructor(protected groupService: GroupService, private route: ActivatedRoute) {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(data => {
      const currentGroup = data.get('groupId');
      if (currentGroup) {
        this.groupService.setGroup(currentGroup);
      }
    });
  }
}
