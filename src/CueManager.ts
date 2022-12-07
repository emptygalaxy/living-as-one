import {LivingAsOneClient} from './LivingAsOneClient';
import {Cue} from './types/Cue';
import {CreateChangeCue} from './types/CreateChangeCue';
import {Capability} from './types/Capability';

export class CueManager {
  private static readonly streamProfilesEndpoint =
    '/api_v2.svc/streamprofiles/';

  /** Time offset for live cues */
  private offset = 0;

  constructor(private readonly client: LivingAsOneClient) {}

  /**
   * Set time offset for setting live cues
   * @param {number} offset - Offset in seconds
   */
  public setOffset(offset: number): number {
    return (this.offset = offset);
  }

  public formulateUrl(eventProfileId: string, eventId: string, cueId?: string) {
    return (
      `${CueManager.streamProfilesEndpoint}${eventProfileId}/events/${eventId}/cues` +
      (cueId ? '/' + cueId : '')
    );
  }

  public async getCues(eventId: string) {
    if (!this.client.hasCapability(Capability.getCues)) return;

    return this.client.call<Cue[]>(
      this.formulateUrl(this.client.customerId || '', eventId)
    );
  }

  public async createCue(
    eventProfileId: string | undefined,
    eventId: string,
    name: string,
    position: string,
    shared: boolean
  ) {
    if (!this.client.hasCapability(Capability.addCues)) return;

    if ((eventProfileId === null || !shared) && this.client.customerId)
      eventProfileId = this.client.customerId;

    const cue: CreateChangeCue = {
      name,
      position,
    };

    await this.client.call(this.formulateUrl(eventProfileId || '', eventId), {
      method: 'post',
      data: cue,
    });
  }

  public async createLiveCue(name: string, shared = false) {
    const now = new Date();
    const liveEvent = await this.client.events.getLiveEvent();
    if (liveEvent) {
      const start = new Date(liveEvent.startTime);
      const difference = now.getTime() - start.getTime() + this.offset;
      const dif = new Date(difference);
      const position = this.formatTime(dif);

      return await this.createCue(
        liveEvent.eventProfileId,
        liveEvent.uuid,
        name,
        position,
        shared
      );
    }
  }

  public async updateCue(
    eventId: string,
    cueId: string,
    name: string,
    position: string
  ) {
    if (!this.client.hasCapability(Capability.updateCues)) return;

    const cue: CreateChangeCue = {
      name,
      position,
    };

    await this.client.call(
      this.formulateUrl(this.client.customerId || '', eventId, cueId),
      {
        method: 'patch',
        data: cue,
      }
    );
  }

  public async deleteCue(eventId: string, cueId: string) {
    if (!this.client.hasCapability(Capability.deleteCues)) return;

    await this.client.call(
      this.formulateUrl(this.client.customerId || '', eventId, cueId),
      {
        method: 'delete',
      }
    );
  }

  public async deleteUnsharedCues() {
    if (!this.client.hasCapability(Capability.deleteCues)) return;

    const liveEvent = await this.client.events.getLiveEvent();

    if (liveEvent) {
      const cues = await this.getCues(liveEvent.uuid);
      if (cues) {
        const l = cues.length;
        for (let i = 0; i < l; i++) {
          const cue = cues[i];

          if (cue.privateCue) {
            await this.deleteCue(liveEvent.uuid, cue.uuid);
          }
        }
      }
    }
  }

  /**
   * Format a number with leading zeros
   * @private
   * @param {number|string} value
   * @param {int} length
   * @returns {string}
   */
  public leadingZeros(value: number | string, length = 2) {
    value = value.toString();
    for (let i = value.length; i < length; i++) value = '0' + value;

    return value.toString();
  }

  /**
   * Format a time as string value
   * @param {Date} date
   * @returns {string}
   */
  public formatTime(date: Date) {
    return [
      [
        this.leadingZeros(date.getUTCHours()),
        this.leadingZeros(date.getUTCMinutes()),
        this.leadingZeros(date.getUTCSeconds()),
      ].join(':'),
      this.leadingZeros(date.getUTCMilliseconds(), 3),
    ].join('.');
  }
}
