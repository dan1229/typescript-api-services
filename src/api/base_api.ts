import axios, { AxiosInstance } from 'axios';
import { BaseApiResponseHandler } from './base_api_response_handler';
import { ApiResponse } from '../types';

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
  loading: boolean;

  // Maintain a dictionary to store the timestamps of recent requests
  lastRequestTimestamps: { [url: string]: number } = {};

  /**
   * CONSTRUCTOR
   */
  protected constructor(name: string, urlBase: string, timeout: number = 10000) {
    this.name = name;
    this.urlBase = urlBase;
    this.timeout = timeout;
    this.loading = false;

    // setup axios client
    this._axiosInstance = axios.create({
      baseURL: this.urlBase,
    });
  }

  cleanUrlParamString(word: string): string {
    return word.replace(/\s/g, '%20').replace(/and/gi, '%26');
  }

  /**
   * CLIENT
   * The API Client should be defined as a `static` value on the subclass.
   */
  _axiosInstance: AxiosInstance;

  protected get client(): AxiosInstance {
    return this._axiosInstance;
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
  protected async httpGet<T>(
    url: string,
    headers = {}
  ): Promise<ApiResponse<T>> {
    this.loading = true;
    const response = await this.retryIfNecessary<T>(
      () => this.client.get(url, { headers }),
      url
    );
    this.loading = false;
    return response;
  }

  protected async httpPost<T>(
    url: string,
    body: object,
    headers = {}
  ): Promise<ApiResponse<T>> {
    this.loading = true;
    const response = await this.retryIfNecessary<T>(
      () => this.client.post(url, body, headers),
      url
    );
    this.loading = false;
    return response;
  }

  protected async httpPatch<T>(
    url: string,
    body: object,
    headers = {}
  ): Promise<ApiResponse<T>> {
    this.loading = true;
    const response = await this.retryIfNecessary<T>(
      () => this.client.patch(url, body, headers),
      url
    );
    this.loading = false;
    return response;
  }

  protected async httpDelete<T>(
    url: string,
    headers = {}
  ): Promise<ApiResponse<T>> {
    this.loading = true;
    const response = await this.retryIfNecessary<T>(
      () => this.client.delete(url, { headers }),
      url
    );
    this.loading = false;
    return response;
  }

  /**
   * Retry If Necessary
   * Retry the request only if enough time has passed since the last request
   */
 async retryIfNecessary<T>(
    requestFunction: () => Promise<any>,
    url: string
  ): Promise<ApiResponse<T>> {
    const now = Date.now();
    const lastRequestTime = this.lastRequestTimestamps[url] || 0;
    const timeElapsed = now - lastRequestTime;

    const MINIMUM_DELAY = 5000; // Minimum delay between requests in milliseconds

    if (timeElapsed < MINIMUM_DELAY) {
      // If not enough time has passed, wait before retrying
      await new Promise((resolve) => setTimeout(resolve, MINIMUM_DELAY - timeElapsed));
    }

    // Update the last request timestamp
    this.lastRequestTimestamps[url] = Date.now();

    const responseHandler = new BaseApiResponseHandler<T>(
      this,
      requestFunction()
    );
    return await responseHandler.handleResponse();
  }
}
