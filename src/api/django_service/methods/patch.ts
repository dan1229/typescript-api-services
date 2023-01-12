import DjangoApi from '../django_api';
import { ApiResponseHandler } from '../../../api_response_handler';
import { ApiResponse } from '../../../types';

/**
 *
 * DJANGO PATCH
 *
 * Django Patch - TODO
 */
export default class DjangoPatch<Model> extends DjangoApi<Model> {
  /**
   * HTTP call
   */
  protected async httpPatch<TypeBody extends object>(url: string, body: TypeBody): Promise<any> {
    const headers = this.getHeaders();
    return this.client.patch(url, body, headers);
  }

  /**
   * patchUpdate
   *
   * PATCH request to Django to update an object.
   *
   * @param {string} id - ID of object to update
   * @param {TypeBody} body - Body of request to include, probably the object data
   * @return {ApiResponse} Api response object
   */
  protected async patchUpdate<TypeBody extends object>(id: string, body: TypeBody): Promise<ApiResponse<Model>> {
    const responseHandler = new ApiResponseHandler<Model>(this, this.httpPatch(this.urlApi(id), body));
    const res = await responseHandler.handleResponse();
    try {
      this.result = res.obj;
    } catch (e) {
      console.error(e);
    }
    return res;
  }
}
