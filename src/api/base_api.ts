import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BaseApiResponseHandler } from './base_api_response_handler';
import { ApiResponseDuplicate, ApiResponse } from '../types';
import { DjangoApiResponseHandler } from './django_service/django_api_response_handler';
import DjangoApi from './django_service/django_api';

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
  name: string;
  urlBase: string;
  timeout: number;
  minimumDelay: number;
  loading: boolean;
  lastRequestTimestamps: Record<string, number>;

  /**
   * CONSTRUCTOR
   */
  protected constructor(name: string, urlBase: string, minimumDelay: number = 3000, timeout: number = 10000) {
    this.name = name;
    this.urlBase = urlBase;
    this.timeout = timeout;
    this.minimumDelay = minimumDelay;
    this.loading = false;
    this._axiosInstance = axios.create({
      baseURL: this.urlBase
    });
    this.lastRequestTimestamps = {};
  }

  cleanUrlParamString(word: string): string {
    return word.replace(/\s/g, '%20').replace(/and/gi, '%26');
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
  protected async httpGet(url: string, headers: AxiosRequestConfig['headers'] = {}): Promise<ApiResponse<unknown>> {
    this.loading = true;
    const response = await this.retryIfNecessary(async () => await this.client.get(url, { headers }), url);
    this.loading = false;
    return response;
  }

  protected async httpPost(url: string, body: object, headers: AxiosRequestConfig['headers'] = {}): Promise<ApiResponse<unknown>> {
    this.loading = true;
    const response = await this.retryIfNecessary(async () => await this.client.post(url, body, { headers }), url);
    this.loading = false;
    return response;
  }

  protected async httpPatch(url: string, body: object, headers: AxiosRequestConfig['headers'] = {}): Promise<ApiResponse<unknown>> {
    this.loading = true;
    const response = await this.retryIfNecessary(async () => await this.client.patch(url, body, { headers }), url);
    this.loading = false;
    return response;
  }

  protected async httpDelete(url: string, headers: AxiosRequestConfig['headers'] = {}): Promise<ApiResponse<unknown>> {
    this.loading = true;
    const response = await this.retryIfNecessary(async () => await this.client.delete(url, { headers }), url);
    this.loading = false;
    return response;
  }

  /**
   * retryIfNecessary
   * A helper/wrapper function to handle retrying requests if necessary.
   * Avoids duplicate requests within a certain time window.
   */
  async retryIfNecessary<T = null>(requestFunction: () => Promise<AxiosResponse>, url: string): Promise<ApiResponse<T>> {
    const now = Date.now();
    console.log("URL", url)
    const lastRequestTime = this.lastRequestTimestamps[url];
    const timeElapsed = now - (lastRequestTime || 0);

    if (timeElapsed < this.minimumDelay) {
      console.warn('Duplicate call dropped:', url);
      return new ApiResponseDuplicate(undefined); // Pass undefined as the response for a duplicate call
    }

    this.lastRequestTimestamps[url] = now;

    const responseHandler =
      this instanceof DjangoApi
        ? new DjangoApiResponseHandler<T>(this, requestFunction())
        : new BaseApiResponseHandler<T>(this, requestFunction());
        
    return await responseHandler.handleResponse();
  }
}
