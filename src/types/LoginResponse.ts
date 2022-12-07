import {Capability} from './Capability';

export interface LoginResponse {
  customerId: string;
  customerName: string;
  userId: string;
  userName: string;
  userType: string;
  capabilities: Capability[];
  toggles: string[];
  features: string[];
  token: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
}
