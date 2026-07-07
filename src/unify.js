import validObject from './util/valid-object'
import forEach from './util/object-for-each'

const push = Array.prototype.push
const defineProperty = Object.defineProperty
const create = Object.create
const hasOwnProperty = Object.prototype.hasOwnProperty
const d = { configurable: true, enumerable: false, writable: true }

/**
 * Unifies the event listeners of two event emitter objects so that they share the same set of listeners for each event.
 *
 * @param {import('./event-emitter').EventEmitter} e1 - The first event emitter object.
 * @param {import('./event-emitter').EventEmitter} e2 - The second event emitter object.
 * @throws {TypeError} - If either of the arguments is not an event emitter object.
 */
export function unify(e1, e2) {
	(validObject(e1) && validObject(e2))
	if (!hasOwnProperty.call(e1, '_events')) {
		if (!hasOwnProperty.call(e2, '_events')) {
			d.value = create(null);
			defineProperty(e1, '_events', d)
			defineProperty(e2, '_events', d)
			d.value = null
			return
		}
		d.value = e2._events
		defineProperty(e1, '_events', d)
		d.value = null
		return
	}
	const data = d.value = e1._events;
	if (!hasOwnProperty.call(e2, '_events')) {
		defineProperty(e2, '_events', d)
		d.value = null
		return
	}
	if (data === e2._events) {return}
	forEach(e2._events, function (listener, name) {
		if (!data[name]) {
			data[name] = listener
			return
		}
		if (typeof data[name] === 'object') {
			if (typeof listener === 'object') {push.apply(data[name], listener)}
			else data[name].push(listener)
		} else if (typeof listener === 'object') {
			listener.unshift(data[name])
			data[name] = listener
		} else {
			data[name] = [data[name], listener]
		}
	});
	defineProperty(e2, '_events', d)
	d.value = null
}

export default unify
