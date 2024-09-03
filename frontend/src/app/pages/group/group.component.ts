import {Component, Input} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {ActivatedRoute, RouterOutlet} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {ChannelNavComponent} from "../../components/channel-nav/channel-nav.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GroupService} from "../../services/group.service";

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    LucideAngularModule,
    RouterOutlet,
    ReactiveFormsModule,
    NgClass,
    ChannelNavComponent,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent {

  constructor(private groupService: GroupService, private route: ActivatedRoute) {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(data => {
      const currentGroup = data.get('groupId');
      if (currentGroup) {
        this.groupService.setGroup(currentGroup);
      }
    });
  }
}
