import axios, { AxiosRequestConfig, type AxiosInstance, type AxiosResponse, AxiosRequestHeaders } from 'axios'
import { BaseApiResponseHandler } from './base_api_response_handler'
import { ApiResponseDuplicate, type ApiResponse } from '../types'
import { DjangoApiResponseHandler } from './django_service/django_api_response_handler'
import DjangoApi from './django_service/django_api'

/**
 * retryIfNecessary
 * A helper/wrapper function to handle retrying requests if necessary.
 * Avoids duplicate requests within a certain time window.
 */
export async function retryIfNecessary<Model>(
  apiInstance: BaseApi | DjangoApi<Model>,
  requestFunction: () => Promise<AxiosResponse<Model>>,
  url: string,
): Promise<ApiResponse<Model>> {
  // Generate a unique identifier based on the URL and request config
  const uniqueIdentifier = url + JSON.stringify(BaseApi.client.defaults);

  const now = Date.now();
  const lastRequestTime = BaseApi.lastRequestTimestamps[uniqueIdentifier] || 0;
  const timeElapsed = now - lastRequestTime;

  if (timeElapsed < apiInstance.minimumDelay) {
    console.warn('Duplicate call dropped:', url);
    return new ApiResponseDuplicate<Model>(requestFunction);
  }

  BaseApi.lastRequestTimestamps[uniqueIdentifier] = Date.now();
  console.debug("Calling", url, "at", new Date().toISOString())

  const responseHandler =
    apiInstance instanceof DjangoApi
      ? new DjangoApiResponseHandler<Model>(apiInstance, requestFunction())
      : new BaseApiResponseHandler<Model>(apiInstance, requestFunction());

  return await responseHandler.handleResponse();
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
  protected constructor (name: string, urlBase: string, minimumDelay: number = 3000, timeout: number = 10000) {
    // params
    this.name = name
    this.urlBase = urlBase
    this.timeout = timeout
    this.minimumDelay = minimumDelay

    // auto
    this.loading = false

    // setup axios client
    BaseApi.axiosInstance = axios.create({
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
  static axiosInstance: AxiosInstance

  static get client (): AxiosInstance {
    return BaseApi.axiosInstance
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
  protected async httpGet (url: string, headers = {}): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await retryIfNecessary(this, async () => await BaseApi.client.get(url, { headers }), url)
    this.loading = false
    return response
  }

  protected async httpPost (url: string, body: object, headers = {}): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await retryIfNecessary(this, async () => await BaseApi.client.post(url, body, headers), url)
    this.loading = false
    return response
  }

  protected async httpPatch (url: string, body: object, headers = {}): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await retryIfNecessary(this, async () => await BaseApi.client.patch(url, body, headers), url)
    this.loading = false
    return response
  }

  protected async httpDelete (url: string, headers = {}): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await retryIfNecessary(this, async () => await BaseApi.client.delete(url, { headers }), url)
    this.loading = false
    return response
  }
}
