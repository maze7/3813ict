import { Component } from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router, RouterLink} from "@angular/router";
import {catchError, of} from "rxjs";
import {NgClass} from "@angular/common";

/**
 * Utility validator to ensure two inputs match
 * @param a input 1
 * @param b input 2
 */
export function inputMatchValidator(a: string, b:string): ValidatorFn {
  return (formGroup: AbstractControl): {[key: string]: boolean} | null => {
    const controlA = formGroup.get(a);
    const controlB = formGroup.get(b);

    if (controlA && controlB && controlA.value !== controlB.value) {
      return { 'inputMismatch': true };
    }
    return null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    RouterLink,
    NgClass
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private auth: AuthService, private router: Router,  private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.email],
      password: ['', Validators.required],
      password2: ['', Validators.required]
    }, { validator: inputMatchValidator('password', 'password2') });
  }

  register(): void {
    if (this.registerForm.valid) {
      const { username, email, password, password2 } = this.registerForm.value;

      this.auth.register(username, email, password).pipe(
        catchError((error) => {
          throw error;
        })
      ).subscribe(res => {
        this.router.navigate(['/login']);
      });
    }
  }
}
