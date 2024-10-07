import {Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {NavComponent} from "./components/nav/nav.component";
import {AuthService} from "./services/auth.service";
import {GroupService} from "./services/group.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {finalize, tap} from "rxjs";
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
  constructor(protected auth: AuthService, private groupService: GroupService, private webSocketService: WebSocketService) {
    this.groupService.currentChannel.pipe(
      takeUntilDestroyed(),
      tap(channel => {
        if (channel) {
          this.webSocketService.joinChannel(channel._id);
        }
      }),
      // finalize(() => {
      //   this.webSocketService.disconnect();
      // })
    ).subscribe();
  }
}
