import {Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import { LucideAngularModule, ShieldX } from 'lucide-angular';
import {HeaderComponent} from "./components/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
}
