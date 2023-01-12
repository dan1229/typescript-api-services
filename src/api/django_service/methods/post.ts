import DjangoApi from '../django_api';
import { ApiResponseHandler } from '../../../api_response_handler';
import { ApiResponse } from '../../../types';

/**
 *
 * DJANGO POST
 *
 * Django Post - TODO
 */
export default class DjangoPost<Model, IBody extends object> extends DjangoApi {
  result?: Model;

  /**
   * HTTP call
   */
  protected async httpPost(url: string, body: IBody): Promise<any> {
    const headers = this.getHeaders();
    return this.client.post(url, body, headers);
  }

  /**
   * postCreate
   *
   * POST request to Django to create an object.
   *
   * @param {IBody} body - Body of request to include, probably the object data
   * @return {ApiResponse} Api response object
   */
  protected async postCreate(body: IBody): Promise<ApiResponse<Model>> {
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
