import DjangoApi from '../django_api'
import { type ApiResponse } from '../../../types'
import { retryIfNecessary } from '../../base_api'

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
export default class DjangoPatch<Model, IBody extends object> extends DjangoApi<Model, IBody> {
  result?: Model

  /**
   * HTTP call
   *
   * @param {string} url - URL to call
   * @param {IBody | FormData} body - Body of request to include, probably the object data
   * @param {Record<string, unknown>} extraHeaders - Extra headers to add to request
   */
  protected async httpPatch (url: string, body: IBody | FormData, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model>> {
    const headers = this.getHeaders(extraHeaders)
    return await retryIfNecessary(this, async () => await this.client.patch(url, body, headers), url)
  }

  // Generic version of httpPatch that allows you to specify the body type and doesn't handle the response
  protected async httpPatchGeneric<IBodyGeneric extends object>(
    url: string,
    body: IBodyGeneric,
    extraHeaders?: Record<string, unknown>
  ): Promise<ApiResponse<Model>> {
    const headers = this.getHeaders(extraHeaders)
    return await retryIfNecessary(this, async () => await this.client.patch(url, body, headers), url)
  }

  /**
   * patchUpdate
   *
   * PATCH request to Django to update an object.
   *
   * @param {string} id - ID of object to update
   * @param {IBody} body - Body of request to include, probably the object data
   * @param {Record<string, unknown>=} extraHeaders - Extra headers to include
   * @return {ApiResponse} Api response object
   */
  public async patchUpdate (id: string, body: IBody | FormData, extraHeaders?: Record<string, unknown>): Promise<ApiResponse<Model>> {
    this.loading = true
    const url = this.urlApi(id)
    const res = await this.httpPatch(url, body, extraHeaders)
    try {
      this.result = res.obj
    } catch (e) {
      console.error(e)
    }
    this.loading = false
    return res
  }
}
