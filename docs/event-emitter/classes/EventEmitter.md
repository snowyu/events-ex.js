[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [event-emitter](../README.md) / EventEmitter

# Class: EventEmitter

Defined in: [src/event-emitter.d.ts:6](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L6)

Class that represents an event emitter.

## Constructors

### Constructor

> **new EventEmitter**(): `EventEmitter`

#### Returns

`EventEmitter`

## Properties

### defaultMaxListeners

> `static` **defaultMaxListeners**: `number`

Defined in: [src/event-emitter.d.ts:7](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L7)

## Methods

### emit()

> **emit**(`eventName`, ...`args`): `any`

Defined in: [src/event-emitter.d.ts:58](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L58)

Emits the specified event type with the given arguments.

#### Parameters

##### eventName

`string`

##### args

...`any`[]

The event type followed by any number of arguments to be passed to the listener functions.

#### Returns

`any`

The result of the event.

***

### emitAsync()

> **emitAsync**(`eventName`, ...`args`): `Promise`\<`any`\>

Defined in: [src/event-emitter.d.ts:64](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L64)

Asynchronously emits the specified event type with the given arguments.

#### Parameters

##### eventName

`string`

##### args

...`any`[]

The event type followed by any number of arguments to be passed to the listener functions.

#### Returns

`Promise`\<`any`\>

A promise that resolves with the result of the event.

***

### listenerCount()

> **listenerCount**(`eventName`): `number`

Defined in: [src/event-emitter.d.ts:93](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L93)

Returns the count of listeners that are registered to listen for the specified event.

#### Parameters

##### eventName

The name of the event to get the listeners for.

`string` | `RegExp`

#### Returns

`number`

- the listeners count

***

### listeners()

> **listeners**(`eventName`): `Function`[]

Defined in: [src/event-emitter.d.ts:86](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L86)

Returns an array of functions that are registered to listen for the specified event.

#### Parameters

##### eventName

The name of the event to get the listeners for.

`string` | `RegExp`

#### Returns

`Function`[]

- An array of functions that are registered to listen for the specified event.

***

### off()

> **off**(`eventName`, `listener`): `EventEmitter`

Defined in: [src/event-emitter.d.ts:43](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L43)

Removes a listener function from the specified event type.

#### Parameters

##### eventName

`string` | `RegExp`

##### listener

`Function`

The listener function to be removed.

#### Returns

`EventEmitter`

The EventEmitter instance to allow chaining.

#### Throws

If the listener is not a function.

#### See

[removeListener](#removelistener)

***

### on()

> **on**(`eventName`, `listener`, `index?`): `EventEmitter`

Defined in: [src/event-emitter.d.ts:21](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L21)

Adds a listener function to the specified event type.

#### Parameters

##### eventName

`string` | `RegExp`

##### listener

`Function`

The listener function to be called when the event is emitted.

##### index?

The index at which to insert the listener.
       - 'first' or -Infinity: adds to the beginning of the listeners (stay at the front).
       - 'last' or Infinity: adds to the end of the listeners (stay at the back).
       - number: inserts at the specified index within the normal listeners zone.
       If not specified, the listener will be added at the end of the normal listeners.

`number` | `"first"` | `"last"`

#### Returns

`EventEmitter`

The EventEmitter instance to allow chaining.

#### Throws

If the listener is not a function.

***

### once()

> **once**(`eventName`, `listener`, `index?`): `EventEmitter`

Defined in: [src/event-emitter.d.ts:34](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L34)

Adds a one-time listener function to the specified event type.

#### Parameters

##### eventName

`string` | `RegExp`

##### listener

`Function`

The listener function to be called once when the event is emitted.

##### index?

The index at which to insert the listener.
       - 'first' or -Infinity: adds to the beginning of the listeners (stay at the front).
       - 'last' or Infinity: adds to the end of the listeners (stay at the back).
       - number: inserts at the specified index within the normal listeners zone.
       If not specified, the listener will be added at the end of the normal listeners.

`number` | `"first"` | `"last"`

#### Returns

`EventEmitter`

The EventEmitter instance to allow chaining.

#### Throws

If the listener is not a function.

***

### removeAllListeners()

> **removeAllListeners**(`eventName?`): `EventEmitter`

Defined in: [src/event-emitter.d.ts:71](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L71)

Removes all listeners for a specific event or all events from an event emitter.

#### Parameters

##### eventName?

The event to remove listeners for. If not provided, all listeners for all events will be removed.

`string` | `RegExp`

#### Returns

`EventEmitter`

- The event emitter with all listeners removed.

***

### removeListener()

> **removeListener**(`eventName`, `listener`): `EventEmitter`

Defined in: [src/event-emitter.d.ts:52](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L52)

Removes a listener function from the specified event type.

#### Parameters

##### eventName

`string` | `RegExp`

##### listener

`Function`

The listener function to be removed.

#### Returns

`EventEmitter`

The EventEmitter instance to allow chaining.

#### Throws

If the listener is not a function.

#### See

[off](#off)

***

### setMaxListeners()

> **setMaxListeners**(`n`): `EventEmitter`

Defined in: [src/event-emitter.d.ts:79](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L79)

Sets the maximum number of listeners allowed for the event emitter.

#### Parameters

##### n

`number`

The maximum number of listeners to set. Must be a positive integer.

#### Returns

`EventEmitter`

The EventEmitter instance for method chaining.

#### Throws

If `n` is not a positive integer.

***

### ~~listenerCount()~~

> `static` **listenerCount**(`emitter`, `eventName`): `number`

Defined in: [src/event-emitter.d.ts:101](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/event-emitter.d.ts#L101)

Returns the count of listeners that are registered to listen for the specified event.

#### Parameters

##### emitter

`EventEmitter`

##### eventName

`string` | `RegExp`

#### Returns

`number`

#### Deprecated

use emitter.listenerCount instead
