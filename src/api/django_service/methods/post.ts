import DjangoApi from '../django_api'
import { ApiResponseHandler } from '../../../api_response_handler'
import { type ApiResponse } from '../../../types'

/**
 *
 * DJANGO POST
 *
 * Django POST - API methods for POST requests for a Django API
 *
 * Includes:
 * - postCreate(id, body)
 * - httpPostGeneric(id, body)
 *  - Generic version of httpPost that allows you to specify the body type and doesn't handle the response
 */
export default class DjangoPost<Model, IBody extends object> extends DjangoApi {
  result?: Model

  /**
   * HTTP call
   * 
   * @param {string} url - URL to call
   * @param {IBody | FormData} body - Body of request to include, probably the object data
   * @param {Object} extraHeaders - Extra headers to add to request
   */
  protected async httpPost (url: string, body: IBody | FormData, extraHeaders?: Object): Promise<any> {
    const headers = this.getHeaders()
    return await this.client.post(url, body, headers)
  }

  protected async httpPostGeneric<IBodyGeneric extends object>(url: string, body: IBodyGeneric): Promise<any> {
    const headers = this.getHeaders()
    return await this.client.post(url, body, headers)
  }

  /**
   * postCreate
   *
   * POST request to Django to create an object.
   *
   * @param {IBody | FormData} body - Body of request to include, probably the object data
   * @param {Object=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse} Api response object
   */
  public async postCreate (body: IBody | FormData, extraHeaders?: Object): Promise<ApiResponse<Model>> {
    const responseHandler = new ApiResponseHandler<Model>(this, this.httpPost(this.urlApi(), body, extraHeaders))
    const res = await responseHandler.handleResponse()
    try {
      this.result = res.obj
    } catch (e) {
      console.error(e)
    }
    return res
  }
}
