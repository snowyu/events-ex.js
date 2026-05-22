// @sourceType: module
import validObject from './util/valid-object'

/**
 * Returns a Promise that resolves with the Event object when the specified event is emitted on the given emitter.
 * If an 'error' event is emitted (and the waiting event is not 'error'), the promise rejects.
 *
 * Note: The resolved Event object's `result` field may not be the final value if other listeners have not yet run.
 * For the definitive emit return value, use `emit()` or `emitAsync()` directly.
 *
 * @param {import('./event-emitter').EventEmitter} emitter - The event emitter to listen on.
 * @param {string|RegExp} type - The event type to wait for.
 * @returns {Promise<import('./event').Event>} - A promise that resolves with the Event object.
 * @throws {TypeError} - If emitter is not a valid event emitter object.
 */
export function oncePromise(emitter, type) {
  validObject(emitter)

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      emitter.off(type, onEvent)
      if (type !== 'error') {
        emitter.off('error', onError)
      }
    }

    function onEvent() {
      cleanup()
      resolve(this) // resolve with the Event object
    }

    function onError(err) {
      cleanup()
      reject(err)
    }

    emitter.on(type, onEvent)
    if (type !== 'error') {
      emitter.on('error', onError)
    }
  })
}

export default oncePromise
