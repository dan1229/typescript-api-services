import DjangoApi from '../django_api';
import { ApiResponseHandler } from '../../../api_response_handler';
import { ApiResponse } from '../../../types';

/**
 *
 * DJANGO PATCH
 *
 * Django Patch - API methods for PATCH requests for a Django API
 *
 * Includes:
 * - patchUpdate(id, body)
 * - patchUpdateGeneric(id, body)
 *  - Generic version of httpPatch that allows you to specify the body type and doesn't handle the response
 */
export default class DjangoPatch<Model, IBody extends object> extends DjangoApi {
  result?: Model;

  /**
   * HTTP call
   */
  protected async httpPatch(url: string, body: IBody): Promise<any> {
    const headers = this.getHeaders();
    return this.client.patch(url, body, headers);
  }

  protected async httpPatchGeneric<IBodyGeneric extends object>(url: string, body: IBodyGeneric): Promise<any> {
    const headers = this.getHeaders();
    return this.client.patch(url, body, headers);
  }

  /**
   * patchUpdate
   *
   * PATCH request to Django to update an object.
   *
   * @param {string} id - ID of object to update
   * @param {IBody} body - Body of request to include, probably the object data
   * @return {ApiResponse} Api response object
   */
  public async patchUpdate(id: string, body: IBody): Promise<ApiResponse<Model>> {
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
