import {LivingAsOneClient} from './LivingAsOneClient';
import {Event} from './types/Event';
import {Capability} from './types/Capability';

export class EventManager {
  constructor(private readonly client: LivingAsOneClient) {}

  public async getEvents() {
    if (!this.client.hasCapability(Capability.getEvents)) return;

    return this.client.call<Event[]>(
      `/api/v3/customers/${this.client.customerId}/events`
    );
  }

  public async getLiveEvent() {
    if (!this.client.hasCapability(Capability.getEvents)) return;

    let events = await this.getEvents();
    if (events) {
      events = this.sortByDate(events);

      const now = new Date();
      for (const i in events) {
        const event = events[i];
        const start = new Date(event.startTime);

        if (start.getTime() < now.getTime()) {
          return event;
        }
      }
    }
  }

  private sortByDate(events: Event[]): Event[] {
    return events.sort((a, b) => {
      return (
        EventManager.UTCDate(a.startTime).getTime() -
        EventManager.UTCDate(b.startTime).getTime()
      );
    });
  }

  /**
   * Convert timezone-less date to UTC date
   * @private
   * @param {string} str
   * @returns {Date}
   */
  private static UTCDate(str: string): Date {
    return new Date(str + '+0000');
  }
}
