import DjangoApi from '../django_api'
import { ApiResponseHandler } from '../../../api_response_handler'
import { type ApiResponse } from '../../../types'

/**
 *
 * DJANGO DELETE
 *
 * Django Delete - API methods for DELETE requests for a Django API
 */
export default class DjangoDelete<Model> extends DjangoApi {
  /**
   * HTTP call
   */
  protected async httpDelete (url: string): Promise<any> {
    const headers = this.getHeaders()
    return await this.client.delete(url, headers)
  }

  /**
   * deleteItem
   *
   * DELETE request to Django to delete a specific object
   *
   * @param {string} id - ID of object to delete
   * @return {ApiResponse} Api response object
   */
  public async deleteItem (id: string): Promise<ApiResponse<Model>> {
    const responseHandler = new ApiResponseHandler<Model>(this, this.httpDelete(this.urlApi(id)))
    return await responseHandler.handleResponse()
  }
}
