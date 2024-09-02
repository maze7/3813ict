import {Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {GroupNavComponent} from "./components/group-nav/group-nav.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    GroupNavComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
}
