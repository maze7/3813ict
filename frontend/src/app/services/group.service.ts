import { Injectable } from '@angular/core';
import {Group} from "../models/group.model";
import {Channel} from "../models/channel.model";
import {BehaviorSubject, catchError, map, Observable, of, tap} from "rxjs";
import {AuthService} from "./auth.service";
import {HttpClient} from "@angular/common/http";
import {User} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private auth: AuthService, private http: HttpClient) {
  }

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
   * Update the local group with a returned group struct from the API
   * @param group
   */
  updateGroup(group: Group): void {
    const groupIndex = this.groups.findIndex(g => g._id === group._id);

    // delete existing group from groups array
    if (groupIndex !== -1) {
      this.groups.splice(groupIndex, 1);
    }

    // update group in groups array
    this.groups.push(group);
    this.currentGroup.next(group);
  }

  /**
   * Save a group on the backend
   * @param group the group to be saved
   */
  saveGroup(group: Group): Observable<any> {
    return this.http.put(`${this.baseUrl}/${group._id}`, group);
  }

  /**
   * Creates a group (if the user has the correct permissions)
   * @param name
   * @param acronym
   */
  createGroup(name: string, acronym: string): Observable<any> {
    return this.http.post(`${this.baseUrl}`, {name, acronym}).pipe(
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
   * Delete a group
   * @param group
   */
  deleteGroup(group: Group): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${group._id}`).pipe(
      tap((res) => {
        this.groups = this.groups.filter(g => g._id !== group._id);

        // Optionally clear the current group if it is the one being deleted
        if (this.currentGroup.value?._id === group._id) {
          this.currentGroup.next(null);
          this.currentChannel.next(null); // Clear current channel as well
        }
      }),
      catchError(err => {
        console.error('Error deleting group:', err);
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
      return this.http.post<any>(`${this.baseUrl}/${group._id}/channel`, { name }).pipe(tap((data) => {
        // Find the index of the group in this.groups array
        const index = this.groups.findIndex(g => g._id === data._id);

        // If group is found, replace it with the updated data
        if (index !== -1) {
          this.groups[index] = data;
        }

        // update the current group behaviour subject
        this.updateGroup(data);
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
    return this.currentGroup.value?.pendingMembers.findIndex(u => u._id === this.auth.getUser()._id) !== -1;
  }

  /**
   * Utility method to request access to a group
   */
  join(): Observable<any> {
    const group = this.currentGroup.value!;
    const user = this.auth.getUser();

    return this.http.post<any>(`${this.baseUrl}/${group._id}/join`, {}).pipe(
      tap((res: any) => {
        if (res.status) {
          group.pendingMembers.push(user);
          this.updateGroup(group);
        }
      })
    );
  }

  /**
   * Returns true or false as to whether the current user is an admin for the current group
   */
  isGroupAdmin(): boolean {
    const group = this.currentGroup.value;
    const user = this.auth.getUser();

    return this.auth.isSuperAdmin() || (group?.admins.includes(user._id) ?? false);
  }

  /**
   * Returns true or false whether the authenticated user can access the given channel
   * @param channel
   */
  canAccessChannel(channel: Channel): boolean {
    const user = this.auth.getUser();

    // Super admins and Group admins can see all channels
    if (this.isGroupAdmin()) {
      return true;
    }

    return channel.members.findIndex(u => u._id === user._id) >= 0;
  }

  /**
   * Kicks a user from a Group or Channel. Optionally bans them from the Group
   * @param user user to be kicked / banned
   * @param channel if provided, user will only be kicked from the specified channel (unless banned)
   * @param ban if true, user will be banned from server
   */
  kick(user: User, channel?: Channel, ban: boolean = false): Observable<any> {
    const group = this.currentGroup.value!;

    return this.http.post<any>(`${this.baseUrl}/${group._id}/kick`, {
      userId: user._id,
      channelId: channel?._id,
      ban,
    }).pipe(
      tap((res: any) => {
        this.updateGroup(res);
        this.currentChannel.next(res.channels.find((c: Channel) => c._id === channel?._id));
      })
    );
  }

  /**
   * Accept or Decline a user's request to join a group
   * @param user user to be added / declined
   * @param group group the user wishes to join
   * @param decision accept or decline status
   */
  accept(user: User, group: Group, decision: boolean): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${group._id}/accept`, { userId: user._id, decision }).pipe(
      tap((res) => {
        group.pendingMembers = group.pendingMembers.filter(u => u._id !== user._id);
        if (res.status) {
          group.members.push(user);
        }

        this.updateGroup(group);
      })
    )
  }

  /**
   * Add a user to a group or a specific channel within the group.
   * @param groupId The ID of the group
   * @param userId The ID of the user to be added
   * @param channelId Optional: The ID of the channel (if user is being added to a specific channel)
   * @returns An observable of the updated group data
   */
  addUser(groupId: string, userId: string, channelId?: string): Observable<Group> {
    const url = `${this.baseUrl}/${groupId}/add-user`;
    const payload = { userId, channelId };

    return this.http.post<Group>(url, payload).pipe(
      tap((updatedGroup) => {
        this.updateGroup(updatedGroup);

        // Update the current channel if the user was added to a specific channel
        if (channelId) {
          const channel = updatedGroup.channels.find((c: Channel) => c._id === channelId);
          this.currentChannel.next(channel || null);
        }
      })
    );
  }

  /**
   * Promote or Demote a user to Group Admin within the group
   * @param user the user to be promoted / demoted
   * @param group the group
   * @param status the admin status of the user
   * @returns An observable of the updated group data
   */
  setAdmin(user: User, group: Group, status: boolean): Observable<Group> {
    const url = `${this.baseUrl}/${group._id}/admin`;
    const payload = { userId: user._id, status };

    return this.http.post<Group>(url, payload).pipe(
      tap((updatedGroup) => {
        this.updateGroup(updatedGroup);
      })
    );
  }
}
