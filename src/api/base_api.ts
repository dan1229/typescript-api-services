import axios, { type AxiosInstance } from 'axios'
import { BaseApiResponseHandler } from './base_api_response_handler'
import { type ApiResponse } from '../types'

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
  loading: boolean

  /**
   * CONSTRUCTOR
   */
  protected constructor (name: string, urlBase: string, timeout: number = 10000) {
    this.name = name
    this.urlBase = urlBase
    this.timeout = timeout
    this.loading = false

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
  protected async httpGet<T> (url: string, headers = {}): Promise<ApiResponse<T>> {
    this.loading = true
    const responseHandler = new BaseApiResponseHandler<T>(this, this.client.get(url, { headers }))
    const response = await responseHandler.handleResponse()
    this.loading = false
    return response
  }

  protected async httpPost<T> (url: string, body: object, headers = {}): Promise<ApiResponse<T>> {
    this.loading = true
    const responseHandler = new BaseApiResponseHandler<T>(this, this.client.post(url, body, headers))
    const response = await responseHandler.handleResponse()
    this.loading = false
    return response
  }

  protected async httpPatch<T> (url: string, body: object, headers = {}): Promise<ApiResponse<T>> {
    this.loading = true
    const responseHandler = new BaseApiResponseHandler<T>(this, this.client.patch(url, body, headers))
    const response = await responseHandler.handleResponse()
    this.loading = false
    return response
  }

  protected async httpDelete<T> (url: string, headers = {}): Promise<ApiResponse<T>> {
    this.loading = true
    const responseHandler = new BaseApiResponseHandler<T>(this, this.client.delete(url, { headers }))
    const response = await responseHandler.handleResponse()
    this.loading = false
    return response
  }
}
