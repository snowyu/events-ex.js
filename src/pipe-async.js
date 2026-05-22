import defineProperty from 'util-ex/lib/defineProperty'

import {methods} from './wrap-event-emitter'
import arrRemove from './util/array-remove'
import validObject from './util/valid-object'

const hasOwnProperty = Object.prototype.hasOwnProperty
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
const arrFrom        = Array.from
const emit           = methods.emitAsync

/**
 * Creates a pipeline between two event emitters, so that any events emitted by the first emitter are also emitted by the second emitter.
 *
 * @param {import('./event-emitter').EventEmitter} e1 - The first event emitter.
 * @param {import('./event-emitter').EventEmitter} e2 - The second event emitter.
 * @param {string} [name='emitAsync'] - The name of the event to pipe (defaults to 'emitAsync').
 * @param {Object} [options] - Configuration for the pipeline.
 * @param {string} [options.asyncMode='serial'] - The mode of propagation ('serial' or 'parallel').
 * @param {string} [options.resultMode] - Strategy for aggregating results from the pipe chain ('collect', 'first').
 * @param {AbortSignal} [options.signal] - An AbortSignal to cancel forwarding to remaining pipe targets (serial mode only).
 *   Can also be set on the source emitter via `configure({ signal })`.
 * @returns {Object} - An object with a `close` method that removes the pipeline between the two event emitters.
 * @throws {TypeError} - If either of the arguments is not an event emitter object.
 */
export function pipeAsync(e1, e2/* , name, options */) {
  let pipes

  (validObject(e1) && validObject(e2))
  let name = arguments[2]
  let options = arguments[3]
  if (typeof name === 'object') {
    options = name
    name = undefined
  }
  if (name === undefined) {name = 'emitAsync'}
  if (!options) {options = {}}

  const result = {
    close() { arrRemove.call(pipes, e2) }
  };
  if (hasOwnProperty.call(e1, '__eePipes__')) {
    (pipes = e1.__eePipes__).push(e2)
    return result
  }
  defineProperty(e1, '__eePipes__', pipes = [e2])
  let desc = getOwnPropertyDescriptor(e1, name)
  if (!desc) {
    desc = {}
  } else {
    delete desc.get
    delete desc.set
  }
  desc.value = async function () {
    const data = arrFrom(pipes)
    const asyncMode = options.asyncMode || 'serial'
    const resultMode = options.resultMode

    const forward = async (target, args) => {
      const fn = target[name] || target.emitAsync || emit
      return fn.apply(target, args)
    }

    // Read signal from source emitter's runtime options, if configured
    const signal = this._eeRuntimeOptions && this._eeRuntimeOptions.signal

    if (asyncMode === 'parallel') {
      const promises = [emit.apply(this, arguments)]
      for (let i = 0; i < data.length; ++i) {
        promises.push(forward(data[i], arguments))
      }
      const results = await Promise.all(promises)
      if (resultMode === 'collect') return results
      if (resultMode === 'first') return results.find(r => r !== undefined)
      return results[0] // Default: return main emitter's result
    } else {
      const mainResult = await emit.apply(this, arguments)
      const allResults = [mainResult]
      for (let i = 0; i < data.length; ++i) {
        // Check signal before forwarding to each pipe target in serial mode
        if (signal && signal.aborted) break
        const res = await forward(data[i], arguments)
        allResults.push(res)
      }
      if (resultMode === 'collect') return allResults
      if (resultMode === 'first') return allResults.find(r => r !== undefined)
      return mainResult // Default: return main emitter's result
    }
  }
  defineProperty(e1, name, desc.value, desc)
  return result
};

export default pipeAsync
