import {Component, ElementRef, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AsyncPipe, NgClass} from "@angular/common";
import {GroupService} from "../../services/group.service";
import {NewChannelModalComponent} from "../new-channel-modal/new-channel-modal.component";

@Component({
  selector: 'app-channel-nav',
  standalone: true,
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    NgClass,
    AsyncPipe,
    NewChannelModalComponent
  ],
  templateUrl: './channel-nav.component.html',
  styleUrl: './channel-nav.component.css'
})
export class ChannelNavComponent {
  constructor(public groupService: GroupService) {}
}
