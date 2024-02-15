import { type ApiResponse, ApiResponseError, ApiResponseSuccess } from '../../types';
import type DjangoApi from './django_api';
import { type AxiosResponse } from 'axios';

/**
 * DJANGO API RESPONSE HANDLER
 *
 * Handle, sanitize and standardize API responses for services
 *
 * @param {BaseApi} api - API to use for response
 * @param {Promise<any>} request - Request to fulfil
 */
export class DjangoApiResponseHandler<Model> {
  api: DjangoApi<object | null>;
  request: Promise<any>;
  response?: AxiosResponse<any>;

  constructor(api: DjangoApi<object | null>, request: Promise<AxiosResponse<unknown>>) {
    this.api = api;
    this.request = request;
  }

  handleLogError = (e: unknown): void => {
    console.error(`${this.api.name}: ERROR\n${e}`);
  };

  /**
   * Response Handler
   *
   * Method to standardize, sanitize and handle API responses. Handles deserializing objects as well if given 'fromJson'.
   *
   * @return {Promise<ApiResponse<any>>} Api response object
   */
  async handleResponse(): Promise<ApiResponse<unknown>> {
    // await response and ensure valid
    try {
      this.response = await this.request;
      if (typeof this.response === 'undefined' || !this.response.data) {
        throw Error('Response undefined.');
      }
    } catch (e) {
      this.handleLogError(e);
      return this.handleError(e);
    }

    // detect if error or not
    let error = false;
    if (this.response.status >= 300) {
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
          let res;
          if (typeof this.response.data.results !== 'undefined') {
            // check 'results' key
            res = this.response.data.results;
          } else if (typeof this.response.data !== 'undefined') {
            res = this.response.data;
          }
          return new ApiResponseSuccess<Model>(this.response, message, res);
        } else {
          return new ApiResponseSuccess<Model>(this.response, message);
        }
      }

      throw Error(message); // api error/incorrectly formatted -> trigger manually
    } catch (e) {
      this.handleLogError(e);
      return this.handleError(e);
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
  handleError(exception: any | string): ApiResponseError<Model> {
    if (typeof exception === 'string') {
      return new ApiResponseError<Model>(this.response, exception, new Map<string, string>());
    }

    if ('response' in exception && exception.response && exception.response.data) {
      const responseData = exception.response.data;

      if (responseData.non_field_errors?.length) {
        return new ApiResponseError<Model>(this.response, responseData.non_field_errors[0]);
      }

      if (responseData.detail) {
        return new ApiResponseError<Model>(this.response, responseData.detail);
      }

      if (responseData.message) {
        return new ApiResponseError<Model>(this.response, responseData.message);
      }

      const errorFields = new Map<string, string>();

      if (responseData.error_fields) {
        Object.keys(responseData.error_fields).forEach((key) => {
          const errorValue = responseData.error_fields[key];
          if (Array.isArray(errorValue)) {
            errorFields.set(key, errorValue[0].toString());
          } else {
            errorFields.set(key, errorValue.toString());
          }
        });
      }

      return new ApiResponseError<Model>(this.response, undefined, errorFields);
    }

    console.error(`Unknown error type: ${exception}`);
    return new ApiResponseError<Model>(this.response);
  }
}
