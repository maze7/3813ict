import {Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {NavComponent} from "./components/nav/nav.component";
import {AuthService} from "./services/auth.service";

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
  constructor(protected auth: AuthService) {}
}
