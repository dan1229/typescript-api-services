import DjangoApi from '../django_api'
import { ApiResponseDuplicate, type ApiResponse } from '../../../types'

/**
 * DJANGO DELETE
 *
 * Django Delete - API methods for DELETE requests for a Django API
 */
export default class DjangoDelete<Model> extends DjangoApi<Model> {
  /**
   * HTTP call
   *
   * @param {string} url - URL to call
   * @param {Record<string, unknown>} extraHeaders - Extra headers to add to request
   */
  protected async httpDelete (url: string, extraHeaders?: Record<string, unknown>): Promise<any> {
    const headers = this.getHeaders(extraHeaders)
    return await this.retryIfNecessary<Model>(async () => await this.client.delete(url, headers), url)
  }

  /**
   * deleteItem
   *
   * DELETE request to Django to delete a specific object
   *
   * @param {string} id - ID of object to delete
   * @param {Record<string, unknown>} extraHeaders - Extra headers to add to request
   * @return {ApiResponse} Api response object
   */
  public async deleteItem (id: string, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model>> {
    this.loading = true
    const url = this.urlApi(id)
    const apiResponse = await this.httpDelete(url, extraHeaders)
    if (apiResponse instanceof ApiResponseDuplicate) {
      return apiResponse;
    }
    this.loading = false
    return apiResponse
  }
}
