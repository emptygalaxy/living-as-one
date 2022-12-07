import {LivingAsOneClient} from './LivingAsOneClient';
import {Encoder} from './types/Encoder';
import {Capability} from './types/Capability';

export class EncoderManager {
  private static readonly encodersEndpoint = '/api_v2.svc/encoders';

  constructor(private readonly client: LivingAsOneClient) {}

  public async getEncoders() {
    if (!this.client.hasCapability(Capability.getEncoders)) return;

    return await this.client.call<Encoder[]>(EncoderManager.encodersEndpoint);
  }
}
