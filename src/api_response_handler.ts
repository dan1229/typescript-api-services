import { ApiResponse, ApiResponseError, ApiResponseSuccess } from './types';
import { BaseApi } from './api/base_api';
import { stringify } from 'querystring';
import { isInstanceOf } from '@sentry/utils';

/**
 * API RESPONSE HANDLER
 *
 * Handle, sanitize and standardize API responses for services
 *
 * @param {BaseApi} api - API to use for response
 * @param {Promise<any>} request - Request to fulfil
 */
export class ApiResponseHandler {
  api: BaseApi;
  request: Promise<any>;
  response?: any;

  constructor(api: BaseApi, request: Promise<any>) {
    this.api = api;
    this.request = request;
  }

  /**
   * Response Handler
   *
   * Method to standardize, sanitize and handle API responses. Handles deserializing objects as well if given 'fromJson'.
   *
   * @return {Promise<ApiResponse<any>>} Api response object
   */
  async handleResponse(): Promise<ApiResponse<any>> {
    // await response and ensure valid
    try {
      this.response = await this.request;
      if (typeof this.response === 'undefined') {
        throw Error('Response undefined.');
      }
    } catch (e) {
      console.error(`${this.api.name}: ERROR\n`, e);
      return this.handleError(e);
    }

    // detect if error or not
    let error = false;
    if (this.response['status'] >= 300) {
      error = true;
    }

    // get response message
    let message = 'Error. Please try again later.';
    if (this.response.data.hasOwnProperty('message')) {
      message = this.response.data.message;
    } else {
      // no 'message'
      error = true;
    }

    // serialize and return
    try {
      if (!error) {
        // results based api
        if (this.response.data.hasOwnProperty('results') && typeof this.response.data.results !== 'undefined') {
          let res = undefined;
          if (typeof this.response.data.results != 'undefined') {
            // check 'results' key
            res = this.response.data.results;
          } else if (typeof this.response.data != 'undefined') {
            res = this.response.data;
          }
          return new ApiResponseSuccess(this.response, message, res);
        } else {
          return new ApiResponseSuccess(this.response, message);
        }
      }

      throw Error(message); // api error/incorrectly formatted -> trigger manually
    } catch (e) {
      console.error(`${this.api.name}: ERROR\n`, e);
      return this.handleError(e);
    }
  }

  /**
   * Error Handler
   *
   * Method to handle responses in numerous ways depending on how to best integrate with 'higher level' UI code or similar.
   *
   * TODO find type for 'any'
   * @param {any} exception - Exception to log/handle
   * @return {ApiResponseError<any>} Api response ERROR object
   */
  handleError(exception: any): ApiResponseError<any> {
    // django api errors
    if (exception.hasOwnProperty('response') && typeof exception.response !== 'undefined') {
      if (exception.response.hasOwnProperty('data') && typeof exception.response.data !== 'undefined') {
        // get different types of errors out
        let keys = Object.keys(exception.response.data);
        let errorMessage = null; // if it was in the 'message' field
        let errorDetail = null; // if it was in the 'detail' field
        let errorNonField = null; // any non field errors
        let errorFields = new Map<string, string>();

        // loop through error response keys
        for (let i = 0; i < keys.length; ++i) {
          const key = keys[i];
          let err = exception.response.data[key];
          if (err instanceof Array) {
            if (key === 'non_field_errors') {
              // handle non field errors
              errorNonField = err[0];
            } else {
              errorFields = errorFields.set(key, err[0]);
            }
          } else if (key === 'error_fields' && err instanceof Object) {
            // handle object errors
            let errKeys = Object.keys(err);
            for (let j = 0; j < errKeys.length; ++j) {
              errorFields = errorFields.set(errKeys[j], err[errKeys[j]].toString().replace('_', ' '));
            }
          } else if (keys[i] == 'non_field_errors') {
            // this is when django gives an object with field specific errors
            errorNonField = exception.response.data[key][0];
          } else if (keys[i] == 'error_fields') {
            // this is when django gives an object with field specific errors
            errorFields = exception.response.data[key];
          } else if (keys[i] == 'message') {
            // this is a 'generic' error from our django bootstrapper and custom error handler
            errorMessage = exception.response.data.message;
          } else if (keys[i] == 'detail') {
            // this is a 'generic' error from django - shouldn't really happen
            errorDetail = exception.response.data.detail;
          }
        }

        // craft response - precedence of errors below
        if (!!errorNonField && errorNonField != '') {
          // 1. error non field errors
          return new ApiResponseError(this.response, errorNonField, errorFields);
        } else if (!!errorDetail && errorDetail != '') {
          // 2. error detail - default django error field, shouldn't really happen but just in case
          return new ApiResponseError(this.response, errorDetail, errorFields);
        } else {
          // 3. error message - these are the most generic from our bootstrapper
          return new ApiResponseError(this.response, errorMessage, errorFields);
        }
      } else {
        // 'data' doesn't exist -> error
        return new ApiResponseError(this.response, exception.response);
      }
    }

    // exception is just a string/js error
    if (typeof exception == 'string') {
      // replace with Object.keys(exception).length === 0?
      return new ApiResponseError(this.response, exception, new Map<string, string>());
    }

    // default error
    return new ApiResponseError(this.response, 'Error. Please try again later.', new Map<string, string>());
  }
}
