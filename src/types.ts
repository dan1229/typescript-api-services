/**
 * API RESPONSE
 *
 * @param {any} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {boolean=} error - Whether or not response is an error
 * @param {any=} obj - Actual object returned by API if applicable
 */
export abstract class ApiResponse {
  message: string;
  error: boolean;
  response: any;
  obj: any; // update these from 'any'

  protected constructor(response: any, message: string = 'API response.', error = true, obj?: any) {
    this.message = message;
    this.error = error;
    this.obj = obj;
    this.response = response;
  }
}

/**
 * API RESPONSE ERROR
 *
 * @param {any} response - HTTP response object
 * @param {string} message - 'Main' message for response
 * @param {any=} obj - Actual object returned by API if applicable
 */
export class ApiResponseError extends ApiResponse {
  constructor(response: any, message: string = 'Error handling request. Please try again later.', obj?: any) {
    super(response, message, true, obj);
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
