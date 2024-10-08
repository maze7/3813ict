import {Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {NavComponent} from "./components/nav/nav.component";
import {AuthService} from "./services/auth.service";
import {GroupService} from "./services/group.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {finalize, Subscription, tap} from "rxjs";
import {WebSocketService} from "./services/websocket.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private currentSubscription: Subscription | null = null;

  constructor(protected auth: AuthService, private groupService: GroupService, private webSocketService: WebSocketService) {
    this.subscribeToChannel();
  }

  private subscribeToChannel() {
    // Unsubscribe from any existing subscription before creating a new one
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }

    this.currentSubscription = this.groupService.currentChannel.pipe(
      takeUntilDestroyed(),
      tap(channel => {
        if (channel) {
          this.webSocketService.joinChannel(channel._id);
        }
      }),
      finalize(() => {
        this.webSocketService.disconnect();
      })
    ).subscribe();
  }
}
