// @sourceType: module
import validObject from './util/valid-object'
import {createAbortError} from './consts'

/**
 * Returns a Promise that resolves with the Event object when the specified event is emitted on the given emitter.
 * If an 'error' event is emitted (and the waiting event is not 'error'), the promise rejects by default.
 * If the provided AbortSignal is aborted, the promise rejects with an AbortError.
 *
 * Note: The resolved Event object's `result` field may not be the final value if other listeners have not yet run.
 * For the definitive emit return value, use `emit()` or `emitAsync()` directly.
 *
 * @param {import('./event-emitter').EventEmitter} emitter - The event emitter to listen on.
 * @param {string|RegExp} type - The event type to wait for.
 * @param {Object} [options] - Optional configuration.
 * @param {AbortSignal} [options.signal] - An AbortSignal to cancel the wait.
 * @param {boolean|null} [options.raiseError] - Controls behavior when an 'error' event is emitted:
 *   - `true` / `undefined` (default): The promise rejects with the error.
 *   - `false`: The promise resolves with the error object instead of rejecting.
 * @returns {Promise<import('./event').Event>} - A promise that resolves with the Event object.
 *   The resolved Event has `type`, `target`, `result`, and `config` (if the emitter had emission options configured).
 * @throws {TypeError} - If emitter is not a valid event emitter object.
 */
export function oncePromise(emitter, type, options) {
  validObject(emitter)

  const signal = options && options.signal
  const raiseError = options && options.raiseError

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
        /* v8 ignore next — defensive guard, { once: true } ensures callback fires at most once */
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
      if (raiseError === false) {
        resolve(err) // resolve with the error instead of rejecting
      } else {
        reject(err) // true | null | undefined → reject
      }
    }

    emitter.on(type, onEvent)
    if (type !== 'error') {
      emitter.on('error', onError)
    }
  })
}

export default oncePromise
