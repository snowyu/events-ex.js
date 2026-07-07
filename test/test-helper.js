import {assert} from 'chai'
import {methods} from '../src/wrap-event-emitter'

/**
 * Creates an event emitter with all methods as configurable own properties.
 *
 * By default, ee() / wrapEventEmitter() places methods on the prototype (via
 * Object.create(base)). This helper puts them directly on the object as
 * configurable, writable own properties, which is needed to test code paths
 * that check `getOwnPropertyDescriptor` (e.g. pipe / pipeAsync).
 *
 * @returns {Object} A plain object with all emitter methods as own properties.
 */
export function createConfigurableEmitter() {
  const obj = {}
  for (const key of Object.keys(methods)) {
    Object.defineProperty(obj, key, { value: methods[key], configurable: true, writable: true })
  }
  return obj
}

/**
 * Async sleep helper — returns a Promise that resolves after `ms` milliseconds.
 * Used across multiple test files for timing-related async tests.
 *
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Shallow deep-equality assertion helper for Event objects and argument arrays.
 * Checks that every key in `expected` has the same value in `act`.
 *
 * @param {Object} act - The actual value.
 * @param {Object} expected - The expected value.
 * @param {string} [msg] - Optional assertion message.
 */
export function deepEqu(act, expected, msg) {
  assert.exists(act)
  assert.exists(expected)
  for (const i in expected) {
    assert.equal(act[i], expected[i], msg)
  }
}
