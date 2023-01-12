import DjangoApi from '../django_api';
import { ApiResponseHandler } from '../../../api_response_handler';
import { ApiResponse } from '../../../types';

/**
 *
 * DJANGO DELETE
 *
 * Django Delete - TODO
 */
export default class DjangoDelete<Model> extends DjangoApi {
  /**
   * HTTP call
   */
  protected async httpDelete(url: string): Promise<any> {
    const headers = this.getHeaders();
    return this.client.delete(url, headers);
  }

  /**
   * deleteItem
   *
   * DELETE request to Django to delete a specific object
   *
   * @param {string} id - ID of object to delete
   * @return {ApiResponse} Api response object
   */
  protected async deleteItem(id: string): Promise<ApiResponse<Model>> {
    const responseHandler = new ApiResponseHandler<Model>(this, this.httpDelete(this.urlApi(id)));
    return await responseHandler.handleResponse();
  }
}
