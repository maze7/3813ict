import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {RouterOutlet} from "@angular/router";
import {ChannelService} from "../../services/channel.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    LucideAngularModule,
    RouterOutlet,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent {

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
