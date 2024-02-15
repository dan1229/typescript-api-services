import { type AxiosRequestConfig } from 'axios'

/**
 * API RESPONSE
 *
 * @param {any} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {boolean=} error - Whether or not response is an error
 * @param {Map<string, string>=} errorFields - Map of field specific errors and messages
 * @param {Model=} obj - Actual object returned by API if applicable
 */
export abstract class ApiResponse<Model> {
  response: any // update from 'any' as well
  message: string
  error: boolean
  errorFields?: Map<string, string>
  obj?: Model // update these from 'any'

  protected constructor (response: any, message: string = 'API response.', error = true, errorFields?: Map<string, string>, obj?: Model) {
    this.response = response
    this.message = message
    this.error = error
    this.errorFields = errorFields
    this.obj = obj
  }
}

/**
 * API RESPONSE ERROR
 *
 * @param {any} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {Map<string, string>=} errorFields - Map of field specific errors and messages
 * @param {Model=} obj - Actual object returned by API if applicable
 */
export class ApiResponseError<Model> extends ApiResponse<Model> {
  constructor (
    response: any,
    message: string = 'Error handling request. Please try again later.',
    errorFields?: Map<string, string>,
    obj?: Model
  ) {
    super(response, message, true, errorFields, obj)
  }
}

/**
 * API RESPONSE SUCCESS
 *
 * @param {any} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {Model=} obj - Actual object returned by API if applicable
 */
export class ApiResponseSuccess<Model> extends ApiResponse<Model> {
  constructor (response: any, message: string = 'Successful request.', obj?: Model) {
    super(response, message, false, undefined, obj)
  }
}

/**
 * API RESPONSE DUPLICATE
 *
 * @param {any} response - HTTP response object
 */
export class ApiResponseDuplicate extends ApiResponse<unknown> {
  constructor (response: any) {
    super(response, 'Duplicate request.', true, undefined, undefined)
  }
}

/**
 * AXIOS RESPONSE
 *
 * @param {T} data - Data returned by API
 * @param {number} status - HTTP status code
 * @param {string} statusText - HTTP status text
 * @param {Record<string, string>} headers - HTTP headers
 * @param {AxiosRequestConfig<T>} config - Axios request config
 * @param {any} request - HTTP request object
 */
export interface AxiosResponse<T = never> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: AxiosRequestConfig<T>
  request?: any
}
