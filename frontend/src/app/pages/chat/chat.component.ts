import { Component } from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AuthService} from "../../services/auth.service";
import {AsyncPipe} from "@angular/common";
import {NewChannelModalComponent} from "../../components/new-channel-modal/new-channel-modal.component";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    LucideAngularModule,
    AsyncPipe,
    NewChannelModalComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  constructor(protected groups: GroupService, protected auth: AuthService) {}
}
