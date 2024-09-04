import {Component, DestroyRef, ElementRef, inject, Input, OnInit, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {ActivatedRoute, RouterOutlet} from "@angular/router";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AsyncPipe, NgClass} from "@angular/common";
import {ChannelNavComponent} from "../../components/channel-nav/channel-nav.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GroupService} from "../../services/group.service";
import {PeopleComponent} from "../../components/people/people.component";
import {ChatComponent} from "../chat/chat.component";
import {takeUntil} from "rxjs";
import {AuthService} from "../../services/auth.service";
import {GroupSettingsComponent} from "../../components/group-settings/group-settings.component";
import {NewGroupModalComponent} from "../../components/new-group-modal/new-group-modal.component";

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
    PeopleComponent,
    ChatComponent,
    GroupSettingsComponent,
    NewGroupModalComponent,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements OnInit {

  @ViewChild('channelModal', { static: true }) channelModal?: ElementRef<HTMLDialogElement>;
  channelForm: FormGroup;

  private destroyRef = inject(DestroyRef);
  protected showGroupSettings: boolean = false;

  constructor(protected auth: AuthService, protected groupService: GroupService, private fb: FormBuilder) {
    this.channelForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit() {
    // request groups
    this.groupService.listGroups().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      // Check if there's already a selected group
      if (!this.groupService.currentGroup.value) {
        // If no group is selected, set the first one as default
        const defaultGroup = data[0];
        if (defaultGroup) {
          this.groupService.setGroup(defaultGroup._id!);
        }
      }
    });
  }

  join(): void {
    this.groupService.join().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
