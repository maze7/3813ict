import {AfterViewChecked, Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AuthService} from "../../services/auth.service";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {NewChannelModalComponent} from "../../components/new-channel-modal/new-channel-modal.component";
import {FormsModule} from "@angular/forms";
import {Subscription, tap} from "rxjs";
import {Message} from "../../models/message.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {HttpClient} from "@angular/common/http";
import {WebSocketService} from "../../services/websocket.service";

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
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chat') private chat!: ElementRef;

  protected message: string = '';
  public messages: Message[] = [];
  private destroyRef = inject(DestroyRef);
  private messageListenerSub: Subscription | null = null;
  public previewImageUrl: string | null = null;
  protected images: string[] = [];

  constructor(protected groups: GroupService, protected auth: AuthService, private websocketService: WebSocketService, private http: HttpClient) {}

  ngOnInit() {
    this.groups.currentChannel.asObservable().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(channel => {
      const group = this.groups.currentGroup.value!;

      if (group && channel) {
        this.getChannelMessages(group._id!, channel._id);
        this.setupWebSocketListener();
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.websocketService.disconnect();
    if (this.messageListenerSub) {
      this.messageListenerSub.unsubscribe(); // Unsubscribe when the component is destroyed
    }
  }

  setupWebSocketListener() {
    if (this.messageListenerSub) {
      this.messageListenerSub.unsubscribe();
    }

    // Add a new WebSocket listener
    this.messageListenerSub = this.websocketService.listen('message').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((message: Message) => this.messages.push(message))
    ).subscribe();
  }

  // Fetch messages for a specific channel
  getChannelMessages(groupId: string, channelId: string): void {
    this.http.get(`http://localhost:3000/messages/${groupId}/${channelId}`).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((res) => {
        this.messages = res as Message[];
      })
    ).subscribe();
  }

  // Send a message via WebSocket
  send() {
    if (this.message.trim() || this.images.length) {
      const group = this.groups.currentGroup.value!;
      const channel = this.groups.currentChannel.value!;

      // Emit message to the server
      this.websocketService.emit('message', {
        message: this.message,
        channel: channel._id,
        group: group._id,
        images: this.images,
      });

      // Scroll to the bottom after the new message is added
      setTimeout(() => this.scrollToBottom(), 0);

      // Clear the input fields
      this.message = '';
      this.images = [];
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.uploadImage(file);
    }
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    this.http.post('http://localhost:3000/upload', formData).subscribe((res: any) => {
      this.images.push(res.imageUrl);
    });
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }

  // Open the image preview
  openImagePreview(imageUrl: string) {
    this.previewImageUrl = imageUrl;
  }

  // Close the image preview
  closeImagePreview() {
    this.previewImageUrl = null;
  }
}
