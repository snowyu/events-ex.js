/**
 * Creates a new Event object instance that contains information about the event, such as the target element and the return value of the event.
 * @class
 * @classdesc Event Object that contains information about the event, such as the target element and the return value of the event.
 * @param {import('./event-emitter').EventEmitter} target - Who trigger the event
 * @returns {Event} - The new Event instance.
 */
export function Event(target, type) {
  if (!(this instanceof Event)) {
    const evt = new Event(target, type)
    return evt
  }
  this.init(target, type)
}

/**
 * Initializes the event with the target object.
 * @param {import('./event-emitter').EventEmitter} target - The target object for the event.
 */
Event.prototype.init = function(target, type) {
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
}

/**
 * Ends the event and returns the result.
 * @returns {*} The result of the event.
 */
Event.prototype.end = function() {
  return this.result
}

export default Event
