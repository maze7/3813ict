import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {LucideAngularModule} from 'lucide-angular';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    NgClass
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public authError: boolean = false;
}
