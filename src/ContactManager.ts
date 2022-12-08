import {LivingAsOneClient} from './LivingAsOneClient';
import {User} from './types/User';
import {Capability} from './types/Capability';
import {Contact} from './types/Contact';

export class ContactManager {
  private static readonly contactsEndpoint = '/api_v2.svc/contacts';

  constructor(private readonly client: LivingAsOneClient) {}

  /**
   * Get list of contacts in your environment
   */
  public async getContacts(): Promise<Contact[] | void> {
    if (!this.client.hasCapability(Capability.getContacts)) return;
    const contacts = await this.client.call<Contact[]>(
      ContactManager.contactsEndpoint
    );
    return contacts || [];
  }

  /**
   * Get contact
   */
  public async getContact(id: string): Promise<Contact | void> {
    if (!this.client.hasCapability(Capability.getContacts)) return;
    return await this.client.call<Contact>(
      ContactManager.contactsEndpoint + '/' + id
    );
  }
}
