import axios from "axios"
import Cookies from "js-cookie"

/**
 *
 * BASE API
 *
 * Generic API interface - use this for any external service or REST API
 * interaction to simplify common functions. Handles Axios, basic URL management, and similar
 *
 * @param {string} name - API Name, primarily for logging.
 * @param {string} urlEndpoint - Endpoint of this URL. Should NOT include / or urlBase (i.e., "/api/").
 * @param {string=} urlBase - Base URL to use - defaults to environment URL.
 * @param {number=} timeout - Default request timeout.
 */
export abstract class BaseApi {
    // parameters
    name: string
    urlEndpoint: string
    urlBase: string
    timeout: number

    /**
     * CONSTRUCTOR
     */
    protected constructor(name: string, urlEndpoint: string, urlBase: string, timeout: number = 10000) {
        this.name = name
        this.urlEndpoint = urlEndpoint
        this.urlBase = urlBase
        this.timeout = timeout

        // setup axios client
        this._axiosInstance = axios.create({
            baseURL: this.urlBase,
            timeout: this.timeout,
            xsrfCookieName: 'csrftoken',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken') || '',
                // 'Authorization': "Token a35ff496e17913415d0737eae6b6798991a5c442"
            }
        })
    }


    /**
     * URLS
     *
     * urlApi() - full API url.
     *
     * @param {string=} slug - Param to add extra fields, id's, filters, etc.
     * @return {string} URL
     */
    urlApi(slug?: string) {
        if (typeof slug == 'undefined' || slug == '') {
            return `${this.urlBase}/api/${this.urlEndpoint}/`
        } else {
            return `${this.urlBase}/api/${this.urlEndpoint}/${slug}/`
        }
    }


    /**
     * CLIENT
     * The API Client should be defined as a `static` value on the subclass.
     **/
    _axiosInstance: any

    get client() {
        return this._axiosInstance
    }


    /**
     * HTTP METHODS
     *
     * Standard HTTP wrapper functions to handle basic
     * functionality, formatting, auth, sanitizing etc.
     * Automatically wrap responses in ApiResponseHandler.
     *
     * Supported methods
     * - GET, POST, PATCH, DELETE
     **/
    async httpGet(url: string, authenticate: Boolean = false, headers = {}): Promise<any> {
        return this.client.get(url, {}, headers)
    }

    async httpPost(url: string, body: Object, authenticate: Boolean = false, headers = {}): Promise<any> {
        return this.client.post(url, body, headers)
    }

    async httpPatch(url: string, body: Object, authenticate: Boolean = false, headers = {}): Promise<any> {
        return await this.client.patch(url, body, headers)
    }

    async httpDelete(url: string, authenticate: Boolean = false, headers = {}): Promise<any> {
        return await this.client.delete(url, {headers: headers})
    }
}