### events-ex [![npm](https://img.shields.io/npm/v/events-ex.svg)](https://npmjs.org/package/events-ex) [![downloads](https://img.shields.io/npm/dm/events-ex.svg)](https://npmjs.org/package/events-ex) [![license](https://img.shields.io/npm/l/events-ex.svg)](https://npmjs.org/package/events-ex)

Browser-friendly enhanced event emitter [ability][Ability] and class. It's modified from [event-emitter][event-emitter] mainly. It can add/inject the event-able [ability][Ability] to your any class.

### Features

* **Modular Event-able Ability**: Inject event capabilities into any class using `eventable(MyClass)` without forced inheritance.
* **Core Event Enhancements**:
  * **Bubbling & Interruption**: Full support for event propagation and mid-stream cancellation.
  * **Listener Ordering**: Precise control via the optional `index` parameter in `on()` and `once()`. Supports special values `'first'` and `'last'` to ensure listeners stay at the boundaries.
  * **Regex Subscription**: Subscribe to multiple events using Regular Expressions.
  * **Hook-able System**: Intercept and modify event behavior at the core level.
* **Advanced Asynchronous Features (Specific to `emitAsync`)**:
  * **Configurable Concurrency**: Choose between **Serial** (default) and **Parallel** execution for async listeners.
  * **Result Aggregation**: Strategies to gather return values: `last` (default), `first` (first success), and `collect` (all results).
  * **Fluent API Proxies**: Use `.parallel()` and `.configure()` for transient, side-effect-free execution context.
  * **AbortSignal Support**: Cancel async event emissions via `configure({ signal })` or `oncePromise` with an `AbortSignal`.
* **Architecture**: Rewritten core for improved performance and flexibility while maintaining broad compatibility.
* **Event Utilities**: Built-in support for `pipe`, `pipeAsync`, `oncePromise`, `unify`, `allOff`, and `hasListeners`.

### Differences

* **Difference with [node events](https://nodejs.org/api/events.html)**
  + **`broken change`**: The event supports bubbling and interruption
    + the `event object` as listener's "this" object:
      * `result`: If set, the result is returned to the `Event Emitter`.
      * `stopped`: If set to `true`, it prevents the remaining listeners from being executed.
      * `aborted`: (Async only) `true` if the emission was cancelled by an `AbortSignal`.
      * `target`: The `Event Emitter` object, which was originally the `this` object.
      * `type`: triggered event type(name).
      * `resolved`: (Async only) Indicates if a successful result has been found in `first` mode.
    * **`broken change`**: The `emit` return the result of listeners's callback function instead of the successful state.
    * **`broken change`**: The `this` object of listeners' callback function is the `Event` Object instead of the emitter object.
      * The emitter object is put into the `target` property of the `Event` Object.
  * ⚡ **Enhanced `emitAsync` Method (Unique to Async)**:
    * **Sequential (Serial)**: Executes listeners one-by-one, respecting `this.stopped`.
    * **Concurrent (Parallel)**: Executes all listeners simultaneously.
    * **Result Strategies**:
      * `last`: Returns the result of the final listener (or last to finish).
      * `first`: Returns the first successful non-undefined result (skips errors).
      * `collect`: Returns an array of all results in registration order.
  * **Fluent Configuration**: Use `.parallel()` or `.configure({...})` for one-time customized async emits.
  * **Listener APIs**: `on/once(event: string|RegExp, listener, index?: number|'first'|'last')`
    * 📌 **Index Parameter** (Optional): Insertion position in the listener array.
      * `'first'` (`-Infinity`): Stays in the **Head** zone. The first listener added as `'first'` is placed at the very front.
      * `'last'` (`Infinity`): Stays in the **Tail** zone. The first listener added as `'last'` will always remain at the absolute end.
      * `number`: Relative index within the **Body** zone.
    * 🧪 **Regex Event Matching**: Listeners can bind to multiple events via regex patterns.

* **Difference with [event-emitter](https://github.com/medikoo/event-emitter)**
  + **`broken change`**: The event supports bubbling and interruption (see above).
  + Adds the `defaultMaxListeners` class property to keep compatibility with node events.
  + Adds the `setMaxListeners` method to keep compatibility with node events.
  + Adds `error`, `newListener` and `removeListener` events to keep compatibility with node events.
  + Adds `listeners()` method to keep compatibility with node events.
  + Adds `listenerCount()` class method to keep compatibility with node events.
  * Adds async event emitting via `emitAsync` method.

* 🔗 **Event Piping & Unification**:
  * `pipe(source, target)`: Sync event forwarding.
  * `pipeAsync(source, target, options)`: Async forwarding with configurable concurrency and aggregation.
  * `unify(emitter1, emitter2)`: Bi-directional synchronization.

Note: The listener throw error should not broke the notification, but it will emit error(`emit('error', error, 'notify', eventName, listener, args)`) after notification.

### Installation

```bash
npm install events-ex
```

### Usage

#### Extends from `EventEmitter` class

```js
import {EventEmitter} from 'events-ex';

class MyClass extends EventEmitter {}
```

#### Add/Inject the event-able [ability][Ability] to your class directly

```js
import {eventable} from 'events-ex';

class MyClass extends MyRoot {}

// inject the eventable ability to MyClass
eventable(MyClass);
```

#### Core Feature: Listener Ordering (Index Parameter)

```js
const ee = new EventEmitter();
ee.on('test', () => console.log('third'));
ee.on('test', () => console.log('first'), 'first'); // Always at the front
ee.on('test', () => console.log('last'), 'last');   // Always at the end
ee.on('test', () => console.log('second'), 1);      // Body index 1 (relative to Head)

ee.emit('test');
// Output:
// first
// second
// third
// last
```

#### Core Feature: Regex Subscription

```js
const ee = new EventEmitter();
ee.on(/^user\..*/, function(data) {
  console.log(`Event ${this.type} triggered with`, data);
});

ee.emit('user.login', { id: 1 });
ee.emit('user.logout', { id: 1 });
```

#### Core Feature: Bubbling & Interruption

```js
import {EventEmitter, states} from 'events-ex';
import {isObject} from 'util-ex';

class MyDb extends EventEmitter {
  get(key) {
    let result = this.emit('getting', key)
    if(isObject(result)) {
      if (result.state === states.ABORT) return
      if (result.state === states.DONE)  return result.result
    }
    return _get(key)
  }
}

let db = new MyDb
db.on('getting', function(key){
  let result = myGet(key);
  if (result != null) {
    this.result = { state: states.DONE, result: result }
    this.stopped = true // Skip remaining listeners
  } else {
    this.result = { state: states.ABORT };
  }
})
```

#### Async-Only Features: Concurrency & Aggregation

These features apply **only** to the `emitAsync` method.

```js
const ee = new EventEmitter();
ee.on('task', async () => {
  await sleep(100);
  return 'result 1';
});
ee.on('task', async () => {
  return 'result 2';
});

// 1. Default (Serial): Executes sequentially, returns 'result 2'
const res = await ee.emitAsync('task');

// 2. Parallel + Collect: Executes concurrently, returns ['result 1', 'result 2']
const allResults = await ee.parallel('collect').emitAsync('task');

// 3. Parallel + First: Executes concurrently, returns fastest success ('result 2')
const firstResult = await ee.parallel('first').emitAsync('task');
```

#### AbortSignal Support (Async Only)

Cancel async event emissions using the standard `AbortSignal` via `configure({ signal })` or `oncePromise` options.

```js
const emitter = new EventEmitter();
const controller = new AbortController();

emitter.on('task', async () => {
  await sleep(500);
  return 'done';
});

// emitAsync: pass signal via configure
setTimeout(() => controller.abort(), 200); // cancel after 200ms
try {
  await emitter.configure({ signal: controller.signal }).emitAsync('task');
} catch (err) {
  console.log(err.name); // 'AbortError'
}

// oncePromise: pass signal directly via options
const c2 = new AbortController();
setTimeout(() => c2.abort(), 100);
try {
  await oncePromise(emitter, 'ready', { signal: c2.signal });
} catch (err) {
  console.log(err.name); // 'AbortError'
}
```

**Behavior**:

- **Serial mode**: Checks `signal.aborted` before each listener, throws `AbortError` immediately when triggered.
- **Parallel mode**: Races listener execution against the signal via `Promise.race`. Throws `AbortError` when the signal wins.
- **pipeAsync**: In serial mode, checks the source's signal before forwarding to each pipe target; skips remaining targets if aborted.
- `Event` objects have a new `aborted` field (independent of `stopped`) to track cancellation state.

### Advanced Features

#### Async Concurrency Engine (For `emitAsync` Only)

| Option | Value | Description |
| :--- | :--- | :--- |
| **`asyncMode`** | `'serial'` | **(Default)** Listeners run one by one. Supports `this.stopped`. |
| | `'parallel'` | Listeners run concurrently. `this.stopped` is ignored. |
| **`resultMode`** | `'last'` | **(Default)** Returns the result of the last listener (or last to finish). |
| | `'first'` | Returns the first **non-undefined** and **successful** result. Skips errors. |
| | `'collect'` | Returns an array of all results in registration order. |
| **`signal`** | `AbortSignal` | An `AbortSignal` from an `AbortController` to cancel async event emission. Only passed via `configure()`, not stored on the instance. |

#### Proxy Isolation (Fluent API)

Calling `.parallel()` or `.configure()` returns a transient Proxy Object (`Object.create(this)`), allowing thread-safe, isolated configurations for specific emits.

#### Safe Injection (AoP Compatibility) & Name Collisions

When injecting event capabilities into an existing object or prototype via `wrapEventEmitter(target)` or `eventable(MyClass)`, a **minimal set** of methods is injected to minimize the risk of name collisions:

- `on`, `once`, `off`
- `emit`, `emitAsync`
- `setEmitterOptions`

⚠️ **Warning on Name Collisions**: If your target object already has methods with these names, they will be overwritten.

**Solution: Method Renaming**
You can use the `rename` option in `eventable` to map the emitter methods to custom names on your target:

```js
eventable(MyClass, {
  rename: {
    emitAsync: 'myEmitAsync',
    on: 'addListener'
  }
});
// Now use: inst.myEmitAsync('event')
```

**Full EventEmitter vs. Minimal Injection**

- **Standalone**: Calling `ee()` or `new EventEmitter()` without a target returns a **full instance** containing all advanced methods (including `.parallel()`, `.configure()`, `.setMaxListeners()`, etc.).
- **Injected**: Passing a target to `ee(target)` or using `eventable` performs a **minimal injection** to preserve the target's original footprint. Use `setEmitterOptions` on the target to access advanced async configurations.

---

### API

#### eventable(class[, options]) _(events-ex/eventable)_

Add the event-able ability to the class directly.

* `class`: the class to be injected the ability.
* `options` _(object)_: optional options
  * `include` _(string[]|string)_: only these emitter methods will be added to the class
  * `exclude` _(string[]|string)_: theses emitter methods would not be added to the class
  * `methods` _(object)_: hooked methods to the class
  * `emitterOptions` _(object)_: default options for the emitter (e.g., `asyncMode`, `resultMode`).
  * `rename` _(object)_: map the emitter methods to custom names on the class.
    * key: original method name (e.g., 'on', 'emitAsync').
    * value: new method name.

#### hasListeners(obj[, name]) _(events-ex/has-listeners)_

```javascript
import {hasListeners, wrapEventEmitter as ee} from 'events-ex';
var emitter = ee();
var listener = function () {};
hasListeners(emitter); // false
emitter.on('foo', listener);
hasListeners(emitter, 'foo'); // true
```

#### pipeAsync(source, target[, name, options]) _(events-ex/pipe-async)_

Creates an asynchronous pipeline.

- `options.asyncMode`: Propagation mode (`'serial' | 'parallel'`).
- `options.resultMode`: Aggregation strategy.

#### oncePromise(emitter, type[, options]) _(events-ex/once-promise)_

Returns a `Promise` that resolves with the **Event object** when the specified event is emitted on the given emitter.
If an `error` event is emitted (and the waiting event is not `error`), the promise rejects.
If the provided `AbortSignal` is aborted, the promise rejects with an `AbortError`.

- `emitter` _(EventEmitter)_: The event emitter to listen on.
- `type` _(string | RegExp)_: The event type to wait for. Supports regex for matching multiple events.
- `options` _(Object)_: Optional configuration.
  - `signal` _(AbortSignal)_: An AbortSignal to cancel the wait.
- Returns: `Promise<Event>` — resolves with the Event object, which provides `type`, `target`, etc.

> Note: The resolved Event object's `result` field may not be the final value if other listeners have not yet run. For the definitive emit return value, use `emit()` or `emitAsync()` directly.

```js
import {oncePromise, EventEmitter} from 'events-ex';

const ee = new EventEmitter();

// Wait for a data event
setTimeout(() => ee.emit('data', { id: 1 }), 100);
const evt = await oncePromise(ee, 'data');
console.log(evt.type);   // 'data'
console.log(evt.target); // the emitter

// Wait for a regex-matched event – evt.type reveals the actual event
setTimeout(() => ee.emit('user.login', { name: 'Alice' }), 100);
const evt2 = await oncePromise(ee, /^user\./);
console.log(evt2.type); // 'user.login' (not the regex)

// Error handling: rejects on error (unless waiting for 'error')
try {
  await oncePromise(ee, 'data');
} catch (err) {
  console.error('Error occurred:', err);
}

// Waiting for 'error' event resolves normally
ee.emit('error', new Error('expected'));
await oncePromise(ee, 'error'); // resolves, not rejects

// Use AbortSignal for timeout cancellation
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
try {
  const evt = await oncePromise(ee, 'response', { signal: controller.signal });
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('timed out or cancelled');
  }
}
```

#### setEmitterOptions(options)

Configures instance-wide defaults for `asyncMode`, `resultMode`, and `maxListeners`.

[event-emitter]: https://github.com/medikoo/event-emitter
[Ability]: https://github.com/snowyu/custom-ability.js
