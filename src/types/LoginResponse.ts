import {Profile} from './Profile';

export interface LoginResponse extends Profile {
  token: string;
}
