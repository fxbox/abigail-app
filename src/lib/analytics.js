/* global ga */

// Private members.
const p = Object.freeze({
  ga: Symbol('ga'),
});

let instance = null;

export default class Analytics {
  constructor(props) {
    if (instance) {
      return instance;
    }

    Object.assign(this, props || {});

    // Creates an initial ga() function.
    // The queued commands will be executed once analytics.js loads.
    window.ga = window.ga || function() {
        (ga.q = ga.q || []).push(arguments);
      };

    // Sets the time (as an integer) this tag was executed.
    // Used for timing hits.
    ga.l = Date.now();

    // Creates a default tracker.
    ga('create', 'UA-83150540-1', {
      'siteSpeedSampleRate': 100,
      'forceSSL': true,
      'dataSource': 'app', // Rather than web.
      'appName': 'Project Abigail',

      // Disabling cookies.
      // @see https://developers.google.com/analytics/devguides/collection/
      //    analyticsjs/cookies-user-id#disabling_cookies
      'storage': 'none',
      'clientId': this.settings.gaClientID,
    });

    // Using localStorage to store the client ID.
    // @see https://developers.google.com/analytics/devguides/collection/
    //    analyticsjs/cookies-user-id#using_localstorage_to_store_the_client_id
    ga((tracker) => {
      this.settings.gaClientID = tracker.get('clientId');
    });

    // Sends a pageview hit from the tracker just created.
    ga('send', 'pageview');

    // Track the installation of the app using the W3C app manifest.
    addEventListener('install', () => {
      ga('send', 'event', 'App', 'install');
    });

    this[p.ga] = ga;

    Object.freeze(this);

    instance = this;
  }

  /**
   * Send a screenview.
   *
   * @param {string} screenName
   */
  screenView(screenName = 'Unknown') {
    this[p.ga]('send', 'screenview', { screenName });
  }

  /**
   * Send an event.
   *
   * @param {string} category
   * @param {string} action
   * @param {string} label
   * @param {string|number} value
   */
  event(category, action, label, value) {
    this[p.ga]('send', 'event', category, action, label, value);
  }
}
