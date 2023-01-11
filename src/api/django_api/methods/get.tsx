import { ApiResponseHandler } from '../../api_response_handler';
import { ApiResponse } from '../../types';
import { BaseApi } from '../base_api';

/**
 *
 * DJANGO GET
 *
 * Django Api base class - use this for any Django Rest APIs
 * This handles common functionality like authentication and
 * formatting specific request types.
 *
 * The generic type T is meant to represent the Django object
 * we are dealing with - User, Post, etc. - can set to 'any'
 * if this doesn't make sense with your API/models.
 *
 * @param {string} name - API Name, primarily for logging.
 * @param {string} urlBase - Base URL to use for API requests.
 * @param {string} urlEndpoint - Endpoint of this URL. Should NOT include / or urlBase (i.e., "/api/").
 * @param {string=} token - Auth token to use.
 */
export default class DjangoGet<Model> extends DjangoApi {
  token: string;
  list: Model[] = [];
  details?: Model;
  count?: number;
  next?: string;
  prev?: string;
  pageCurrent = 1;
  pageTotal = 1;
}
