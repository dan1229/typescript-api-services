import axios, { type AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { BaseApi } from '../base_api'
import { DjangoApiResponseHandler } from './django_api_response_handler'
import { ApiResponseDuplicate } from '../../types'

export type TDjangoApiMethod = 'get' | 'post' | 'patch' | 'delete'

export type TypeFilters = object | null

/**
 * DJANGO API
 *
 * Django Api abstract base class - base any API methods off of this.
 * You should never need to instantiate this class directly.
 *
 * This class is meant to be extended by any API that uses Django as a backend.
 * Then you can use the methods or store them in a new class.
 *
 * @param {string} name - API Name, primarily for logging.
 * @param {string} urlBase - Base URL to use for API requests.
 * @param {string} urlEndpoint - Endpoint of this URL. Should NOT include / or urlBase (i.e., "/api/").
 * @param {string=} token - Auth token to use.
 */
export default abstract class DjangoApi<TypeFilters extends | object | null = null> extends BaseApi {
  urlEndpoint: string
  token: string
  loading: boolean

  public constructor (name: string, urlBase: string, urlEndpoint: string, token?: string) {
    super(name, urlBase)
    if (!token) {
      token = ''
    }
    this.token = token
    this.urlEndpoint = urlEndpoint
    this.loading = false

    // setup axios client
    this._axiosInstance = axios.create({
      baseURL: this.urlBase,
      timeout: this.timeout,
      xsrfCookieName: 'csrftoken',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': Cookies.get('csrftoken') ?? ''
      }
    })
  }

  /**
   * HEADERS
   *
   * Get headers for API request - authenticated or otherwise.
   *
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to include
   * @return {AxiosRequestHeaders} Header object/map
   **/
  protected getHeaders (extraHeaders?: Record<string, unknown>): any {
    if (typeof this.token !== 'undefined' && this.token !== '') {
      return {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.token}`,
          ...extraHeaders
        }
      }
    } else {
      return { ...extraHeaders }
    }
  }

  /**
   * URLS
   *
   * urlApi() - full API url, specifically for django endpoints more specific endpoints for details and similar.
   *
   * @param {string=} id - ID of object to include
   * @return {string} URL
   */
  protected urlApi (id?: string, filters?: TypeFilters | object | undefined | null): string {
    const queryString = this.createQueryString(filters)
    let url = ''
    if (typeof id === 'undefined' || id === '') {
      url = `${this.urlBase}/api/${this.urlEndpoint}/`
    } else {
      url = `${this.urlBase}/api/${this.urlEndpoint}/${id}/`
    }

    if (queryString.length) {
      url += `?${queryString}`
    }
    return url
  }

  /**
   * _createQueryString
   * Create a query string from a filter object
   *
   * @param {TypeFilters} filters - Type object of filters to create query string from
   */
  protected createQueryString (filters?: TypeFilters | object | undefined | null): string {
    if (filters == null) {
      return ''
    }
    let queryString = ''
    const len = Object.keys(filters).length
    let i = 0
    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        if (!!key && key !== '') {
          const value = (filters as NonNullable<TypeFilters>)[key as keyof NonNullable<TypeFilters>] ?? ''
          queryString += `${key}=${value}&`
          if (i === len - 1) {
            queryString = queryString.slice(0, -1) // remove last &
          }
        }
      }
      i += 1
    }
    return queryString
  }

  /**
   * _getQueryString
   * Get a query string value from a url
   *
   * @param {string} key - Key to get value for
   */
  protected getQueryString (key: string, url: string): number {
    key = key.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
    const regex = new RegExp('[\\?&]' + key + '=([^&#]*)')
    const results = regex.exec(url)
    if (results === null || typeof results === 'undefined') {
      return 1
    }
    return Number(decodeURIComponent(results[1].replace(/\+/g, '    ')))
  }

  /**
   * RETRY IF NECESSARY
   * Drop duplicate calls integrated into the HTTP methods.
   **/
  async retryIfNecessary (
    requestFunction: () => Promise<AxiosResponse<unknown>>,
    url: string
  ): Promise<any> {
    const now = Date.now()
    const lastRequestTime = BaseApi.lastRequestTimestamps[url] || 0
    const timeElapsed = now - lastRequestTime

    const MINIMUM_DELAY = 5000 // Minimum delay between requests in milliseconds

    console.log('CALLING: ', url)

    // Check if there is a pending request for this URL within the time window
    if (timeElapsed < MINIMUM_DELAY) {
      console.log('Duplicate call dropped:', url)
      return new ApiResponseDuplicate(requestFunction)
    }

    // Update the last request timestamp
    BaseApi.lastRequestTimestamps[url] = Date.now()

    // Do whatever handling necessary with the response, e.g., error handling
    const responseHandler = new DjangoApiResponseHandler(
      this,
      requestFunction()
    )
    return await responseHandler.handleResponse()
  }
}
