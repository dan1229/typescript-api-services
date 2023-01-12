import { BaseApi } from '../base_api';

/**
 *
 * DJANGO SERVICE
 *
 * Django Service - TODO
 *
 * @param {string} name - API Name, primarily for logging.
 * @param {string} urlBase - Base URL to use for API requests.
 * @param {string} urlEndpoint - Endpoint of this URL. Should NOT include / or urlBase (i.e., "/api/").
 * @param {string=} token - Auth token to use.
 */
export default class DjangoService extends BaseApi {
  token: string;

  public constructor(name: string, urlBase: string, urlEndpoint: string, token?: string) {
    super(name, urlBase, urlEndpoint);
    if (!token) {
      token = '';
    }
    this.token = token;
  }
}
