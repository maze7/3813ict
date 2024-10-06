import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import {AuthService} from "./auth.service";
import {map, Observable} from "rxjs";
import {GroupService} from "./group.service";
import {Message} from "../models/message.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: any;

  constructor(private auth: AuthService, private group: GroupService, private http: HttpClient) {}

  connect() {
    console.log('connecting to chat...');
    this.socket = io('http://localhost:3000', {
      query: {
        token: this.auth.getToken()
      }
    });
    return () => { this.socket.disconnect(); }
  }

  messages(): Observable<Message> {
    return new Observable((observer) => {
      this.socket.on('message', (message: Message) => {
        observer.next(message);
      })
    });
  }

  getChannelMessages(groupId: string, channelId: string): Observable<Message[]> {
    return this.http.get(`http://localhost:3000/messages/${groupId}/${channelId}`).pipe(
      map((res) => {
        return res as Message[];
      })
    );
  }

  send(message: string): void {
    const group = this.group.currentGroup.value!;
    const channel = this.group.currentChannel.value!;

    this.socket.emit('message', { message, channel: channel._id, group: group._id });
  }
}
