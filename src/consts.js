const CONTINUE = undefined
const DONE = 1
const STOPPED = 2
const ABORT = -1

export const states = {
  CONTINUE,
  DONE,
  STOPPED,
  ABORT,
}

export const RegExpEventSymbol = typeof Symbol === 'function' ? Symbol('RegExpEvent') : '@@RegExpEvent'

/**
 * Creates an AbortError with name 'AbortError'.
 * Ensures a fresh Error instance each call for proper stack traces.
 * @returns {Error}
 */
export function createAbortError() {
  return Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
}
