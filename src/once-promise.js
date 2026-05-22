// @sourceType: module
import validObject from './util/valid-object'
import {createAbortError} from './consts'

/**
 * Returns a Promise that resolves with the Event object when the specified event is emitted on the given emitter.
 * If an 'error' event is emitted (and the waiting event is not 'error'), the promise rejects.
 * If the provided AbortSignal is aborted, the promise rejects with an AbortError.
 *
 * Note: The resolved Event object's `result` field may not be the final value if other listeners have not yet run.
 * For the definitive emit return value, use `emit()` or `emitAsync()` directly.
 *
 * @param {import('./event-emitter').EventEmitter} emitter - The event emitter to listen on.
 * @param {string|RegExp} type - The event type to wait for.
 * @param {Object} [options] - Optional configuration.
 * @param {AbortSignal} [options.signal] - An AbortSignal to cancel the wait.
 * @returns {Promise<import('./event').Event>} - A promise that resolves with the Event object.
 * @throws {TypeError} - If emitter is not a valid event emitter object.
 */
export function oncePromise(emitter, type, options) {
  validObject(emitter)

  const signal = options && options.signal

  return new Promise((resolve, reject) => {
    let onAbort = null
    let aborted = false

    const cleanup = () => {
      emitter.off(type, onEvent)
      if (type !== 'error') {
        emitter.off('error', onError)
      }
      if (signal && onAbort) {
        signal.removeEventListener('abort', onAbort)
      }
    }

    if (signal) {
      if (signal.aborted) {
        reject(createAbortError())
        return
      }
      onAbort = () => {
        if (!aborted) {
          aborted = true
          cleanup()
          reject(createAbortError())
        }
      }
      signal.addEventListener('abort', onAbort, { once: true })
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
