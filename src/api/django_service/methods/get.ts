import DjangoApi from '../django_api'
import { ApiResponseHandler } from '../../../api_response_handler'
import { type ApiResponse } from '../../../types'

/**
 *
 * DJANGO GET
 *
 * Django Get - API methods for GET requests for a Django API
 * Includes pagination support and filtering when appropriate.
 *
 * This includes:
 * - getList()
 * - getListAll()
 * - getRetrieve(id)
 * - getNext()
 * - getPrev()
 * - getPage(num)
 */
export default class DjangoGet<Model> extends DjangoApi {
  list: Model[] = []
  result?: Model
  count?: number
  next?: string
  prev?: string
  pageCurrent = 1
  pageTotal = 1

  /**
   * HTTP calls
   *
   * @param {string} url - URL to call
   * @param {Record<string, unknown>} extraHeaders - Extra headers to add to request
   */
  protected async httpGet (url: string, extraHeaders?: Record<string, unknown>): Promise<any> {
    const headers = this.getHeaders(extraHeaders)
    return await this.client.get(url, headers)
  }

  /**
   * getList
   *
   * GET Django list from this API
   *
   * @param {Boolean=} paginated - Treat this API result like a paginated one (i.e., it contains 'next', 'prev', etc.)
   * @param {TypeFilters=} filters - Filters to send with request
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse} Api response object
   */
  public async getList<TypeFilters extends object>(paginated: boolean = true, filters?: TypeFilters, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model[]>> {
    const responseHandler = new ApiResponseHandler<Model>(this, this.httpGet(this.urlApi(undefined, filters), extraHeaders))
    return (await this.handleDjangoGet(responseHandler, paginated)) as ApiResponse<Model[]>
  }

  /**
   * getList
   *
   * GET Django list from this API for ALL pages if paginated
   *
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @returns {Array} List of all objects paginated out
   */
  public async getListAll (extraHeaders?: Record<string, unknown>): Promise<Model[]> {
    let res = []
    const first = await this.getList(true, undefined, extraHeaders)
    res = first.obj ?? []
    let pages = 1
    while (typeof this.next !== 'undefined' && this.next !== null && this.next !== '') {
      pages += 1
      const nextPage = await this.getNext()
      if (typeof nextPage !== 'undefined') {
        const nextList = nextPage.obj
        if (!!nextList && nextList.length > 0) {
          nextList.map(function (i: any) {
            return res.push(i)
          })
        }
      }
    }
    this.pageTotal = pages
    return res
  }

  /**
   * getRetrieve
   *
   * Django GET item and details
   *
   * @param {string=} id - ID of object to retrieve
   * @param {Boolean=} paginated - Treat this API result like a paginated one (i.e., it contains 'next', 'prev', etc.)
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @param {TypeFilters=} filters - Filters to send with request
   * @return {ApiResponse} Api response object
   */
  public async getRetrieve<TypeFilters extends object>(
    id: string,
    paginated: boolean = false,
    extraHeaders?: Record<string, unknown>,
    filters?: TypeFilters
  ): Promise<ApiResponse<Model | Model[]>> {
    const responseHandler = new ApiResponseHandler<Model | Model[]>(this, this.httpGet(this.urlApi(id, filters), extraHeaders))
    return await this.handleDjangoGet(responseHandler, paginated)
  }

  /**
   * handleDjangoGet
   *
   * @param responseHandler
   * @param paginated
   * @returns ApiResponse
   */
  protected async handleDjangoGet (
    responseHandler: ApiResponseHandler<Model | Model[]>,
    paginated: boolean
  ): Promise<ApiResponse<Model | Model[]>> {
    // helper function to clean up get and retrieve methods
    if (!paginated) {
      const res = await responseHandler.handleResponse()
      try {
        this.result = res.obj
        if (res.obj instanceof Array) {
          this.list = res.obj
        } else {
          this.result = res.obj
        }
      } catch (e) {
        console.error(e)
      }
      return res
    } else {
      const res = await this.handlePaginatedResponse(responseHandler as ApiResponseHandler<Model[]>)
      try {
        this.count = res.response.data.count
        this.list = res.obj ?? []
        this.calculatePageTotal() // this should only be called during the initial call NOT during any next/prev calls
      } catch (e) {
        console.error(e)
      }
      return res
    }
  }

  /**
   * handlePaginatedResponse
   *
   * Handle response from Django paginated API
   * Handles 'next', 'prev', 'count', etc. and
   * this API data
   *
   * @param {ApiResponseHandler<Model[]>} responseHandler - response handler containing request to make
   * @param {Boolean=} combineLists - Whether to add next page to the current list or replace it
   * @return {ApiResponse} Api response object
   */
  protected async handlePaginatedResponse (
    responseHandler: ApiResponseHandler<Model[]>,
    combineLists: boolean = false
  ): Promise<ApiResponse<Model[]>> {
    const res = await responseHandler.handleResponse()
    try {
      this.count = res.response.data.count
      this.next = res.response.data.next
      this.prev = res.response.data.previous

      if (!combineLists) {
        this.list = res.obj
      } else {
        if (!!this.list && this.list.length > 0) {
          this.list = [...this.list, ...res.obj]
        } else {
          this.list = res.obj
        }
      }
      this.calculatePageCurrent()
    } catch (e) {
      console.error(e)
    }
    return res
  }

  /**
   * getNext
   *
   * @param {Boolean=} combineLists - Whether to add next page to the current list or replace it
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse} Api response object
   */
  public async getNext (combineLists: boolean = false, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model[]> | undefined> {
    if (typeof this.next !== 'undefined') {
      const responseHandler = new ApiResponseHandler<Model[]>(this, this.httpGet(this.next, extraHeaders))
      return await this.handlePaginatedResponse(responseHandler, combineLists)
    }
  }

  /**
   * getPrev
   *
   * @param {Boolean=} combineLists - Whether to add next page to the current list or replace it
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse} Api response object
   */
  public async getPrev (combineLists: boolean = false, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model[]> | undefined> {
    if (typeof this.prev !== 'undefined') {
      const responseHandler = new ApiResponseHandler<Model[]>(this, this.httpGet(this.prev), extraHeaders)
      return await this.handlePaginatedResponse(responseHandler, combineLists)
    }
  }

  /**
   * getPage
   *
   * @param {Number} page - Specific page number to retrieve
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse} Api response object
   */
  public async getPage (page: number, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model[]>> {
    const pageUrl = `${this.urlApi()}?page=${page}`
    const responseHandler = new ApiResponseHandler<Model[]>(this, this.httpGet(pageUrl, extraHeaders))
    return await this.handlePaginatedResponse(responseHandler)
  }

  /**
   * PAGINATION HELPERS
   */
  protected calculatePageCurrent (): void {
    if (typeof this.next !== 'undefined' && this.next != null) {
      const num = Number(this.getQueryString('page', this.next)) || 2
      this.pageCurrent = num - 1
    } else if (typeof this.prev !== 'undefined' && this.prev != null) {
      const num = Number(this.getQueryString('page', this.prev)) || 0
      this.pageCurrent = num + 1
    }
  }

  protected calculatePageTotal (): void {
    if (typeof this.list !== 'undefined') {
      if (this.list?.length > 0 && typeof this.count !== 'undefined') {
        let pageTotal = Math.floor(this.count / this.list?.length)
        const remainder = this.count % this.list?.length
        if (remainder !== 0) {
          pageTotal++
        }
        this.pageTotal = pageTotal
      }
    }
  }
}
