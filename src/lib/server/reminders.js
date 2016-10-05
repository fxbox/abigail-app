const p = Object.freeze({
  api: Symbol('api'),
  settings: Symbol('settings'),
});

export default class Reminders {
  constructor(api, settings) {
    this[p.api] = api;
    this[p.settings] = settings;

    Object.seal(this);
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
    return this[p.api].post(`reminders`, body);
  }

  /**
   * Create a new reminder.
   *
   * @param {Object} body
   * @return {Promise}
   */
  update(body) {
    const id = body.id;

    if (isNaN(id) || typeof id !== 'number') {
      return Promise.reject(new Error('The reminder id is not a number.'));
    }

    return this[p.api].put(`reminders/${id}`, body);
  }

  /**
   * Delete a reminder given its ID.
   *
   * @param {string} id The ID of the reminder to delete.
   * @return {Promise}
   */
  delete(id) {
    return this[p.api].delete(`reminders/${id}`);
  }
}
