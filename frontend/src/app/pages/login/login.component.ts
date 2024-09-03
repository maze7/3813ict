import { Component } from '@angular/core';
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {LucideAngularModule} from 'lucide-angular';
import {NgClass} from "@angular/common";
import {AuthService} from "../../services/auth.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {catchError, of} from "rxjs";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    NgClass,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  authError: boolean = false;

  constructor(private auth: AuthService, private router: Router,  private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.authError = false; // reset auth error
      const { username, password } = this.loginForm.value;
      this.auth.login(username, password).pipe(
        catchError((error) => {
          if (error.status === 401) {
            this.authError = true;
            return of(null);
          }

          throw error;
        })
      ).subscribe(res => {
        if (!this.authError) {
          console.log('success');
          this.router.navigate(['/']);
        }
      });
    }
  }
}
