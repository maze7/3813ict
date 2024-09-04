import { Injectable } from '@angular/core';
import {Group} from "../models/group.model";
import {Channel} from "../models/channel.model";
import {BehaviorSubject, catchError, map, Observable, of, tap} from "rxjs";
import {AuthService} from "./auth.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private auth: AuthService, private http: HttpClient) { }

  public currentGroup: BehaviorSubject<Group | null> = new BehaviorSubject<Group | null>(null);
  public currentChannel: BehaviorSubject<Channel | null> = new BehaviorSubject<Channel | null>(null);
  public group$ = this.currentGroup.asObservable();
  public channel$ = this.currentChannel.asObservable();
  public groups: Group[] = [];

  private readonly baseUrl: string = 'http://localhost:3000/group';

  /**
   * Gets a list of all groups that exist within the server
   */
  listGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.baseUrl}`).pipe(
      map((res: any) => {
        return res as Group[]; // Cast the response to Group[]
      }),
      tap((data) => {
        this.groups = data;
      })
    );
  }

  /**
   * Navigates to the designated group
   * @param groupId id of group to be navigated to
   */
  setGroup(groupId: string | null): void {
    this.currentGroup.next(this.groups.find(g => g._id === groupId) ?? null);

    if (groupId) {
      this.currentChannel.next(null);
      for (const channel of this.currentGroup.value!.channels) {
        if (this.canAccessChannel(channel)) {
          this.currentChannel.next(channel);
        }
      }
    }
  }

  /**
   * Creates a group (if the user has the correct permissions)
   * @param name
   * @param acronym
   */
  createGroup(name: string, acronym: string): Observable<any> {
    return this.http.post(`${this.baseUrl}`, { name, acronym }).pipe(
      tap((res: any) => {
        this.groups.push(res);
        console.log(res);
        this.setGroup(res._id);
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  /**
   * Creates a new channel within the current group
   * @param name
   */
  createChannel(name: string): Observable<any> {
    // this is placeholder while there is no API to call
    const group = this.currentGroup.value;

    // if there is a currently selected group, add the channel & update behaviour subject
    if (group) {
      return this.http.post<any>(`${this.baseUrl}/channel`, { groupId: group._id, name}).pipe(tap((data) => {
        // Find the index of the group in this.groups array
        const index = this.groups.findIndex(g => g._id === data._id);

        // If group is found, replace it with the updated data
        if (index !== -1) {
          this.groups[index] = data;
        }

        // update the current group behaviour subject
        this.currentGroup.next(data);
      }));
    }

    return of(null);
  }

  /**
   * Navigate to a specific channel within the current group
   * @param channelId id of channel to navigate to
   */
  setChannel(channelId: string | null): void {
    const channel = this.currentGroup.value?.channels.find(c => c._id === channelId);
    if (channel) {
      this.currentChannel.next(channel);
    }
  }

  /**
   * Utility method to determine if a user has access to the current group based on their role and group membership
   */
  hasAccess(): boolean {
    const group = this.currentGroup.value;
    const user = this.auth.getUser();

    const isMember = (group?.members.find(u => u._id == user._id) || group?.admins.find(u => u._id == user._id)) ?? false;

    return user.roles.includes('superAdmin') || isMember;
  }

  /**
   * Utility method to determine if a user has requested to join a group
   */
  hasRequestedAccess(): boolean {
    const group = this.currentGroup.value;
    const user = this.auth.getUser();

    return group?.pendingMembers.includes(user._id) ?? false;
  }

  /**
   * Utility method to request access to a group
   */
  requestAccess(): void {
    const group = this.currentGroup.value;
    const user = this.auth.getUser();

    group?.pendingMembers.push(user._id);
  }

  isGroupAdmin(): boolean {
    const group = this.currentGroup.value;
    const user = this.auth.getUser();

    return group?.admins.includes(user._id) ?? false;
  }

  canAccessChannel(channel: Channel) {
    const user = this.auth.getUser();

    // Super admins and Group admins can see all channels
    if (this.auth.isSuperAdmin() || this.isGroupAdmin()) {
      return true;
    }

    return channel.members.findIndex(u => u._id === user._id) >= 0;
  }
}
