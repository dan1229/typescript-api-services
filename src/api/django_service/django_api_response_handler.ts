import { type ApiResponse, ApiResponseError, ApiResponseSuccess } from '../../types'
import type DjangoApi from './django_api'
import { type AxiosResponse } from 'axios'

/**
 * DJANGO API RESPONSE HANDLER
 *
 * Handle, sanitize and standardize API responses for services
 *
 * @param {BaseApi} api - API to use for response
 * @param {Promise<AxiosResponse<unknown, any>>} request - Request to fulfil
 */
export class DjangoApiResponseHandler<Model> {
  api: DjangoApi<object | null>
  request: Promise<AxiosResponse<unknown, unknown>>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  response: AxiosResponse<unknown> = {} as AxiosResponse<unknown>

  constructor (api: DjangoApi<object | null>, request: Promise<AxiosResponse<unknown, unknown>>) {
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
   * @return {Promise<ApiResponse<Model>>} Api response object
   */
  async handleResponse (): Promise<ApiResponse<Model>> {
    // await response and ensure valid
    try {
      this.response = await this.request
      if (typeof this.response === 'undefined' || !this.response.data) {
        throw Error('Response undefined.')
      }
    } catch (e) {
      this.handleLogError(e)
      return this.handleError(e)
    }

    // detect if error or not
    let error = false
    if (this.response.status >= 300) {
      error = true
    }

    // get response message
    let message = 'Error. Please try again later.'
    if (this.response.data && typeof this.response.data === 'object' && 'message' in this.response.data) {
      message = this.response.data.message as string
    } else {
      // no 'message'
      error = true
    }
    // serialize and return
    try {
      if (!error) {
        // results based api
        if (typeof this.response.data === 'object' && this.response.data !== null && 'results' in this.response.data) {
          let res: Model | undefined
          if (typeof this.response.data.results !== 'undefined') {
            // check 'results' key
            res = this.response.data.results as Model
          } else {
            res = this.response.data as Model
          }
          return new ApiResponseSuccess<Model>(this.response, message, res)
        } else {
          return new ApiResponseSuccess<Model>(this.response, message)
        }
      }

      throw Error(message) // api error/incorrectly formatted -> trigger manually
    } catch (e) {
      this.handleLogError(e)
      return this.handleError(e)
    }
  }

  /**
   * Error Handler
   *
   * Method to handle responses in numerous ways depending on how to best integrate with 'higher level' UI code or similar.
   *
   * @param {any | string} exception - Exception to log/handle
   * @return {ApiResponseError<Model>} Api response ERROR object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError (exception: any | string): ApiResponseError<Model> {
    // this is a string error - most likely a 500 error or something similarly unhandled
    if (typeof exception === 'string') {
      return new ApiResponseError<Model>(this.response, exception, new Map<string, string>())
    }

    // axios error - most should be caught in this
    if ('response' in exception && !!exception.response && !!exception.response.data) {
      const responseData = exception.response.data

      if (responseData.non_field_errors?.length) {
        return new ApiResponseError<Model>(this.response, responseData.non_field_errors[0])
      }

      // get error fields
      const errorFields = new Map<string, string>()
      if (responseData.error_fields) {
        Object.keys(responseData.error_fields).forEach((key) => {
          const errorValue = responseData.error_fields[key]
          if (Array.isArray(errorValue)) {
            errorFields.set(key, errorValue[0].toString())
          } else {
            errorFields.set(key, errorValue.toString())
          }
        })
      }

      if (responseData.detail) {
        return new ApiResponseError<Model>(this.response, responseData.detail, errorFields)
      }

      if (responseData.message) {
        return new ApiResponseError<Model>(this.response, responseData.message, errorFields)
      }

      return new ApiResponseError<Model>(this.response, undefined, errorFields)
    }

    return new ApiResponseError<Model>(this.response)
  }
}
