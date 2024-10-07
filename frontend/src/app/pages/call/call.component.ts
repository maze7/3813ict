import { Component, OnDestroy, OnInit } from '@angular/core';
import { Peer } from 'peerjs';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from "@angular/router";
import {NgClass} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

interface PeerUser {
  muted: boolean;
  stream: MediaStream;
  id: string;
}

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css'],
  standalone: true,
  imports: [
    NgClass
  ]
})
export class CallComponent implements OnInit, OnDestroy {
  private peer?: Peer;
  protected peers: { [key: string]: PeerUser } = {};
  protected localStream?: MediaStream;

  constructor(private auth: AuthService, private webSocketService: WebSocketService, private route: ActivatedRoute) {
    this.webSocketService.joinChannel(this.route.snapshot.params['channelId']);

    this.initializePeer();

    // Handle incoming calls
    this.peer!.on('call', (call) => {
      call.answer(this.localStream);
      call.on('stream', (stream) => {
        this.peers[call.peer] = { muted: false, stream, id: call.peer };
      });
    });

    // Handle peer connections
    this.webSocketService.listen('join-call').pipe(takeUntilDestroyed()).subscribe((peer) => {
      this.addPeer(peer);
    });

    // Handle peer leaving
    this.webSocketService.listen('leave-call').pipe(takeUntilDestroyed()).subscribe((peerId) => {
      if (this.peers[peerId]) {
        this.peers[peerId].stream.getTracks().forEach(track => track.stop()); // Stop the stream
        delete this.peers[peerId]; // Remove peer from peers object
      }
    });
  }

  ngOnInit() {
    // Access user's media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      this.localStream = stream;
      this.peers[this.peer!.id] = { muted: true, stream, id: this.peer!.id };

      // Notify other peers about joining
      this.webSocketService.emit('join-call', this.peer!.id);
    });
  }

  ngOnDestroy() {
    if (this.peer) {
      this.peer.disconnect(); // Disconnect from the peer network
      this.peer.destroy();    // Clean up the PeerJS instance
      this.webSocketService.emit('leave-call', this.peer!.id); // Notify other peers
    }
    this.webSocketService.disconnect(); // Disconnect the WebSocket
  }

  // Initialize Peer
  initializePeer() {
    this.peer = new Peer(this.auth.getUser()._id, {
      path: '/peerjs',
      host: 'localhost',
      port: 3000,
    });
  }

  // Add peer and handle incoming calls
  addPeer(peerId: string) {
    if (this.peers[peerId]) return; // Ignore existing peers

    const call = this.peer!.call(peerId, this.localStream!);
    call.on('stream', (stream) => {
      this.peers[peerId] = { muted: false, stream, id: peerId };
    });

    call.on('close', () => {
      if (this.peers[peerId]) {
        this.peers[peerId].stream.getTracks().forEach(track => track.stop());
        delete this.peers[peerId]; // Remove peer after closing connection
      }
    });

    call.on('error', (error) => {
      console.error(`Call error with peer ${peerId}:`, error);
    });
  }

  // Toggle mute/unmute for local video
  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      this.peers[this.peer!.id].muted = !audioTrack.enabled;
    }
  }

  protected readonly Object = Object;
}
