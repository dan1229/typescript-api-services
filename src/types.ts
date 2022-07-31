

/*
* API RESPONSE
 */
export abstract class ApiResponse {
    message: string
    error: boolean;
    obj: any
    response: any

    protected constructor(response: any, message: string = "API response.", error = true, obj = {}) {
        this.message = message
        this.error = error
        this.obj = obj
        this.response = response
    }
}


/*
* API RESPONSE ERROR
 */
export class ApiResponseError extends ApiResponse {
    constructor(response: any, message: string = "Error handling request. Please try again later.", obj = {}) {
        super(response, message, true, obj);
    }
}

/*
* API RESPONSE SUCCESS
 */
export class ApiResponseSuccess extends ApiResponse {
    constructor(response: any, message: string = "Successful request.", obj = {}) {
        super(response, message, false, obj);
    }
}

