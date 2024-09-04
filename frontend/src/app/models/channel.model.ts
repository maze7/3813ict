import {User} from "./user.model";

export interface Channel {
  _id: string;
  name: string;
  members: User[];
}
