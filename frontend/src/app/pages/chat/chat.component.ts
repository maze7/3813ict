import { Component } from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AuthService} from "../../services/auth.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {NewChannelModalComponent} from "../../components/new-channel-modal/new-channel-modal.component";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    LucideAngularModule,
    AsyncPipe,
    NewChannelModalComponent,
    NgClass
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  protected messages = [
    { name: 'Ronald', img: 'ronald.png', time: '12:45', msg: 'I feel like noodles!' },
    { name: 'Frank', img: 'frank.png', time: '12:45', msg: 'What type of noodles?'},
    { name: 'Sally', img: 'sleepysally.png', time: '12:46', msg: 'ramen!' },
    { name: 'Ronald', img: 'ronald.png', time: '12:45', msg: 'They get stuck in my beard..!' },
    { name: 'Ben', img: 'ben.png', time: '12:32', msg: `That's how you save them for later.` },
    { name: 'Sally', img: 'sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
  ]

  constructor(protected groups: GroupService, protected auth: AuthService) {}
}
