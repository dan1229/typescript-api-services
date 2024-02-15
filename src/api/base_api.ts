import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { BaseApiResponseHandler } from './base_api_response_handler'
import { ApiResponseDuplicate, type ApiResponse } from '../types'
import { DjangoApiResponseHandler } from './django_service/django_api_response_handler'
import DjangoApi from './django_service/django_api'

/**
 * retryIfNecessary
 * A helper/wrapper function to handle retrying requests if necessary.
 * Avoids duplicate requests within a certain time window.
 */
export async function retryIfNecessary (
  apiInstance: BaseApi | DjangoApi<any>, // Modify if needed to support specific DjangoApi types
  requestFunction: () => Promise<AxiosResponse<unknown>>,
  url: string
): Promise<any> {
  const now = Date.now()
  const lastRequestTime = BaseApi.lastRequestTimestamps[url] || 0
  const timeElapsed = now - lastRequestTime

  // Check if there is a pending request for this URL within the time window
  if (timeElapsed < apiInstance.minimumDelay) {
    console.warn('Duplicate call dropped:', url)
    return new ApiResponseDuplicate(requestFunction)
  }

  // Update the last request timestamp
  BaseApi.lastRequestTimestamps[url] = Date.now()

  // Determine the appropriate response handler based on the API instance type
  const responseHandler = apiInstance instanceof DjangoApi
    ? new DjangoApiResponseHandler(apiInstance, requestFunction())
    : new BaseApiResponseHandler(apiInstance, requestFunction())

  // Do whatever handling necessary with the response, e.g., error handling
  return await responseHandler.handleResponse()
}

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
  minimumDelay: number

  loading: boolean

  // Maintain a dictionary to store the timestamps of recent requests
  static lastRequestTimestamps: Record<string, number> = {}

  /**
   * CONSTRUCTOR
   */
  protected constructor (name: string, urlBase: string, minimumDelay: number = 5000, timeout: number = 10000) {
    // params
    this.name = name
    this.urlBase = urlBase
    this.timeout = timeout
    this.minimumDelay = minimumDelay

    // auto
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
   */
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
   */
  protected async httpGet (
    url: string,
    headers = {}
  ): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await retryIfNecessary(this,
      async () => await this.client.get(url, { headers }),
      url
    )
    this.loading = false
    return response
  }

  protected async httpPost (
    url: string,
    body: object,
    headers = {}
  ): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await retryIfNecessary(this,
      async () => await this.client.post(url, body, headers),
      url
    )
    this.loading = false
    return response
  }

  protected async httpPatch (
    url: string,
    body: object,
    headers = {}
  ): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await retryIfNecessary(this,
      async () => await this.client.patch(url, body, headers),
      url
    )
    this.loading = false
    return response
  }

  protected async httpDelete (
    url: string,
    headers = {}
  ): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await retryIfNecessary(this,
      async () => await this.client.delete(url, { headers }),
      url
    )
    this.loading = false
    return response
  }
}
