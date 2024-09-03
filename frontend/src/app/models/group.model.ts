import {User} from "./user.model";

export interface Group {
  id?: string;
  name: string;
  acronym: string;
  img?: string;
  members: User[];
  admins: User[];
  pendingAdmins: User[];
  pendingMembers: User[];
}
