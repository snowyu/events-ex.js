### events-ex [![npm](https://img.shields.io/npm/v/events-ex.svg)](https://npmjs.org/package/events-ex) [![downloads](https://img.shields.io/npm/dm/events-ex.svg)](https://npmjs.org/package/events-ex) [![license](https://img.shields.io/npm/l/events-ex.svg)](https://npmjs.org/package/events-ex)

Browser-friendly enhanced event emitter [ability][Ability] and class. It's modified from [event-emitter][event-emitter] mainly. It can add/inject the event-able [ability][Ability] to your any class.

### Features

* Rewrite of the core architecture for improved performance and more powerful event-able ability
* keep most compatible with [node events](nodejs.org/api/events.html) and [event-emitter][event-emitter]
* Supports bubbling and interruption
  * Hook-able event system for more control over event handling
* Supports async event emitting via `emitAsync` method which will wait for all async listeners to complete before returning.
* Subscribe events with regular expression

### Differences

* Difference with [node events](https://nodejs.org/api/events.html)
  + **`broken change`**: The event supports bubbling and interruption
    + the `event object` as listener's "this" object:
      * `result`: If set, the result is returned to the `Event Emitter`.
      * `stopped`: If set to `true`, it prevents the remaining listeners from being executed.
      * `target`: The `Event Emitter` object, which was originally the `this` object.
      * `type`: triggered event type(name).
    * **`broken change`**: The `emit` return the result of listeners's callback function instead of the successful state.
    * **`broken change`**: The `this` object of listeners' callback function is the `Event` Object instead of the emitter object.
      * The emitter object is put into the `target` property of the `Event` Object.
  * Adds async event emitting via `emitAsync` method.
  * ⚡ Added `emitAsync` Method:
    * Ensures all async listeners complete before returning results.
    * Ideal for scenarios requiring sequential async tasks (e.g., data validation, plugin systems).
  * Listener APIs: `on/once(event: string|RegExp, listener, index?: number)`
    * 📌 **Index Parameter** (Optional):
      * Allows specifying the insertion position in the listener array.
      * Useful for precise control over listener execution order (e.g., pre-interception logic).
    * 🧪 **Regex Event Matching**:
      * Listeners can bind to multiple events via regex patterns.
      * Great for handling events with naming patterns (e.g., logs, state changes).
* Difference with [event-emitter](https://github.com/medikoo/event-emitter)
  + **`broken change`**: The event supports bubbling and interruption(see above)
  + Adds the defaultMaxListeners class property to keep compatibility with node events.
  + Adds the setMaxListeners method to keep compatible with node events.
  + Adds `error`, `newListener` and `removeListener` events to keep compatibility with node events.
  + Adds listeners() method to keep compatibility with node events.
  + Adds listenerCount() class method to keep compatibility with node events.
  * Adds async event emitting via `emitAsync` method.
* 🔗 **Event Piping & Unification**:
  * `pipe(source, target)`: Forwards events from one emitter to another.
  * `unify(emitter1, emitter2)`: Bi-directional event synchronization (e.g., shared state management).
* 📦 **Utility Functions**:
  * Includes `allOff()`, `hasListeners()`, `listenerCount()` for debugging and lifecycle management.
  * Enhances robustness in event-driven architectures.
* 🔌 **Modular Ability Injection**:
  * `eventable(MyClass)`: Inject event capabilities into any class without inheritance.
  * Configurable inclusion/exclusion of methods to avoid prototype pollution.

Note: The listener throw error should not broke the notification, but it will emit error(`emit('error', error, 'notify', eventName, listener, args)`) after notification.

### Installation

```bash
npm install events-ex
```

### Usage

Extends from `EventEmitter` class:

```js
import {EventEmitter} from 'events-ex';

class MyClass extends EventEmitter {}
```

Add/Inject the event-able [ability][Ability] to your class directly:

```js
import {eventable} from 'events-ex';

class MyClass extends MyRoot {}

// inject the eventable ability to MyClass
eventable(MyClass);
```

Now, you can use events in your class:

```js
const my = new MyClass;

my.on('event', function() {
  console.log('event occur');
});

my.on(/^event/, function() {
  console.log('regexp match multi events');
});


my.emit('event');
my.emit('event1');
```

Bubbling event usage:

```js
import {EventEmitter, states} from 'events-ex';
import {isObject} from 'util-ex';

states.ABORT = -1
class MyDb extends EventEmitter {
  get(key) {
    // Demo the event object bubbling usage:
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
  result = myGet(key);
  if (result != null) {
    // get the key succ
    this.result = {
      state: states.DONE,
      result: result,
    }
    this.stopped = true // it will skip other listeners if true
  } else {
    // you can abort to get key by default.
    this.result = {state: states.ABORT};
    // this.stopped = true // it will skip other listeners if true
  }
})
```

event-emitter usage:

```javascript

import {wrapEventEmitter as ee} from 'events-ex';

class MyClass { /* .. */ };
ee(MyClass.prototype); // All instances of MyClass will expose event-emitter interface

const emitter = new MyClass();
let listener;

emitter.on('test', listener = function (args) {
  // … react to 'test' event
});

emitter.once('test', function (args) {
  // … react to first 'test' event (invoked only once!)
});

emitter.emit('test', arg1, arg2/*…args*/); // Two above listeners invoked
emitter.emit('test', arg1, arg2/*…args*/); // Only first listener invoked

emitter.off('test', listener);              // Removed first listener
emitter.emit('test', arg1, arg2/*…args*/); // No listeners invoked
```

### API

#### eventable(class[, options]) _(events-ex/eventable)_

Add the event-able ability to the class directly.

* `class`: the class to be injected the ability.
* `options` *(object)*: optional options
  * `include` *(string[]|string)*: only these emitter methods will be added to the class
    * **NOTE:** static method should use the prefix '@' with name.
  * `exclude` *(string[]|string)*: theses emitter methods would not be added to the class
    * **NOTE:** static method should use the prefix '@' with name.
  * `methods` *(object)*: hooked methods to the class
    * key: the method name to hook.
    * value: the new method function
      * use `this.super()` to call the original method.
      * `this.self` is the original `this` object.
  * `classMethods` *(object)*: hooked class methods to the class

```js
  import {eventable} from 'events-ex'

  class OtherClass {
    exec() {console.log "my original exec"}
  }

  class MyClass {}
    // only 'on', 'off', 'emit', 'emitAsync' and static methods 'listenerCount' added to the class
  eventable(MyClass, include: ['on', 'off', 'emit', 'emitAsync', '@listenerCount'])

  // add the eventable ability to OtherClass and inject the exec method of OtherClass.
  eventable(OtherClass, {methods: {
    exec() {
      console.log("new exec")
      this.super() //call the original method
    }}
  })
```

#### allOff(obj) _(events-ex/all-off)_

**keep compatible only**: the `removeAllListeners` has already been buildin.

Removes all listeners from given event emitter object

#### hasListeners(obj[, name]) _(events-ex/has-listeners)_

Whether object has some listeners attached to the object.
When `name` is provided, it checks listeners for specific event name

```javascript
import {hasListeners, wrapEventEmitter as ee} from 'events-ex/has-listeners';
var emitter = ee();
var listener = function () {};

hasListeners(emitter); // false

emitter.on('foo', listener);
hasListeners(emitter); // true
hasListeners(emitter, 'foo'); // true
hasListeners(emitter, 'bar'); // false

emitter.off('foo', listener);
hasListeners(emitter, 'foo'); // false
```

#### pipe(source, target[, emitMethodName]) _(events-ex/pipe)_

Pipes all events from _source_ emitter onto _target_ emitter (all events from _source_ emitter will be emitted also on _target_ emitter, but not other way).
Returns _pipe_ object which exposes `pipe.close` function. Invoke it to close configured _pipe_.
It works internally by redefinition of `emit` method, if in your interface this method is referenced differently, provide its name (or symbol) with third argument.

#### unify(emitter1, emitter2) _(events-ex/unify)_

Unifies event handling for two objects. Events emitted on _emitter1_ would be also emitter on _emitter2_, and other way back.
Non reversible.

```javascript
import {unify as eeUnify, wrapEventEmitter as ee} from 'events-ex';

var emitter1 = ee(), listener1, listener3;
var emitter2 = ee(), listener2, listener4;

emitter1.on('test', listener1 = function () { });
emitter2.on('test', listener2 = function () { });

emitter1.emit('test'); // Invoked listener1
emitter2.emit('test'); // Invoked listener2

var unify = eeUnify(emitter1, emitter2);

emitter1.emit('test'); // Invoked listener1 and listener2
emitter2.emit('test'); // Invoked listener1 and listener2

emitter1.on('test', listener3 = function () { });
emitter2.on('test', listener4 = function () { });

emitter1.emit('test'); // Invoked listener1, listener2, listener3 and listener4
emitter2.emit('test'); // Invoked listener1, listener2, listener3 and listener4
```


[event-emitter]: https://github.com/medikoo/event-emitter
[Ability]: https://github.com/snowyu/custom-ability.js
