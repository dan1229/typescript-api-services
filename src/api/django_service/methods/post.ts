import DjangoApi from '../django_api';
import { ApiResponseHandler } from '../../../api_response_handler';
import { ApiResponse } from '../../../types';

/**
 *
 * DJANGO POST
 *
 * Django Post - TODO
 */
export default class DjangoPost<Model> extends DjangoApi<Model> {
  /**
   * HTTP call
   */
  protected async httpPost<TypeBody extends object>(url: string, body: TypeBody): Promise<any> {
    const headers = this.getHeaders();
    return this.client.post(url, body, headers);
  }

  /**
   * postCreate
   *
   * POST request to Django to create an object.
   *
   * @param {TypeBody} body - Body of request to include, probably the object data
   * @return {ApiResponse} Api response object
   */
  protected async postCreate<TypeBody extends object>(body: TypeBody): Promise<ApiResponse<Model>> {
    const responseHandler = new ApiResponseHandler<Model>(this, this.httpPost(this.urlApi(), body));
    const res = await responseHandler.handleResponse();
    try {
      this.result = res.obj;
    } catch (e) {
      console.error(e);
    }
    return res;
  }
}
