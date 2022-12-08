export interface Contact {
  uuid: string;
  first: string;
  last: string;
  email?: string;
  mobile: string;
  sendBillingAlerts: boolean;
  sendStreamingAlerts: boolean;
  url: string;
  title: string;
  notes?: string;
  userId?: string;
}
