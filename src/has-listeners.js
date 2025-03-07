
import {isEmptyObject} from 'util-ex'

const hasOwnProperty = Object.prototype.hasOwnProperty;

function isValue(v) {
	return v!== null && v!== undefined
}

/**
 * Checks if an object has event listeners.
 *
 * @param {Object} obj - The object to check. Must not be null or undefined.
 * @param {string} [type] - Optional parameter specifying the event type. If provided, checks for the existence of listeners for this specific type.
 * @returns {boolean}
 *          - If `type` is provided, returns whether listeners for the specified event type exist.
 *          - If `type` is not provided, returns whether the object has any event listeners.
 * @throws {TypeError} Throws a TypeError if `obj` is null or undefined.
 */
export function hasListeners(obj, type) {
	if (!isValue(obj)) {throw new TypeError("Cannot use null or undefined")}

	const result = type != null ? hasOwnProperty.call(obj, '_events') && obj._events[type] : obj.hasOwnProperty('_events') && !isEmptyObject(obj._events);
	return result;
};

export default hasListeners
