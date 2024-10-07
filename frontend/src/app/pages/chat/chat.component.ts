import {AfterViewChecked, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AuthService} from "../../services/auth.service";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {NewChannelModalComponent} from "../../components/new-channel-modal/new-channel-modal.component";
import {FormsModule} from "@angular/forms";
import {ChatService} from "../../services/chat.service";
import {tap} from "rxjs";
import {Message} from "../../models/message.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    LucideAngularModule,
    AsyncPipe,
    NewChannelModalComponent,
    NgClass,
    FormsModule,
    DatePipe
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chat') private chat!: ElementRef;

  protected message: string = '';
  public messages: Message[] = [];
  private destroyRef = inject(DestroyRef);

  constructor(protected groups: GroupService, protected auth: AuthService, protected chatService: ChatService) {}

  ngOnInit() {
    this.groups.currentChannel.asObservable().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(channel => {
      const group = this.groups.currentGroup.value!;

      // load initial messages
      this.chatService.getChannelMessages(group._id!, channel!._id!).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(data => {
        this.messages = data;
      });
    });

    const channel = this.groups.currentChannel.value!;
    console.log(channel);
    // open socket connection
    this.chatService.connect(channel._id);
    this.chatService.messages().pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((m) => this.messages.push(m)),
    ).subscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  send() {
    if (this.message.trim()) {
      this.chatService.send(this.message);

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
