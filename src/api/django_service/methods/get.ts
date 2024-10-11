import DjangoApi from '../django_api'
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
export default class DjangoGet<Model, TypeFilters extends object | null = null> extends DjangoApi<TypeFilters> {
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
  protected async httpGet (url: string, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model | Model[]>> {
    const headers = this.getHeaders(extraHeaders)
    return await this.catchDuplicates<Model>(async () => await this.client.get<Model>(url, headers), url)
  }

  /**
   * getList
   *
   * GET Django list from this API
   *
   * @param {boolean=} paginated - Treat this API result like a paginated one (i.e., it contains 'next', 'prev', etc.)
   * @param {TypeFilters=} filters - Filters to send with request
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse<Model[]>} Api response object
   */
  public async getList (
    paginated: boolean = true,
    filters?: TypeFilters,
    extraHeaders?: Record<string, unknown>
  ): Promise<ApiResponse<Model[]>> {
    this.loading = true
    const url = this.urlApi(undefined, filters)
    const apiResponse = await this.httpGet(url, extraHeaders)
    const response = (await this.handleDjangoGet(apiResponse, paginated)) as ApiResponse<Model[]>
    this.loading = false
    return response
  }

  /**
   * getListAll
   *
   * GET Django list from this API for ALL pages if paginated
   *
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @returns {Model[]} List of all objects paginated out
   */
  public async getListAll (extraHeaders?: Record<string, unknown>): Promise<Model[]> {
    this.loading = true
    let res: Model[] = []
    const first = await this.getList(true, undefined, extraHeaders)
    res = first.obj ?? []
    let pages = 1
    while (typeof this.next !== 'undefined' && this.next !== null && this.next !== '') {
      pages += 1
      const nextPage = await this.getNext()
      if (typeof nextPage !== 'undefined') {
        const nextList = nextPage.obj
        if (nextList && nextList.length > 0) {
          nextList.map((i: Model) => res.push(i))
        }
      }
    }
    this.pageTotal = pages
    this.loading = false
    return res
  }

  /**
   * getRetrieve
   *
   * Django GET item and details
   *
   * @param {string} id - ID of object to retrieve
   * @param {boolean=} paginated - Treat this API result like a paginated one (i.e., it contains 'next', 'prev', etc.)
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @param {TypeFilters=} filters - Filters to send with request
   * @return {ApiResponse<Model | Model[]>} Api response object
   */
  public async getRetrieve (
    id: string,
    paginated: boolean = false,
    extraHeaders?: Record<string, unknown>,
    filters?: TypeFilters
  ): Promise<ApiResponse<Model | Model[]>> {
    this.loading = true
    const url = this.urlApi(id, filters)
    const apiResponse = await this.httpGet(url, extraHeaders)
    const response = await this.handleDjangoGet(apiResponse, paginated)
    this.loading = false
    return response
  }

  /**
   * handleDjangoGet
   *
   * Helper function to handle the response from a GET request.
   *
   * @param {ApiResponse<Model | Model[]>} apiResponse - API response object
   * @param {boolean} paginated - Whether the response is paginated
   * @returns {Promise<ApiResponse<Model | Model[]>>} Api response object
   */
  protected async handleDjangoGet (
    apiResponse: ApiResponse<Model | Model[]>,
    paginated: boolean
  ): Promise<ApiResponse<Model | Model[]>> {
    // Handle duplicate response
    if (apiResponse.duplicate) {
      return apiResponse
    }

    if (!paginated) {
      // Non-paginated response
      try {
        if (apiResponse.obj instanceof Array) {
          this.list = apiResponse.obj
        } else {
          this.result = apiResponse.obj as Model
        }
      } catch (e) {
        console.warn(e)
      }
      return apiResponse
    } else {
      // Paginated response
      try {
        this.count = (apiResponse.response.data as { count: number }).count
        this.list = (apiResponse.obj as Model[]) ?? []
        this.calculatePageTotal() // This should only be called during the initial call NOT during any next/prev calls
      } catch (e) {
        console.warn(e)
      }
      return await this.handlePaginatedResponse(apiResponse as ApiResponse<Model[]>, false)
    }
  }

  /**
   * handlePaginatedResponse
   *
   * Handle response from Django paginated API
   * Handles 'next', 'prev', 'count', etc. and
   * this API data
   *
   * @param {ApiResponse<Model[]>} apiResponse - Api response object
   * @param {boolean=} combineLists - Whether to add next page to the current list or replace it
   * @return {ApiResponse<Model[]>} Api response object
   */
  protected async handlePaginatedResponse (
    apiResponse: ApiResponse<Model[]>,
    combineLists: boolean = false
  ): Promise<ApiResponse<Model[]>> {
    try {
      const responseData = apiResponse.response.data as { count: number, next: string, previous: string }
      if (responseData) {
        this.count = responseData.count
        this.next = responseData.next
        this.prev = responseData.previous
      }

      if (!combineLists) {
        this.list = apiResponse.obj ?? []
      } else {
        if (this.list && this.list.length > 0) {
          this.list = [...this.list, ...(apiResponse.obj ?? [])]
        } else {
          this.list = apiResponse.obj ?? []
        }
      }
      this.calculatePageCurrent() // Update current page number based on 'next' and 'prev'
    } catch (e) {
      console.error(e)
    }
    return apiResponse
  }

  /**
   * getNext
   *
   * Get the next page of results.
   *
   * @param {boolean=} combineLists - Whether to add next page to the current list or replace it
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse<Model[]> | undefined} Api response object
   */
  public async getNext (
    combineLists: boolean = false,
    extraHeaders?: Record<string, unknown>
  ): Promise<ApiResponse<Model[]> | undefined> {
    this.loading = true
    if (typeof this.next !== 'undefined' && this.next !== null) {
      const apiResponse = await this.httpGet(this.next, extraHeaders)
      if (apiResponse.duplicate) {
        this.loading = false
        return apiResponse as ApiResponse<Model[]>
      }

      if (apiResponse.obj instanceof Array) {
        const response = await this.handlePaginatedResponse(apiResponse as ApiResponse<Model[]>, combineLists)
        this.pageCurrent += 1 // Increment current page
        this.loading = false
        return response
      } else {
        this.loading = false
        throw new Error('getNext - Response is not a list')
      }
    }
    this.loading = false
  }

  /**
   * getPrev
   *
   * Get the previous page of results.
   *
   * @param {boolean=} combineLists - Whether to add previous page to the current list or replace it
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse<Model[]> | undefined} Api response object
   */
  public async getPrev (
    combineLists: boolean = false,
    extraHeaders?: Record<string, unknown>
  ): Promise<ApiResponse<Model[]> | undefined> {
    this.loading = true
    if (typeof this.prev !== 'undefined' && this.prev !== null) {
      const apiResponse = await this.httpGet(this.prev, extraHeaders)
      if (apiResponse.duplicate) {
        this.loading = false
        return apiResponse as ApiResponse<Model[]>
      }

      if (apiResponse.obj instanceof Array) {
        const response = await this.handlePaginatedResponse(apiResponse as ApiResponse<Model[]>, combineLists)
        this.pageCurrent -= 1 // Decrement current page
        this.loading = false
        return response
      } else {
        this.loading = false
        throw new Error('getPrev - Response is not a list')
      }
    }
    this.loading = false
  }

  /**
   * getPage
   *
   * Get a specific page of results.
   *
   * @param {number} page - Specific page number to retrieve
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse<Model[]>} Api response object
   */
  public async getPage (page: number, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model[]>> {
    this.loading = true
    const pageUrl = `${this.urlApi()}?page=${page}`
    const apiResponse = await this.httpGet(pageUrl, extraHeaders)

    if (apiResponse.duplicate) {
      this.loading = false
      return apiResponse as ApiResponse<Model[]>
    }

    if (apiResponse.obj instanceof Array) {
      const response = await this.handlePaginatedResponse(apiResponse as ApiResponse<Model[]>)
      this.pageCurrent = page // Set the current page here
      this.loading = false
      return response
    } else {
      // If the response is not a list, wrap the result in an array
      const response: ApiResponse<Model[]> = {
        ...apiResponse,
        obj: [apiResponse.obj as Model]
      }
      this.pageCurrent = page // Set the current page here
      this.loading = false
      return response
    }
  }

  /**
   * PAGINATION HELPERS
   */

  /**
   * calculatePageCurrent
   *
   * Calculate the current page number based on 'next' and 'prev' URLs.
   */
  protected calculatePageCurrent (): void {
    if (this.next) {
      const num = Number(this.getQueryStringValue('page', this.next))
      if (!isNaN(num)) {
        this.pageCurrent = num - 1
      }
    } else if (this.prev) {
      const num = Number(this.getQueryStringValue('page', this.prev))
      if (!isNaN(num)) {
        this.pageCurrent = num + 1
      }
    } else {
      // If both next and prev are null, we're on the first or last page
      if (this.pageCurrent === undefined || this.pageCurrent === null) {
        this.pageCurrent = 1 // Default to page 1
      }
    }
  }

  /**
   * getQueryStringValue
   *
   * Extracts the value of a query parameter from a URL.
   *
   * @param {string} field - The name of the query parameter to extract.
   * @param {string} url - The URL to parse.
   * @return {string | null} The value of the query parameter, or null if not found.
   */
  protected getQueryStringValue (field: string, url: string): number {
    // Parse the URL to extract the query parameter
    const reg = new RegExp(`[?&]${field}=([^&#]*)`, 'i')
    const string = reg.exec(url)
    return string ? Number(string[1]) : NaN
  }

  /**
   * calculatePageTotal
   *
   * Calculate the total number of pages.
   */
  protected calculatePageTotal (): void {
    if (this.list && this.count !== undefined) {
      const itemsPerPage = this.list.length
      if (itemsPerPage > 0) {
        this.pageTotal = Math.ceil(this.count / itemsPerPage)
      }
    }
  }
}
