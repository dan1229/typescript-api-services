import { BaseApi } from '../base_api';
import DjangoService from './django_service';

export type TDjangoApiMethod = 'get' | 'post' | 'patch' | 'delete';

/**
 *
 * DJANGO API
 *
 * Django Api abstract base class - base any API methods off of this.
 * This class is meant to be extended by any API that uses Django as a backend.
 * Then you can use the methods or store them in a new class.
 *
 * The generic type Model is meant to represent the Django object
 * we are dealing with - User, Email, etc. - you can set to 'any'
 * if this doesn't make sense with your API/models.
 *
 * @param {string} name - API Name, primarily for logging.
 * @param {string} urlBase - Base URL to use for API requests.
 * @param {string} urlEndpoint - Endpoint of this URL. Should NOT include / or urlBase (i.e., "/api/").
 * @param {string=} token - Auth token to use.
 */
export default abstract class DjangoApi extends BaseApi {
  token: string;

  public constructor(name: string, urlBase: string, urlEndpoint: string, token?: string) {
    super(name, urlBase, urlEndpoint);
    if (!token) {
      token = '';
    }
    this.token = token;
  }

  /**
   * HEADERS
   *
   * Get headers for API request - authenticated or otherwise.
   *
   * @return {AxiosRequestHeaders} Header object/map
   **/
  protected getHeaders(): any {
    if (typeof this.token != 'undefined' && this.token != '') {
      return {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.token}`,
        },
      };
    } else {
      return {};
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
  protected urlApi<TypeFilters extends object>(id?: string, filters?: TypeFilters): string {
    const queryString = this.createQueryString(filters);
    let url = '';
    if (typeof id == 'undefined' || id == '') {
      url = `${super.urlApi()}`;
    } else {
      url = `${super.urlApi(id)}`;
    }

    if (queryString) {
      url += `?${queryString}`;
    }
    return url;
  }

  /**
   * _createQueryString
   * Create a query string from a filter object
   *
   * @param {TypeFilters} filters - Type object of filters to create query string from
   */
  protected createQueryString<TypeFilters extends object>(filters?: TypeFilters): string {
    if (!filters) {
      return '';
    }
    let queryString = '';
    const len = Object.keys(filters).length;
    let i = 0;
    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        if (!!key && key != '') {
          const value = filters[key];
          queryString += `${key}=${value}&`;
          if (i === len - 1) {
            queryString = queryString.slice(0, -1); // remove last &
          }
        }
      }
      i += 1;
    }
    return queryString;
  }

  /**
   * _getQueryString
   * Get a query string value from a url
   *
   * @param {string} key - Key to get value for
   */
  protected getQueryString(key: string, url: string): number {
    key = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
    let results = regex.exec(url);
    if (results === null || typeof results === 'undefined') {
      return 1;
    }
    return Number(decodeURIComponent(results[1].replace(/\+/g, '    ')));
  }
}
