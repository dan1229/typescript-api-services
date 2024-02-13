import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

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
  name: string
  urlBase: string
  timeout: number

  /**
   * CONSTRUCTOR
   */
  protected constructor (name: string, urlBase: string, timeout: number = 10000) {
    this.name = name
    this.urlBase = urlBase
    this.timeout = timeout

    // setup axios client
    this._axiosInstance = axios.create({
      baseURL: this.urlBase
    })
  }

  cleanUrlParamString (word: string): string {
    return word.replace(/\s/g, '%20').replace(/and/gi, '%26')
  }

  /**
   * CLIENT
   * The API Client should be defined as a `static` value on the subclass.
   **/
  _axiosInstance: AxiosInstance

  protected get client (): AxiosInstance {
    return this._axiosInstance
  }

  /**
   * HTTP METHODS
   *
   * Standard HTTP wrapper functions to handle basic
   * functionality, formatting, auth, sanitizing etc.
   *
   * Supported methods
   * - GET, POST, PATCH, DELETE
   **/
  protected async httpGet (url: string, headers = {}): Promise<AxiosResponse> {
    return await this.client.get(url, { headers })
  }

  protected async httpPost (url: string, body: object, headers = {}): Promise<AxiosResponse> {
    return await this.client.post(url, body, headers)
  }

  protected async httpPatch (url: string, body: object, headers = {}): Promise<AxiosResponse> {
    return await this.client.patch(url, body, headers)
  }

  protected async httpDelete (url: string, headers = {}): Promise<AxiosResponse> {
    return await this.client.delete(url, { headers })
  }
}
