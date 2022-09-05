/**
 * API RESPONSE
 *
 * @param {any} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {boolean=} error - Whether or not response is an error
 * @param {Map<string, string>=} errorFields - Map of field specific errors and messages
 * @param {any=} obj - Actual object returned by API if applicable
 */
export abstract class ApiResponse {
  response: any; // update from 'any' as well
  message: string;
  error: boolean;
  errorFields?: Map<string, string>;
  obj: any; // update these from 'any'

  protected constructor(
    response: any,
    message: string = 'API response.',
    error = true,
    errorFields?: Map<string, string>,
    obj?: any
  ) {
    this.response = response;
    this.message = message;
    this.error = error;
    this.errorFields = errorFields;
    this.obj = obj;
  }
}

/**
 * API RESPONSE ERROR
 *
 * @param {any} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {Map<string, string>=} errorFields - Map of field specific errors and messages
 * @param {any=} obj - Actual object returned by API if applicable
 */
export class ApiResponseError extends ApiResponse {
  constructor(
    response: any,
    message: string = 'Error handling request. Please try again later.',
    errorFields?: Map<string, string>,
    obj?: any
  ) {
    super(response, message, true, errorFields, obj);
  }
}

/**
 * API RESPONSE SUCCESS
 *
 * @param {any} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {any=} obj - Actual object returned by API if applicable
 */
export class ApiResponseSuccess extends ApiResponse {
  constructor(response: any, message: string = 'Successful request.', obj?: any) {
    super(response, message, false, obj);
  }
}
