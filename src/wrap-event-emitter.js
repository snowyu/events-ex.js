import {defineProperty} from 'util-ex'
import eventable from './eventable'

const create = Object.create;
const defineProperties = Object.defineProperties;

export const methods = eventable().methods;

/**
 * Minimal set of core methods to be injected into an existing object.
 */
const descriptors = {
  on: { value: methods.on },
  once: { value: methods.once },
  off: { value: methods.off },
  emit: { value: methods.emit },
  emitAsync: { value: methods.emitAsync },
  setEmitterOptions: { value: methods.setEmitterOptions },
};

/**
 * Full set of all available methods from eventable for standalone instances.
 */
const fullDescriptors = {};
Object.keys(methods).forEach(key => {
  fullDescriptors[key] = { value: methods[key] };
});

const base = defineProperties({}, fullDescriptors);

/**
 * Create or inject the eventable instance into the object
 * @param {Object} [o] the optional instance to eventable
 * @param {Object} [options] optional configuration for the emitter
 * @returns o or new Event instance
 */
export function wrapEventEmitter(o, options) {
  const result = o == null ? create(base) : defineProperties(Object(o), descriptors)
  defineProperty(result, '_events', {})
  if (options && options.emitterOptions) {
    result.setEmitterOptions(options.emitterOptions)
  }
  return result
};

export default wrapEventEmitter
