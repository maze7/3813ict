import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root' // Ensures this service is a singleton
})
export class WebSocketService {
  private socket!: Socket;
  private currentChannelId: string | null = null;

  constructor(private auth: AuthService) {}

  // Join a channel with the provided ID and token
  joinChannel(id: string): void {
    // If already connected to the same channel, no need to reconnect
    if (this.currentChannelId === id && this.socket && this.socket.connected) {
      return; // Already connected to this channel
    }

    // Disconnect from any previous channel before joining a new one
    this.disconnect();

    // Initialize the socket connection to the new channel with the auth token
    this.socket = io(`http://localhost:3000/channel/${id}`, {
      query: { token: this.auth.getToken() }
    });

    this.socket.on('connect', () => {
      console.log(`Connected to channel: ${id}`);
      this.currentChannelId = id; // Track the current channel
    });
  }

  // Listen to specific events from the server
  listen(eventName: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(eventName, (data) => {
        observer.next(data);
      });
    });
  }

  // Emit specific events to the server
  emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  // Optionally: manually disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
