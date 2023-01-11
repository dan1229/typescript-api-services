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
 * @param {string} urlEndpoint - Endpoint of this URL. Should NOT include / or urlBase (i.e., "/api/").
 * @param {string} urlBase - Base URL to use - defaults to environment URL.
 * @param {number=} timeout - Default request timeout.
 */
export abstract class BaseApi {
  // parameters
  name: string;
  urlEndpoint: string;
  urlBase: string;
  timeout: number;

  /**
   * CONSTRUCTOR
   */
  protected constructor(name: string, urlBase: string, urlEndpoint: string, timeout: number = 10000) {
    this.name = name;
    this.urlBase = urlBase;
    this.urlEndpoint = urlEndpoint;
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
   * URLS
   *
   * urlApi() - full API url.
   *
   * @param {string=} slug - Param to add extra fields, id's, filters, etc.
   * @return {string} URL
   */
  protected urlApi(slug?: string): string {
    if (typeof slug == 'undefined' || slug == '') {
      return `${this.urlBase}/api/${this.urlEndpoint}/`;
    } else {
      return `${this.urlBase}/api/${this.urlEndpoint}/${slug}/`;
    }
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

  protected async httpPost<TypeBody extends object>(url: string, body: TypeBody, headers = {}): Promise<any> {
    return this.client.post(url, body, headers);
  }

  protected async httpPatch<TypeBody extends object>(url: string, body: TypeBody, headers = {}): Promise<any> {
    return await this.client.patch(url, body, headers);
  }

  protected async httpDelete(url: string, headers = {}): Promise<any> {
    return await this.client.delete(url, { headers: headers });
  }
}
