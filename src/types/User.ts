export interface User {
  uuid: string;
  userName: string;
  planId: string;
  planName: string;
  address?: string;
  active: boolean;
  passwordResetRequired: boolean;
  emailVerified: boolean;
  notes?: string;
  passwordResetToken?: string;
}
