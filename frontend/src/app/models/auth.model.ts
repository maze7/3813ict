import {User} from "./user.model";

export interface AuthInfo {
  payload?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}
