import {Capability} from './Capability';

export interface Profile {
  customerId: string;
  customerName: string;
  userId: string;
  userName: string;
  userType: string;
  capabilities: Capability[];
  toggles: string[];
  features: string[];
  emailVerified: boolean;
  firstName: string;
  lastName: string;
}
