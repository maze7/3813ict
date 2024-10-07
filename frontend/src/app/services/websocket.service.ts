import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root' // Ensures this service is a singleton
})
export class WebSocketService {
  private socket!: Socket;

  constructor(private auth: AuthService) {}

  joinChannel(id: string): void {
    this.disconnect();
    this.socket = io(`http://localhost:3000/channel/${id}`, {
      query: { token: this.auth.getToken() }
    });

    this.socket.on('connect', () => {
      console.log(`Connected to id: ${id}`);
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
