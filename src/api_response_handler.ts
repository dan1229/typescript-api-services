import {ApiResponse, ApiResponseError, ApiResponseSuccess} from "@/services/src/types";
import {BaseApi} from "@/services/src/api/base_api";


/**
 * API RESPONSE HANDLER
 *
 * Handle, sanitize and standardize API responses for services
 *
 * @param {BaseApi} api - API to use for response
 * @param {Promise<any>} request - Request to fulfil
 */
export class ApiResponseHandler {
    api: BaseApi
    request: Promise<any>
    response?: any

    constructor(api: BaseApi, request: Promise<any>) {
        this.api = api
        this.request = request
    }

    /**
     * Response Handler
     *
     * Method to standardize, sanitize and handle API responses. Handles deserializing objects as well if given 'fromJson'.
     *
     * @return {Promise<ApiResponse>} Api response object
     */
    async handleResponse(): Promise<ApiResponse> {
        // await response and ensure valid
        try {
            this.response = await this.request
            if (typeof this.response === "undefined") {
                throw Error('Response undefined.')
            }
        } catch (e) {
            console.error(`${this.api.name}: ERROR\n`, e)
            return this.handleError(e,)
        }

        // detect if error or not
        let error = false;
        if (this.response['status'] >= 300) {
            error = true
        }

        // get response message
        let message = 'Error. Please try again later.'
        if (this.response.data.hasOwnProperty('message')) {
            message = this.response.data.message
        } else {  // no 'message'
            error = true
        }

        // serialize and return
        try {
            if (!error) {
                // results based api
                if (this.response.data.hasOwnProperty('results') && typeof this.response.data.results !== 'undefined') {
                    // TODO detect if data is anywhere other than 'response.data.results'
                    let res = undefined
                    if (typeof this.response.data.results != 'undefined') {  // check 'results' key
                        res = this.response.data.results
                    }
                    return new ApiResponseSuccess(this.response, message, res)
                } else {
                    return new ApiResponseSuccess(this.response, message)
                }
            }

            throw Error(message) // api error/incorrectly formatted -> trigger manually
        } catch (e) {
            console.error(`${this.api.name}: ERROR\n`, e)
            return this.handleError(e)
        }
    }

    /**
     * Error Handler
     *
     * Method to handle responses in numerous ways depending on how to best integrate with 'higher level' UI code or similar.
     *
     * @param {any} exception - Exception to log/handle
     * @return {ApiResponseError} Api response ERROR object
     */
    handleError(exception: any): ApiResponseError {

        // django api errors
        if (exception.hasOwnProperty('response') && typeof exception.response !== 'undefined') {
            if (exception.response.hasOwnProperty('data') && typeof exception.response.data !== 'undefined') {
                // get different types of errors out
                let keys = Object.keys(exception.response.data)
                let errorMessage  // if it was in the 'message' field
                let errorError  // if it was in the 'error' field
                let errorDetail  // if it was in the 'detail' field
                let errorField  // any that is a [], DOES NOT support multiple yet
                for (let i = 0; i < keys.length; ++i) {
                    let err = exception.response.data[keys[i]]
                    if (err instanceof Array) {  // handle field errors - {'password': ['...']}
                        errorField = `${keys[i]} - ${err[0]}`
                    }
                    if (keys[i] == "message") { // this is a 'generic' error from our django bootstrapper
                        errorMessage = exception.response.data.message
                    }
                    if (keys[i] == "detail") { // this is a 'generic' error from our django bootstrapper
                        errorDetail = exception.response.data.detail
                    }
                    if (keys[i] == "error") {  // some django internals use 'detail', typically auth related
                        errorError = exception.response.data.error
                    }
                    // - TODO handle 'non_field_error': []
                }


                // craft response - precedence of errors below
                if (typeof errorField != 'undefined' && errorField != '') {   // 1. error field
                    return new ApiResponseError(this.response, errorField)
                } else if (typeof errorDetail != 'undefined' && errorDetail != '') {  // 2. error detail
                    return new ApiResponseError(this.response, errorDetail)
                } else if (typeof errorError != 'undefined' && errorError != '') {  // 3. error error
                    return new ApiResponseError(this.response, errorError)

                } else {  // 4. error message
                    return new ApiResponseError(this.response, errorMessage)
                }
            } else {  // 'data' doesnt exist -> error
                return new ApiResponseError(this.response, exception.response)
            }
        }

        // exception is just a string/js error
        if (typeof exception == 'string') {  // replace with Object.keys(exception).length === 0?
            return new ApiResponseError(this.response, exception)
        }

        // default error
        return new ApiResponseError(this.response)
    }

}