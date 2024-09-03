import {Component, ElementRef, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AsyncPipe, NgClass} from "@angular/common";
import {GroupService} from "../../services/group.service";

@Component({
  selector: 'app-channel-nav',
  standalone: true,
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    NgClass,
    AsyncPipe
  ],
  templateUrl: './channel-nav.component.html',
  styleUrl: './channel-nav.component.css'
})
export class ChannelNavComponent {
  @ViewChild('newChannelModal', { static: true }) newChannelModal?: ElementRef<HTMLDialogElement>;
  newChannelForm: FormGroup;

  constructor(private fb: FormBuilder, public groupService: GroupService) {
    this.newChannelForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  addChannel(): void {
    if (this.newChannelForm.valid) {
      this.groupService.createChannel(this.newChannelForm.get('name')!.value).subscribe();
      this.newChannelForm.reset();
      this.newChannelModal?.nativeElement.close();
    }
  }
}
