import { type ApiResponse, ApiResponseError, ApiResponseSuccess } from '../types'
import { type BaseApi } from './base_api'
import { type AxiosResponse } from 'axios'

/**
 * BASE API RESPONSE HANDLER
 *
 * Handle, sanitize and standardize API responses for services
 *
 * @param {BaseApi} api - API to use for response
 * @param {Promise<AxiosResponse<T>>} request - Request to fulfill
 */
export class BaseApiResponseHandler<T> {
  api: BaseApi
  request: Promise<AxiosResponse<T>>
  response?: AxiosResponse<T>

  constructor (api: BaseApi, request: Promise<AxiosResponse<T>>) {
    this.api = api
    this.request = request
  }

  handleLogError = (e: unknown): void => {
    console.error(`${this.api.name}: ERROR\n${e}`)
  }

  /**
   * Response Handler
   *
   * Method to standardize, sanitize and handle API responses. Handles deserializing objects as well if given 'fromJson'.
   *
   * @return {Promise<ApiResponse<T>>} Api response object
   */
  async handleResponse (): Promise<ApiResponse<T>> {
    // await response and ensure valid
    try {
      this.response = await this.request
      if (typeof this.response === 'undefined' || !this.response.data) {
        throw Error('Response undefined.')
      }
    } catch (e) {
      this.handleLogError(e)
      return new ApiResponseError<T>(this.response ?? {} as AxiosResponse, e?.toString())
    }

    // detect if error or not
    let error = false
    if (this.response.status >= 300) {
      error = true
    }

    // serialize and return
    try {
      if (!error) {
        return new ApiResponseSuccess<T>(this.response, 'Successfully completed request.')
      }

      throw Error('Error fetching API.')
    } catch (e) {
      this.handleLogError(e)
      return new ApiResponseError<T>(this.response, e?.toString())
    }
  }
}
