import { Component, OnDestroy, OnInit } from '@angular/core';
import { Peer } from 'peerjs';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css'],
  standalone: true,
})
export class CallComponent implements OnInit, OnDestroy {
  private peer!: Peer;
  private myVideoStream!: MediaStream;
  private videoGrid!: HTMLElement;
  private peers: { [id: string]: any } = {};

  constructor(private auth: AuthService, private webSocketService: WebSocketService, private route: ActivatedRoute) {
    // Join the channel namespace directly
    this.webSocketService.joinChannel(this.route.snapshot.params['channelId']);
  }

  userId!: string;

  ngOnInit() {
    this.videoGrid = document.getElementById('video-grid')!;
    this.peer = new Peer(this.auth.getUser()._id, {
      path: '/peerjs',
      host: '/',
      port: 3000,
    });

    // Get media streams
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      this.myVideoStream = stream;
      this.addVideoStream(this.createVideoElement(this.peer.id), stream);

      // Handle incoming calls
      this.peer.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (userVideoStream) => {
          if (!document.getElementById(call.peer)) {
            this.addVideoStream(this.createVideoElement(call.peer), userVideoStream);
          }
        });
      });

      // Listen for other users joining or disconnecting
      this.webSocketService.listen('join-call').subscribe((peerId) => {
        console.log(`new peer: ${peerId}`)
        this.connectToNewPeer(peerId, stream);
      });

      this.webSocketService.listen('user-disconnected').subscribe((userId: string) => {
        if (this.peers[userId]) {
          this.peers[userId].close();
          delete this.peers[userId];
        }
        this.removeVideoElement(userId);
      });
    });

    this.peer.on('open', (id) => {
      this.userId = id;
      this.webSocketService.emit('join-call', this.peer.id);
    });
  }

  ngOnDestroy() {
    // Clean up the PeerJS and WebSocket connections
    if (this.peer) {
      this.peer.destroy();
    }

    Object.keys(this.peers).forEach((userId) => {
      if (this.peers[userId]) {
        this.peers[userId].close();
      }
    });

    this.webSocketService.disconnect();
  }

  private connectToNewPeer(peerId: string, stream: MediaStream) {
    if (this.peers[peerId]) return;

    const call = this.peer.call(peerId, stream);
    call.on('stream', (userVideoStream) => {
      if (!document.getElementById(peerId)) {
        this.addVideoStream(this.createVideoElement(peerId), userVideoStream);
      }
    });
    call.on('close', () => {
      this.removeVideoElement(peerId);
    });

    this.peers[peerId] = call;
  }

  private createVideoElement(userId: string): HTMLVideoElement {
    const video = document.createElement('video');
    video.id = userId;
    video.muted = userId === this.userId;
    video.autoplay = true;
    this.videoGrid.append(video);
    return video;
  }

  private addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
  }

  private stopMediaStream(stream: MediaStream) {
    stream.getTracks().forEach(track => track.stop());
  }

  private removeVideoElement(userId: string) {
    const videoElement = document.getElementById(userId) as HTMLVideoElement;
    if (videoElement) {
      const stream = videoElement.srcObject as MediaStream;
      if (stream) {
        this.stopMediaStream(stream);  // Stop the media stream before removing the element
      }
      videoElement.remove();
    }
  }
}
