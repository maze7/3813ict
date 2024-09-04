import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";
import {GroupService} from "../../services/group.service";

@Component({
  selector: 'app-new-channel-modal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './new-channel-modal.component.html',
  styleUrl: './new-channel-modal.component.css'
})
export class NewChannelModalComponent {
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

  public open(): void {
    this.newChannelModal?.nativeElement.showModal();
  }
}
