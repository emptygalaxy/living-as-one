import {UserManager} from './UserManager';
import {EventManager} from './EventManager';
import {CueManager} from './CueManager';
import {EncoderManager} from './EncoderManager';
import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {LoginResponse} from './types/LoginResponse';
import {CookieJar} from 'tough-cookie';
import {wrapper} from 'axios-cookiejar-support';
import {Capability} from './types/Capability';
wrapper(axios);

export class LivingAsOneClient {
  public readonly users = new UserManager(this);
  public readonly events = new EventManager(this);
  public readonly cues = new CueManager(this);
  public readonly encoders = new EncoderManager(this);

  private static loginEndpoint = '/api/v3/login';

  private jar = new CookieJar();

  private _userName?: string;
  private _password?: string;
  private _customerId?: string;
  private _capabilities: Capability[] = [];

  get customerId(): string | undefined {
    return this._customerId;
  }

  public hasCapability(capability: Capability): boolean {
    return this._capabilities.includes(capability);
  }

  /**
   * Log in to your encoder
   * @param {string} userName
   * @param {string} password
   */
  public async login(userName: string, password: string) {
    this._userName = userName;
    this._password = password;

    const body = {
      userName,
      password,
    };

    const result = await this.call<LoginResponse>(
      LivingAsOneClient.loginEndpoint,
      {method: 'post', data: body},
      0
    );
    if (result) {
      this._customerId = result.customerId;
      this._capabilities = result.capabilities;

      return result;
    }
  }

  public async call<T>(
    url: string,
    config: AxiosRequestConfig = {},
    retries = 1
  ): Promise<T | void> {
    try {
      const response = await axios<T>(url, {
        jar: retries === 2 ? undefined : this.jar,
        withCredentials: true,
        baseURL: 'https://central.livingasone.com',
        headers: {
          'Content-Type': 'application/json',
        },
        ...config,
      });

      if (response) {
        // console.log(response.data);
        return response.data;
      }
    } catch (e) {
      if (e instanceof AxiosError) {
        const response = e.response;
        if (response && response.status >= 401) {
          console.log(response.status, e.message);
          if (this._userName && this._password && retries > 0) {
            const authenticated = await this.login(
              this._userName,
              this._password
            );
            if (authenticated)
              return await this.call<T>(url, config, retries - 1);
          }

          throw new Error('Unauthenticated');
        }
      }
    }
  }
}
