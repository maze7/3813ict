export interface User {
  _id?: string;
  username: string;
  email: string;
  id: string;
  avatar?: string;
  roles: string[];
  banned: boolean;
  flagged: boolean;
}
