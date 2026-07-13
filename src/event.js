/**
 * Creates a new Event object instance that contains information about the event, such as the target element and the return value of the event.
 * @class
 * @classdesc Event Object that contains information about the event, such as the target element and the return value of the event.
 * @param {import('./event-emitter').EventEmitter} target - Who trigger the event
 * @param {string} type - The event type name
 * @param {Object} [opts] - The emission configuration options
 * @returns {Event} - The new Event instance.
 */
export function Event(target, type, opts) {
  if (!(this instanceof Event)) {
    const evt = new Event(target, type, opts)
    return evt
  }
  this.init(target, type, opts)
}

/**
 * Initializes the event with the target object.
 * @param {import('./event-emitter').EventEmitter} target - The target object for the event.
 * @param {string} type - The event type name.
 * @param {Object} [opts] - The emission configuration options (asyncMode, resultMode, signal, raiseError, etc.).
 *   Stored as a frozen object on `this.config` for listener introspection.
 */
Event.prototype.init = function(target, type, opts) {
  /**
   * Who trigger the event
   * @type {Object}
   * @public
   */
  this.target = target
  /**
   * Whether stop the bubbling event
   * @type {boolean}
   * @public
   */
  this.stopped = false
  /**
   * Whether the event emission was aborted via AbortSignal.
   * @type {boolean}
   * @public
   */
  this.aborted = false
  /**
   * Whether a result has been resolved (for 'first' result mode)
   * @type {boolean}
   * @public
   */
  this.resolved = false
  /**
   * Keep your event result here if any.
   * @type {*}
   * @public
   */
  this.result = undefined
  /**
   * The type of the event.
   * @type {string}
   * @public
   */
  this.type = type;
  /**
   * The frozen emission configuration used for this emit call.
   * Contains asyncMode, resultMode, signal, raiseError, etc.
   * Only set when opts is non-empty.
   * @type {Object|undefined}
   * @public
   */
  if (opts) {
    var keys = Object.keys(opts);
    if (keys.length > 0) {
      this.config = Object.freeze(opts);
    }
  }
}

/**
 * Ends the event and returns the result.
 * @returns {*} The result of the event.
 */
Event.prototype.end = function() {
  return this.result
}

export default Event
