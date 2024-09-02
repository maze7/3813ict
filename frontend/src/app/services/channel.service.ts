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

  public currentChannel: string = '';

  constructor() { }

  setChannel(id: string): void {
    this.currentChannel = id;
  }

  addChannel(name: string): void {
    const channelId = this.channels.length.toString();
    this.channels.push({ id: channelId, name, unread: Math.floor(Math.random() * 2)});
    if (this.currentChannel === '') {
      this.currentChannel = channelId;
    }
  }
}
