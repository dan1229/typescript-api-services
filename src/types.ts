import { type AxiosResponse } from 'axios'

/**
 * API RESPONSE
 *
 * @param {AxiosResponse} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {boolean=} error - Whether or not response is an error
 * @param {Map<string, string>=} errorFields - Map of field specific errors and messages
 * @param {Model=} obj - Actual object returned by API if applicable
 */
export abstract class ApiResponse<Model> {
  response: AxiosResponse<unknown, unknown>
  message: string
  error: boolean
  errorFields?: Map<string, string>
  obj?: Model
  duplicate: boolean = false

  protected constructor (response: AxiosResponse<unknown, unknown>, message: string = 'API response.', error = true, errorFields?: Map<string, string>, obj?: Model) {
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
 * @param {AxiosResponse} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {Map<string, string>=} errorFields - Map of field specific errors and messages
 * @param {Model=} obj - Actual object returned by API if applicable
 */
export class ApiResponseError<Model> extends ApiResponse<Model> {
  constructor (
    response: AxiosResponse<unknown, unknown>,
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
 * @param {AxiosResponse} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {Model=} obj - Actual object returned by API if applicable
 */
export class ApiResponseSuccess<Model> extends ApiResponse<Model> {
  constructor (response: AxiosResponse<unknown, unknown>, message: string = 'Successful request.', obj?: Model) {
    super(response, message, false, undefined, obj)
  }
}
