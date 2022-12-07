export interface Event {
  uuid: string;
  name: string;
  eventProfileId: string;
  scheduleId: string;
  customerName: string;
  format: string;
  folderPath: string;
  bucket?: string;
  url: string;
  startTime: string;
  removeTime: string;
  cloudUrl: string;
  encoderId: string;
  eventOptions?: string;
}
