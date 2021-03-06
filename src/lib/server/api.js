const p = Object.freeze({
  settings: Symbol('settings'),
  net: Symbol('net'),

  // Private methods.
  getURL: Symbol('getURL'),
  onceOnline: Symbol('onceOnline'),
  onceReady: Symbol('onceReady'),
  getChannelValues: Symbol('getChannelValues'),
  updateChannelValue: Symbol('updateChannelValue'),
});

/**
 * Instance of the API class is intended to abstract consumer from the API
 * specific details (e.g. API base URL and version). It also tracks
 * availability of the network, API host and whether correct user session is
 * established. If any of this conditions is not met all API requests are
 * blocked until it's possible to perform them, so consumer doesn't have to
 * care about these additional checks.
 */
export default class API {
  constructor(net, settings) {
    this[p.net] = net;
    this[p.settings] = settings;

    Object.freeze(this);
  }

  /**
   * Performs HTTP 'GET' API request and accepts JSON as response.
   *
   * @param {string} path Specific API resource path to be used in conjunction
   * with the base API path.
   * @return {Promise}
   */
  get(path) {
    return this[p.onceReady]()
      .then(() => this[p.net].fetchJSON(this[p.getURL](path)));
  }

  /**
   * Performs HTTP 'POST' API request and accepts JSON as response.
   *
   * @param {string} path Specific API resource path to be used in conjunction
   * with the base API path.
   * @param {Object=} body Optional object that will be serialized to JSON
   * string and sent as 'POST' body.
   * @return {Promise}
   */
  post(path, body) {
    return this[p.onceReady]()
      .then(() => this[p.net].fetchJSON(this[p.getURL](path), 'POST', body));
  }

  /**
   * Performs HTTP 'PUT' API request and accepts JSON as response.
   *
   * @param {string} path Specific API resource path to be used in conjunction
   * with the base API path.
   * @param {Object=} body Optional object that will be serialized to JSON
   * string and sent as 'PUT' body.
   * @return {Promise}
   */
  put(path, body) {
    return this[p.onceReady]()
      .then(() => this[p.net].fetchJSON(this[p.getURL](path), 'PUT', body));
  }

  /**
   * Performs HTTP 'PATCH' API request and accepts JSON as response.
   *
   * @param {string} path Specific API resource path to be used in conjunction
   * with the base API path.
   * @param {Object=} body Optional object that will be serialized to JSON
   * string and sent as 'PATCH' body.
   * @return {Promise}
   */
  patch(path, body) {
    return this[p.onceReady]()
      .then(() => this[p.net].fetchJSON(this[p.getURL](path), 'PATCH', body));
  }

  /**
   * Performs HTTP 'DELETE' API request and accepts JSON as response.
   *
   * @param {string} path Specific API resource path to be used in conjunction
   * with the base API path.
   * @param {Object=} body Optional object that will be serialized to JSON
   * string and sent as 'DELETE' body.
   * @return {Promise}
   */
  delete(path, body) {
    return this[p.onceReady]()
      .then(() => this[p.net].fetchJSON(this[p.getURL](path), 'DELETE', body));
  }

  /**
   * Performs either HTTP 'GET' or 'PUT' (if body parameter is specified) API
   * request and accepts Blob as response.
   *
   * @param {string} path Specific API resource path to be used in conjunction
   * with the base API path.
   * @param {Object=} body Optional object that will be serialized to JSON
   * string and sent as 'PUT' body.
   * @param {string=} accept Mime type of the Blob we expect as a response
   * (default is image/jpeg).
   * @return {Promise}
   */
  blob(path, body, accept = 'image/jpeg') {
    return this[p.onceReady]()
      .then(() => {
        if (body) {
          return this[p.net].fetchBlob(
            this[p.getURL](path), accept, 'PUT', body
          );
        }

        return this[p.net].fetchBlob(this[p.getURL](path), accept);
      });
  }

  /**
   * Creates a fully qualified API URL based on predefined base origin, API
   * version and specified resource path.
   *
   * @param {string} path Specific API resource path to be used in conjunction
   * with the base API path and version.
   * @return {string}
   * @private
   */
  [p.getURL](path) {
    if (!path || typeof path !== 'string') {
      throw new Error('Path should be a valid non-empty string.');
    }

    return `${this[p.net].origin}/api/v${this[p.settings].apiVersion}/${path}`;
  }

  /**
   * Returns a promise that is resolved once API is ready to use (API host is
   * online).
   * In the future we can add more checks like:
   * * User is authenticated
   * * Document is visible
   *
   * @returns {Promise}
   * @private
   */
  [p.onceReady]() {
    return Promise.all([
      this[p.onceOnline](),
    ]);
  }

  /**
   * Returns a promise that is resolved once API host is discovered and online.
   *
   * @returns {Promise}
   * @private
   */
  [p.onceOnline]() {
    const net = this[p.net];
    if (net.online) {
      return Promise.resolve();
    }

    return new Promise((resolve) => net.once('online', () => resolve()));
  }
}
