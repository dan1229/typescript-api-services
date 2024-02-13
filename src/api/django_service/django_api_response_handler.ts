import { type ApiResponse, ApiResponseError, ApiResponseSuccess, type AxiosResponse } from '../../types'
import { type BaseApi } from '../base_api'

/**
 * DJANGO API RESPONSE HANDLER
 *
 * Handle, sanitize and standardize API responses for services
 *
 * @param {BaseApi} api - API to use for response
 * @param {Promise<any>} request - Request to fulfil
 */
export class DjangoApiResponseHandler<Model> {
  api: BaseApi
  request: Promise<any>
  response?: AxiosResponse<any>

  constructor (api: BaseApi, request: Promise<AxiosResponse<any>>) {
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
   * @return {Promise<ApiResponse<any>>} Api response object
   */
  async handleResponse (): Promise<ApiResponse<any>> {
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
    if (this.response.data.hasOwnProperty('message')) {
      message = this.response.data.message
    } else {
      // no 'message'
      error = true
    }

    // serialize and return
    try {
      if (!error) {
        // results based api
        if (this.response.data.hasOwnProperty('results') && typeof this.response.data.results !== 'undefined') {
          let res
          if (typeof this.response.data.results !== 'undefined') {
            // check 'results' key
            res = this.response.data.results
          } else if (typeof this.response.data !== 'undefined') {
            res = this.response.data
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
  handleError (exception: any | string): ApiResponseError<Model> {
    // js exception/errors -> return as is
    if (typeof exception === 'string') {
      return new ApiResponseError<Model>(this.response, exception, new Map<string, string>())
    }
    // response obj errors -> django api errors
    else if ('response' in exception && typeof exception.response !== 'undefined') {
      // 'data' in response
      if ('data' in exception.response && typeof !!exception.response.data) {
        const keys = Object.keys(exception.response.data)
        let errorMessage = null // if it was in the 'message' field
        let errorDetail = null // if it was in the 'detail' field
        let errorNonField = null // any non field errors
        let errorFields = new Map<string, string>()

        // loop through 'data' response keys
        // this is one of the worst pieces of code i've ever written i apologize
        for (let i = 0; i < keys.length; ++i) {
          const key = keys[i]
          const err = exception.response.data[key]
          if (err instanceof Array) {
            if (key === 'non_field_errors') {
              // handle non field errors
              errorNonField = err[0]
            } else {
              errorFields = errorFields.set(key, err[0])
            }
          } else if (key === 'error_fields' && err instanceof Object) {
            // handle object errors
            const errKeys = Object.keys(err)
            for (let j = 0; j < errKeys.length; ++j) {
              const errKey = errKeys[j]
              const errVal = err[errKey]
              if (errVal instanceof Array) {
                for (let k = 0; k < errVal.length; ++k) {
                  const tmp = errVal[k]
                  if (tmp instanceof Object) {
                    errorFields = errorFields.set(errKey, tmp[Object.keys(tmp)[0]])
                  } else {
                    errorFields = errorFields.set(errKey, errVal[k].toString())
                  }
                }
              } else {
                errorFields = errorFields.set(errKey, errVal.toString().replace('_', ' '))
              }
            }
          } else if (key === 'error_fields') {
            // this is when django gives an object with field specific errors
            errorFields = err
          } else if (key === 'non_field_errors') {
            // this is when django gives an object with field specific errors
            errorNonField = err[0]
          } else if (key === 'message') {
            // this is a 'generic' error from our django bootstrapper and custom error handler
            errorMessage = exception.response.data.message
          } else if (key === 'detail') {
            // this is a 'generic' error from django - shouldn't really happen
            errorDetail = exception.response.data.detail
          }
        }

        // craft response - precedence of errors below
        // 1. error non field errors
        if (!!errorNonField && !!errorNonField.length) {
          return new ApiResponseError<Model>(this.response, errorNonField, errorFields)
        }
        // 2. error detail - default django error field, shouldn't really happen but just in case
        else if (!!errorDetail && !!errorDetail.length) {
          return new ApiResponseError<Model>(this.response, errorDetail, errorFields)
        }
        // 3. error message - these are the most generic from our bootstrapper
        else if (!!errorMessage && !!errorMessage.length) {
          return new ApiResponseError<Model>(this.response, errorMessage, errorFields)
        }
        // 4. default error
        else {
          return new ApiResponseError<Model>(this.response, undefined, errorFields)
        }
      } else {
        // 'data' doesn't exist -> error
        return new ApiResponseError<Model>(this.response, undefined)
      }
    }
    // default case error -> unsure how to handle
    else {
      console.error(`Unknown error type: ${exception}`)
      return new ApiResponseError<Model>(this.response)
    }
  }
}
