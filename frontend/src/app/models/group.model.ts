import {User} from "./user.model";
import {Channel} from "./channel.model";

export interface Group {
  _id?: string;
  name: string;
  acronym: string;
  creator?: User;
  members: User[];
  admins: User[];
  pendingAdmins: User[];
  pendingMembers: User[];
  channels: Channel[];
}
