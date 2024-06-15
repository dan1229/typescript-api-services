import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { BaseApiResponseHandler } from './base_api_response_handler'
import { ApiResponseDuplicate, type ApiResponse } from '../types'
import { DjangoApiResponseHandler } from './django_service/django_api_response_handler'
import DjangoApi from './django_service/django_api'

/**
 * BASE API
 *
 * Generic API interface - use this for any external service/REST APIs to simplify
 * interactions with common functions. Handles Axios, basic URL management, and similar
 * functionality.
 *
 * @param {string} name - API Name, primarily for logging.
 * @param {string} urlBase - Base URL to use - defaults to environment URL.
 * @param {number=} timeout - Default request timeout.
 * @param {number=} minimumDelay - Minimum delay between requests to avoid duplicates.
 */
export abstract class BaseApi {
  name: string
  urlBase: string
  timeout: number
  minimumDelay: number
  loading: boolean

  // Maintain a dictionary to store the timestamps of recent requests
  static lastRequestTimestamps: Record<string, number> = {}

  // Maintain a dictionary to store the last successful responses
  static lastSuccessfulResponses: Record<string, AxiosResponse> = {}

  /**
   * CONSTRUCTOR
   */
  protected constructor (name: string, urlBase: string, minimumDelay: number = 1000, timeout: number = 10000) {
    this.name = name
    this.urlBase = urlBase
    this.timeout = timeout
    this.minimumDelay = minimumDelay
    this.loading = false
    this._axiosInstance = axios.create({
      baseURL: this.urlBase
    })
  }

  cleanUrlParamString (word: string): string {
    return word.replace(/\s/g, '%20').replace(/and/gi, '%26')
  }

  /**
   * CLIENT
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
  protected async httpGet (url: string, headers: AxiosRequestConfig['headers'] = {}): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await this.catchDuplicates(async () => await this.client.get(url, { headers }), url)
    this.loading = false
    return response
  }

  protected async httpPost (url: string, body: object, headers: AxiosRequestConfig['headers'] = {}): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await this.catchDuplicates(async () => await this.client.post(url, body, { headers }), url)
    this.loading = false
    return response
  }

  protected async httpPatch (url: string, body: object, headers: AxiosRequestConfig['headers'] = {}): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await this.catchDuplicates(async () => await this.client.patch(url, body, { headers }), url)
    this.loading = false
    return response
  }

  protected async httpDelete (url: string, headers: AxiosRequestConfig['headers'] = {}): Promise<ApiResponse<unknown>> {
    this.loading = true
    const response = await this.catchDuplicates(async () => await this.client.delete(url, { headers }), url)
    this.loading = false
    return response
  }

  /**
   * catchDuplicates
   * A helper/wrapper function to handle retrying requests if necessary.
   * Avoids duplicate requests within a certain time window.
   */
  async catchDuplicates<T = null>(requestFunction: () => Promise<AxiosResponse>, urlToCall: string): Promise<ApiResponse<T>> {
    const now = Date.now();
    // this accounts for both the page the URL is called on and the URL itself
    // that way if a user is changing pages, the following ID is different and
    // the request will go through
    const pageUrlId = `${urlToCall}`;
    const lastRequestTime = BaseApi.lastRequestTimestamps[pageUrlId] || 0;
    const timeElapsed = now - lastRequestTime;

    // Check if this request is a duplicate
    if (timeElapsed < this.minimumDelay) {
      // Return the last successful response if available
      console.log('duplicate request')
      console.log('last successful response', BaseApi.lastSuccessfulResponses[pageUrlId])
      if (BaseApi.lastSuccessfulResponses[pageUrlId]) {
        return new ApiResponseDuplicate<T>(
          BaseApi.lastSuccessfulResponses[pageUrlId].data,
        );
      }
      // If no last successful response is available, return an ApiResponseDuplicate
      return new ApiResponseDuplicate();
    }

    console.log('setting last request timestamp')
    // Update the last request timestamp
    BaseApi.lastRequestTimestamps[pageUrlId] = now;

    // Execute the request function and handle the response
    const response = await requestFunction();

    // Store the last successful response
    console.log('storing last successful response')
    BaseApi.lastSuccessfulResponses[pageUrlId] = response;

    // Return the response
    const responseHandler =
      this instanceof DjangoApi
        ? new DjangoApiResponseHandler<T>(this, Promise.resolve(response))
        : new BaseApiResponseHandler<T>(this, Promise.resolve(response));
    return await responseHandler.handleResponse();
  }
}
