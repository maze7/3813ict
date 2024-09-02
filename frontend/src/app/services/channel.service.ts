import { Injectable } from '@angular/core';
import {Channel} from "../models/channel.model";

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private _channels: Channel[] = [];
  public get channels(): Channel[] {
    return this._channels;
  }

  constructor() { }

  addChannel(name: string): void {
    this.channels.push({ id: this.channels.length.toString(), name, unread: 0});
  }
}
