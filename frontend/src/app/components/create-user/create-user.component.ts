import {Component, DestroyRef, ElementRef, EventEmitter, inject, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {catchError} from "rxjs";
import {inputMatchValidator} from "../../pages/register/register.component";
import {User} from "../../models/user.model";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  @Output() userCreated = new EventEmitter<User>();
  @ViewChild('createUserModal', { static: true }) createUserModal?: ElementRef<HTMLDialogElement>;

  private destroyRef = inject(DestroyRef);

  registerForm: FormGroup;

  constructor(private auth: AuthService, private router: Router,  private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.email],
      password: ['', Validators.required],
      password2: ['', Validators.required]
    }, { validator: inputMatchValidator('password', 'password2') });
  }

  public open(): void {
    this.createUserModal?.nativeElement.showModal();
  }

  register(): void {
    if (this.registerForm.valid) {
      const { username, email, password, password2 } = this.registerForm.value;

      this.auth.register(username, email, password).pipe(
        catchError((error) => {
          throw error;
        })
      ).subscribe(res => {
        this.userCreated.emit(res);
        this.createUserModal?.nativeElement.close();
      });
    }
  }
}
