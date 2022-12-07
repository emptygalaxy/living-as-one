import {User} from './types/User';
import {LivingAsOneClient} from './LivingAsOneClient';
import {Capability} from './types/Capability';

export class UserManager {
  private static readonly usersEndpoint = '/api_v2.svc/users';

  constructor(private readonly client: LivingAsOneClient) {}

  /**
   * Get list of users in your environment
   */
  public async getUsers(): Promise<User[] | void> {
    if (!this.client.hasCapability(Capability.getUsers)) return;

    const users = await this.client.call<User[]>(UserManager.usersEndpoint);
    return users || [];
  }

  /**
   * Get single user
   * @param {string} userId
   */
  public async getUser(userId: string) {
    if (!this.client.hasCapability(Capability.getUsers)) return;

    const users = await this.getUsers();
    if (users) {
      return users.filter(user => user.uuid === userId)[0];
    }
  }
}
