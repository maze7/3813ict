import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {RouterOutlet} from "@angular/router";
import {ChannelService} from "../../services/channel.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";
import {ChannelNavComponent} from "../../components/channel-nav/channel-nav.component";

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    LucideAngularModule,
    RouterOutlet,
    ReactiveFormsModule,
    NgClass,
    ChannelNavComponent,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent {

}
