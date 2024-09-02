import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ChannelService} from "../../services/channel.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-channel-nav',
  standalone: true,
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './channel-nav.component.html',
  styleUrl: './channel-nav.component.css'
})
export class ChannelNavComponent {
  @ViewChild('newChannelModal', { static: true }) newChannelModal?: ElementRef<HTMLDialogElement>;
  newChannelForm: FormGroup;

  constructor(public channelService: ChannelService, private fb: FormBuilder) {
    this.newChannelForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  addChannel(): void {
    if (this.newChannelForm.valid) {
      this.channelService.addChannel(this.newChannelForm.get('name')!.value);
      this.newChannelForm.reset();
      this.newChannelModal?.nativeElement.close();
    }
  }
}
