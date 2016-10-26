const p = Object.freeze({
  api: Symbol('api'),
  settings: Symbol('settings'),
  userNamesToIdMap: Symbol('userNamesToIdMap'),
  userIdToNamesMap: Symbol('userNamesToIdMap'),
});

export default class Reminders {
  constructor(api, settings) {
    this[p.api] = api;
    this[p.settings] = settings;

    this[p.userNamesToIdMap] = {};
    this[p.userIdToNamesMap] = {};

    Object.seal(this);
  }

  /**
   * Method to be called when the user is logged in.
   * @return {Promise}
   */
  init() {
    if (Object.keys(this[p.userNamesToIdMap]).length) {
      return Promise.resolve();
    }

    return this.getAllUsersInGroup();
  }

  /**
   * Retrieves all the users in the group of the current user.
   * This is used to map user names to their respective ids.
   */
  getAllUsersInGroup() {
    return Promise.all([
      this[p.api].get('users/myself'),
      this[p.api].get('users/myself/relations'),
    ])
      .then(([thisUser, users]) => {
        users.push(thisUser);

        this[p.userNamesToIdMap] = {};
        this[p.userIdToNamesMap] = {};
        users.forEach((user) => {
          if (!user.forename) {
            return;
          }

          this[p.userNamesToIdMap][user.forename] = user.id;
          this[p.userIdToNamesMap][user.id] = user.forename;
        });
      });
  }

  getUsers() {
    return ['me'].concat(Object.keys(this[p.userNamesToIdMap]));
  }

  mapUsersToId(users = []) {
    if (!users.length) {
      return [
        {
          id: 'myself',
        }
      ];
    }

    return users.map((user) => {
      if (user.toLowerCase() === 'me') {
        return {
          id: 'myself',
        };
      }

      if (!this[p.userNamesToIdMap][user]) {
        console.error('Unknown user', user);
      }

      return {
        id: this[p.userNamesToIdMap][user],
        forename: user,
      };
    });
  }

  /**
   * Retrieves the list of the reminders.
   *
   * @return {Promise<Array>} A promise that resolves with an array of objects.
   */
  getAll() {
    return this[p.api].get('reminders');
  }

  /**
   * Gets a reminder given its id.
   *
   * @param {string} id The ID of the reminder to retrieve.
   * @return {Promise}
   */
  get(id) {
    return this[p.api].get(`reminders/${id}`);
  }

  /**
   * Create a new reminder.
   *
   * @param {Object} body
   * @return {Promise}
   */
  set(body) {
    body.recipients = this.mapUsersToId(body.recipients);
    return this[p.api].post(`reminders`, body);
  }

  /**
   * Create a new reminder.
   *
   * @param {Object} body
   * @return {Promise}
   */
  update(body) {
    const id = parseInt(body.id, 10);

    if (Number.isNaN(id) || typeof id !== 'number') {
      return Promise.reject(new Error('The reminder id is not a number.'));
    }

    delete body.recipients;
    return this[p.api].patch(`reminders/${id}`, body);
  }

  /**
   * Delete a reminder given its ID.
   *
   * @param {string} id The ID of the reminder to delete.
   * @return {Promise}
   */
  delete(id) {
    return this[p.api].delete(`reminders/${id}/recipients/myself`);
  }
}
