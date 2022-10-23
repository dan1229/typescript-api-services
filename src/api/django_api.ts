import { BaseApi } from './base_api';
import { ApiResponseHandler } from '../api_response_handler';
import { ApiResponse } from '../types';
import { AxiosRequestHeaders } from 'axios';

/**
 *
 * DJANGO API
 *
 * Django Api base class - use this for any Django Rest APIs
 * This handles common functionality like authentication and
 * formatting specific request types.
 *
 * The generic type T is meant to represent the Django object
 * we are dealing with - User, Post, etc. - can set to 'any'
 * if this doesn't make sense with your API/models.
 *
 * @param {string} name - API Name, primarily for logging.
 * @param {string} urlBase - Base URL to use for API requests.
 * @param {string} urlEndpoint - Endpoint of this URL. Should NOT include / or urlBase (i.e., "/api/").
 * @param {string=} token - Auth token to use.
 */
export class DjangoApi<Model> extends BaseApi {
  // token
  token: string;

  // paginated api elements
  list?: Model[];
  details?: Model;
  count?: number;
  next?: string;
  prev?: string;
  pageCurrent = 1;
  pageTotal = 1;

  /**
   * CONSTRUCTOR
   */
  public constructor(name: string, urlBase: string, urlEndpoint: string, token?: string) {
    super(name, urlBase, urlEndpoint);
    if (typeof token === 'undefined') {
      token = '';
    }
    this.token = token;
    this.list = [];
  }

  /**
   * COPY FROM
   *
   * Copy API info from another `DjangoApi` class to create a new instance
   *
   * @param {DjangoApi<Model>} api - API to copy to this current instance
   * @return {DjangoApi<Model>} API object created/copied
   */
  copyFrom(api: DjangoApi<Model>): DjangoApi<Model> {
    // base properties
    this.name = api['name'];
    this.urlEndpoint = api['urlEndpoint'];
    this.urlBase = api['urlBase'];
    this.timeout = api['timeout'];
    // django properties
    this.token = api['token'];
    this.list = api['list'];
    this.details = api['details'];
    this.count = api['count'];
    this.next = api['next'];
    this.prev = api['prev'];
    this.pageCurrent = api['pageCurrent'];
    this.pageTotal = api['pageTotal'];
    return this;
  }

  /**
   * HEADERS
   *
   * Get headers for API request - authenticated or otherwise.
   *
   * @return {AxiosRequestHeaders} Header object/map
   **/
  getHeaders(): any {
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
  urlApi<TypeFilters extends object>(id?: string, filters?: TypeFilters): string {
    const queryString = this._createQueryString(filters);
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

  _createQueryString<TypeFilters extends object>(filters?: TypeFilters): string {
    /**
     * _createQueryString
     * Create a query string from a filter object
     *
     * @param {TypeFilters} filters - Object of filters to create query string from
     */
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

  _getQueryString(key: string, url: string): number {
    /**
     * _getQueryString
     * Get a query string value from a url
     *
     * @param {string} key - Key to get value for
     */
    key = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
    let results = regex.exec(url);
    if (results === null || typeof results === 'undefined') {
      return 1;
    }
    return Number(decodeURIComponent(results[1].replace(/\+/g, '    ')));
  }

  /**
   * getList
   *
   * GET Django list from this API
   *
   *
   * @param {Boolean=} paginated - Treat this API result like a paginated one (i.e., it contains 'next', 'prev', etc.)
   * @param {TypeBody=} body - Body to send with request
   * @param {TypeFilters=} filters - Filters to send with request
   * @return {ApiResponse} Api response object
   */
  async getList<TypeBody extends object, TypeFilters extends object>(
    paginated: Boolean = true,
    filters?: TypeFilters
  ): Promise<ApiResponse<Model[]>> {
    const responseHandler = new ApiResponseHandler(this, this.httpGet(this.urlApi(undefined, filters)));
    return this.handleDjangoGet(responseHandler, paginated);
  }

  /**
   * getList
   *
   * GET Django list from this API for ALL pages if paginated
   *
   * @returns {Array} List of all objects paginated out
   */
  async getListAll(): Promise<Model[]> {
    let res = [];
    const first = await this.getList();
    res = first.obj || [];
    let pages = 1;
    while (typeof this.next != 'undefined' && this.next != null && this.next != '') {
      pages += 1;
      const nextPage = await this.getNext();
      if (typeof nextPage !== 'undefined') {
        let nextList = nextPage.obj;
        if (!!nextList && nextList.length > 0) {
          nextList.map(function (i: any) {
            return res.push(i);
          });
        }
      }
    }
    this.pageTotal = pages;
    return res;
  }

  /**
   * getRetrieve
   *
   * Django GET item and details
   *
   * @param {string=} id - ID of object to retrieve
   * @param {Boolean=} paginated - Treat this API result like a paginated one (i.e., it contains 'next', 'prev', etc.)
   * @param {TypeBody=} body - Body to send with request
   * @param {TypeFilters=} filters - Filters to send with request
   * @return {ApiResponse} Api response object
   */
  async getRetrieve<TypeBody extends object, TypeFilters extends object>(
    id: string,
    paginated: Boolean = false,
    filters?: TypeFilters
  ): Promise<ApiResponse<Model | Model[]>> {
    const responseHandler = new ApiResponseHandler(this, this.httpGet(this.urlApi(id, filters)));
    return this.handleDjangoGet(responseHandler, paginated);
  }

  /**
   * HANDLE PAGINATED RESPONSE
   *
   * Handle response from Django paginated API
   * Handles 'next', 'prev', 'count', etc. and
   * this API data
   *
   * @param {ApiResponseHandler} responseHandler - response handler containing request to make
   * @param {Boolean=} combineLists - Whether to add next page to the current list or replace it
   * @return {ApiResponse} Api response object
   */
  async handlePaginatedResponse(
    responseHandler: ApiResponseHandler,
    combineLists: Boolean = false
  ): Promise<ApiResponse<Model[]>> {
    const res = await responseHandler.handleResponse();

    try {
      this.count = res.response.data.count;
      this.next = res.response.data.next;
      this.prev = res.response.data.previous;

      if (!combineLists) {
        this.list = res.obj;
      } else {
        let tmp = <any>[];
        for (let i = 0; i < this.list?.length!; i++) {
          tmp.push(this.list![i]);
        }
        for (let i = 0; i < res.obj?.length!; i++) {
          tmp.push(res.obj![i]);
        }
        this.list = tmp;
      }
      this.calculatePageCurrent();
    } catch (e) {
      console.error(e);
    }
    return res;
  }

  async handleDjangoGet<Model>(responseHandler: ApiResponseHandler, paginated: Boolean) {
    // helper function to clean up get and retrieve methods
    if (!paginated) {
      const res = await responseHandler.handleResponse();
      try {
        this.details = res.obj;
        if (res.obj instanceof Array) {
          this.list = res.obj;
        } else {
          this.details = res.obj;
        }
      } catch (e) {
        console.error(e);
      }
      return res;
    } else {
      this.calculatePageTotal(); // this should only be called during the initial call NOT during any next/prev calls
      return await this.handlePaginatedResponse(responseHandler);
    }
  }

  /**
   * getNext
   * @param {Boolean=} combineLists - Whether to add next page to the current list or replace it
   * @return {ApiResponse} Api response object
   */
  async getNext(combineLists: Boolean = false): Promise<ApiResponse<Model[]> | undefined> {
    if (typeof this.next != 'undefined') {
      const responseHandler = new ApiResponseHandler(this, this.httpGet(this.next));
      return await this.handlePaginatedResponse(responseHandler, combineLists);
    }
  }

  /**
   * getPrev
   * @param {Boolean=} combineLists - Whether to add next page to the current list or replace it
   * @return {ApiResponse} Api response object
   */
  async getPrev(combineLists: Boolean = false): Promise<ApiResponse<Model[]> | undefined> {
    if (typeof this.prev != 'undefined') {
      const responseHandler = new ApiResponseHandler(this, this.httpGet(this.prev));
      return await this.handlePaginatedResponse(responseHandler, combineLists);
    }
  }

  /**
   * getPage
   * @param {Number} page - Specific page number to retrieve
   * @return {ApiResponse} Api response object
   */
  async getPage(page: number): Promise<ApiResponse<Model[]>> {
    const pageUrl = `${this.urlApi()}?page=${page}`;
    const responseHandler = new ApiResponseHandler(this, this.httpGet(pageUrl));
    return await this.handlePaginatedResponse(responseHandler);
  }

  /**
   * PAGINATION HELPERS
   */
  calculatePageCurrent() {
    if (typeof this.next != 'undefined' && this.next != null) {
      let num = Number(this._getQueryString('page', this.next)) || 2;
      this.pageCurrent = num - 1;
    } else if (typeof this.prev != 'undefined' && this.prev != null) {
      let num = Number(this._getQueryString('page', this.prev)) || 0;
      this.pageCurrent = num + 1;
    }
  }

  calculatePageTotal() {
    if (typeof this.list != 'undefined') {
      if (this.list?.length > 0 && typeof this.count != 'undefined') {
        let pageTotal = Math.floor(this.count / this.list?.length);
        let remainder = this.count % this.list?.length;
        if (remainder != 0) {
          pageTotal++;
        }
        this.pageTotal = pageTotal;
      }
    }
  }

  /**
   * patchUpdate
   *
   * PATCH request to Django to update an object.
   *
   * @param {string} id - ID of object to update
   * @param {Object} body - Body of request to include, probably the object data
   * @return {ApiResponse} Api response object
   */
  async patchUpdate(id: string, body: Object): Promise<ApiResponse<Model>> {
    const responseHandler = new ApiResponseHandler(this, this.httpPatch(this.urlApi(id), body));
    const res = await responseHandler.handleResponse();
    try {
      this.details = res.obj;
    } catch (e) {
      console.error(e);
    }
    return res;
  }

  /**
   * postCreate
   *
   * POST request to Django to create an object.
   *
   * @param {Object} body - Body of request to include, probably the object data
   * @return {ApiResponse} Api response object
   */
  async postCreate(body: Object): Promise<ApiResponse<Model>> {
    const responseHandler = new ApiResponseHandler(this, this.httpPost(this.urlApi(), body));
    const res = await responseHandler.handleResponse();
    try {
      this.details = res.obj;
    } catch (e) {
      console.error(e);
    }
    return res;
  }

  /**
   * deleteItem
   *
   * DELETE request to Django to delete a specific object
   *
   * @param {string} id - ID of object to delete
   * @return {ApiResponse} Api response object
   */
  async deleteItem(id: string): Promise<ApiResponse<Model>> {
    const responseHandler = new ApiResponseHandler(this, this.httpDelete(this.urlApi(id)));
    return await responseHandler.handleResponse();
  }

  /**
   * HTTP METHODS
   *
   * HTTP wrapper functions to standard methods
   * Help with functionality, formatting, auth,
   * sanitizing etc.
   *
   * Supported methods
   * - GET, POST, PATCH, DELETE
   */
  async httpGet(url: string): Promise<any> {
    const headers = this.getHeaders();
    return this.client.get(url, headers);
  }

  async httpPost<TypeBody extends object>(url: string, body: TypeBody): Promise<any> {
    const headers = this.getHeaders();
    return this.client.post(url, body, headers);
  }

  async httpPatch<TypeBody extends object>(url: string, body: TypeBody): Promise<any> {
    const headers = this.getHeaders();
    return this.client.patch(url, body, headers);
  }

  async httpDelete(url: string): Promise<any> {
    const headers = this.getHeaders();
    return this.client.delete(url, headers);
  }
}
