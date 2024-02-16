import axios from 'axios'
import Cookies from 'js-cookie'
import { BaseApi } from '../base_api'

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
export default abstract class DjangoApi<TypeFilters extends object | null = null> extends BaseApi {
  urlEndpoint: string
  token: string

  public constructor (
    name: string,
    urlBase: string,
    urlEndpoint: string,
    token?: string,
    minimumDelay: number = 1000,
    timeout: number = 10000
  ) {
    super(name, urlBase, timeout, minimumDelay)
    if (!token) {
      token = ''
    }
    // params
    this.token = token
    this.urlEndpoint = urlEndpoint

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
  protected getHeaders (extraHeaders?: Record<string, unknown>): Record<string, unknown> {
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
}
