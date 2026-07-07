import {createAbilityInjector} from 'custom-ability'
import {defineProperty} from 'util-ex'
import defaultMethods from './default-methods'

/**
 * Creates an Eventable class with event-emitting capabilities.
 *
 * @param {Function} [aClass] - The target class to which event capabilities will be injected.
 *                              If not provided, a new base class (`Eventable`) is created and used.
 * @returns {Function} A class with event-emitting capabilities.
 */
function getEventableClass(aClass) {
  /**
   * Base Eventable class that provides event-related functionality.
   * @class
   */
  function Eventable() {}

  if (aClass == null) {aClass = Eventable}
  const methods = defaultMethods(aClass);
  defineProperty(Eventable, 'methods', methods);

  Eventable.defaultMaxListeners = 10;
  Eventable.listenerCount = methods.listenerCount;
  Eventable.prototype.listenerCount = methods.listenerCount;
  Eventable.prototype.emit = methods.emit;
  Eventable.prototype.emitAsync = methods.emitAsync;
  Eventable.prototype.configure = methods.configure;
  Eventable.prototype.parallel = methods.parallel;
  Eventable.prototype.setEmitterOptions = methods.setEmitterOptions;
  Eventable.prototype.on = methods.on;
  Eventable.prototype.addListener = methods.on;
  Eventable.prototype.off = methods.off;
  Eventable.prototype.removeListener = methods.off;
  Eventable.prototype.removeAllListeners = methods.removeAllListeners;
  Eventable.prototype.once = methods.once;
  Eventable.prototype.setMaxListeners = methods.setMaxListeners;
  Eventable.prototype.listeners = methods.listeners;
  return Eventable;
};

/**
 * Adds event-emitting capabilities to a class by injecting necessary methods and properties.
 *
 * This function uses `createAbilityInjector` from `custom-ability` to inject event-related methods
 * into the target class. The injected methods include standard EventEmitter functionality such as
 * `on`, `off`, `emit`, `emitAsync`, `once`, `listeners`, `@listenerCount` and more. It also ensures compatibility with Node.js `EventEmitter`
 * by including methods like `listenerCount`, `setMaxListeners`, `addListener`, `removeListener`, and `removeAllListeners`.
 *
 * @function eventable
 * @param {Class} [aClass] - The target class to which event capabilities will be injected. if no class is provided, a new class with eventable will be created.
 * @param {Object} [options] - Optional configuration for the injection process:
 *   * `include` (string[]|string): Specifies which methods should be added.
 *     Static methods should use the prefix '@'.
 *   * `exclude` (string[]|string): Specifies which methods should not be added.
 *     Static methods should use the prefix '@'.
 *   * `methods` (Object): Custom methods to override or extend the default behavior.
 *     Use `this.super()` to call the original method and `this.self` to access the original context.
 *   * `classMethods` (Object): Custom static methods to be added to the class.
 * @returns {Class} The same `aClass` class with event capabilities injected. The return value is the modified `aClass` itself.
 *
 * @example
 * import { eventable } from 'events-ex';
 *
 * class MyClass {}
 *
 * // Inject only specific methods: 'on', 'off', 'emit', 'emitAsync', and the static 'listenerCount'
 * eventable(MyClass, { include: ['on', 'off', 'emit', 'emitAsync', '@listenerCount'] });
 *
 * @example
 * import { eventable } from 'events-ex';
 *
 * class OtherClass {
 *   exec() {
 *     console.log("Original exec");
 *   }
 * }
 *
 * // Inject event capabilities and override the `exec` method
 * eventable(OtherClass, {
 *   methods: {
 *     exec() {
 *       console.log("New exec");
 *       this.super(); // Calls the original `exec` method
 *     }
 *   }
 * });
 */
export const eventable = createAbilityInjector(getEventableClass, true);
export default eventable;
