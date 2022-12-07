export interface Encoder {
  uuid: string;
  name: string;
  customerId: string;
  serialNumber: string;
  status?: string;
  operationalState: string;
  model: string;
  lanModeCapable: boolean;
  lanModeEnabled: boolean;
  requestedVideoInputSource: string;
  encoderProfile: EncoderProfile;
  streamProfile: StreamProfile;
  encoderVersion: string;
  timestamp?: string;
  lastUpdate?: string;
  targetVersion?: string;
  updateRequired: boolean;
  connectionReset: boolean;
  eventOptions?: null;
  requestedStatus: string;
}

export interface EncoderProfile {
  uuid: string;
  name: string;
  ffmpegOptions: string;
  audioOptions: string;
  videoOptions: string;
  mapOptions: string;
  inputOptions: string;
  customProfile: boolean;
  minSegmentDurationSeconds?: number;
  dashOptions?: string;
}

export interface StreamProfile {
  uuid: string;
  bucket: string;
  name: string;
  description: string;
  deleteAfter: number;
  lanOnly: boolean;
  regionId?: string;
}
