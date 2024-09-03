import {User} from "./user.model";
import {Channel} from "./channel.model";

export interface Group {
  id?: string;
  name: string;
  acronym: string;
  img?: string;
  members: User[];
  admins: User[];
  pendingAdmins: User[];
  pendingMembers: User[];
  channels: Channel[];
}
