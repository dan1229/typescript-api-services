import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

/**
 *
 * BASE API
 *
 * Generic API interface - use this for any external service/REST APIs to simplify
 * interactions with common functions. Handles Axios, basic URL management, and similar
 * functionality.
 *
 * @param {string} name - API Name, primarily for logging.
 * @param {string} urlBase - Base URL to use - defaults to environment URL.
 * @param {number=} timeout - Default request timeout.
 */
export abstract class BaseApi {
  name: string;
  urlBase: string;
  timeout: number;

  /**
   * CONSTRUCTOR
   */
  protected constructor(name: string, urlBase: string, timeout: number = 10000) {
    console.log(urlBase);
    this.name = name;
    this.urlBase = urlBase;
    this.timeout = timeout;

    // setup axios client
    this._axiosInstance = axios.create({
      baseURL: this.urlBase,
      timeout: this.timeout,
      xsrfCookieName: 'csrftoken',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': Cookies.get('csrftoken') || '',
      },
    });
  }

  /**
   * CLIENT
   * The API Client should be defined as a `static` value on the subclass.
   **/
  _axiosInstance: AxiosInstance;

  protected get client() {
    return this._axiosInstance;
  }

  /**
   * HTTP METHODS
   *
   * Standard HTTP wrapper functions to handle basic
   * functionality, formatting, auth, sanitizing etc.
   * Automatically wrap responses in ApiResponseHandler.
   *
   * Supported methods
   * - GET, POST, PATCH, DELETE
   **/
  protected async httpGet(url: string, headers = {}): Promise<any> {
    return this.client.get(url, { headers: headers });
  }

  protected async httpPost(url: string, body: object, headers = {}): Promise<any> {
    return this.client.post(url, body, headers);
  }

  protected async httpPatch(url: string, body: object, headers = {}): Promise<any> {
    return await this.client.patch(url, body, headers);
  }

  protected async httpDelete(url: string, headers = {}): Promise<any> {
    return await this.client.delete(url, { headers: headers });
  }
}
