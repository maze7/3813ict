import {Component, DestroyRef, ElementRef, inject, ViewChild} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {LucideAngularModule} from "lucide-angular";
import {GroupService} from "../../services/group.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Group} from "../../models/group.model";
import {AuthService} from "../../services/auth.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NewGroupModalComponent} from "../new-group-modal/new-group-modal.component";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    NgClass,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    NewGroupModalComponent
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {

  @ViewChild(NewGroupModalComponent) newGroupModal?: NewGroupModalComponent;

  constructor(public auth: AuthService, public groupService: GroupService, protected router: Router, private http: HttpClient) {}

  showGroup(id: string): void {
    this.groupService.setGroup(id);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getUserAvatar(): string {
    const user = this.auth.getUser();
    return `http://localhost:3000${user.avatar}`;
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
      this.auth.setAvatar(res.imageUrl).subscribe();
    });
  }
}
