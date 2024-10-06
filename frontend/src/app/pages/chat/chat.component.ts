import {AfterViewChecked, Component, ElementRef, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AuthService} from "../../services/auth.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {NewChannelModalComponent} from "../../components/new-channel-modal/new-channel-modal.component";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    LucideAngularModule,
    AsyncPipe,
    NewChannelModalComponent,
    NgClass,
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('chat') private chat!: ElementRef;

  protected message: string = '';
  protected messages = [
    { name: 'Ronald', img: 'avatars/ronald.png', time: '12:45', msg: 'I feel like noodles!' },
    { name: 'Frank', img: 'avatars/frank.png', time: '12:45', msg: 'What type of noodles?'},
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'ramen!' },
    { name: 'Ronald', img: 'avatars/ronald.png', time: '12:45', msg: 'They get stuck in my beard..!' },
    { name: 'Ben', img: 'avatars/ben.png', time: '12:32', msg: `That's how you save them for later.` },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
    { name: 'Sally', img: 'avatars/sleepysally.png', time: '12:46', msg: 'infinite noodles!' },
  ]

  constructor(protected groups: GroupService, protected auth: AuthService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  send() {
    if (this.message.trim()) {
      const user = this.auth.getUser();
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Add the new message to the messages array
      this.messages.push({
        name: user.username,
        img: `avatars/${user.avatar}`,
        time: currentTime,
        msg: this.message
      });

      // scroll to the bottom of the chat
      // Scroll to the bottom after the new message is added
      setTimeout(() => this.scrollToBottom(), 0);

      // Clear the input field
      this.message = '';
    }
  }

  // Handle the Enter key press event
  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.send();
    }
  }

  scrollToBottom(): void {
    try {
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom error', err);
    }
  }
}
