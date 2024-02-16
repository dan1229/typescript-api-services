import { type ApiResponse } from '../../../types'
import DjangoApi from '../django_api'

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
   * @param {Record<string, unknown>} extraHeaders - Extra headers to add to request
   */
  protected async httpPost (url: string, body: IBody | FormData, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model>> {
    const headers = { ...this.getHeaders(), ...extraHeaders }
    return await this.catchDuplicates<Model>(async () => await this.client.post(url, body, headers), url)
  }

  // Generic version of httpPost that allows you to specify the body type and doesn't handle the response
  protected async httpPostGeneric<IBodyGeneric extends object>(url: string, body: IBodyGeneric): Promise<ApiResponse<Model>> {
    const headers = this.getHeaders()
    return await this.catchDuplicates<Model>(async () => await this.client.post(url, body, headers), url)
  }

  /**
   * postCreate
   *
   * POST request to Django to create an object.
   *
   * @param {IBody | FormData} body - Body of request to include, probably the object data
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to add to request
   * @return {ApiResponse} Api response object
   */
  public async postCreate (body: IBody | FormData, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model>> {
    this.loading = true
    const apiResponse = await this.httpPost(this.urlApi(), body, extraHeaders)
    try {
      this.result = apiResponse.obj
    } catch (e) {
      console.error(e)
    }
    this.loading = false
    return apiResponse
  }
}
