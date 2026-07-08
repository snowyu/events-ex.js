[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [default-methods](../README.md) / getEventableMethods

# Function: getEventableMethods()

> **getEventableMethods**(`aClass`): `object`

Defined in: [src/default-methods.js:15](https://github.com/snowyu/events-ex.js/blob/bbf438be440e5a9f2be264532e8ba99ae44b6989/src/default-methods.js#L15)

## Parameters

### aClass

`any`

## Returns

### configure()

> **configure**(`options`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Configures the event emitter with specified options using a Fluent API.

#### Parameters

##### options

Configuration options for event emission.

###### asyncMode?

`string`

The mode of asynchronous emission ('serial' or 'parallel').

###### raiseError?

`boolean` \| `null`

Controls error handling behavior:
  - `true`: Always throw listener errors immediately.
  - `false`: Silently swallow listener errors.
  - `null`: Throw only for 'error' events with no error listeners (Node.js default).
  - `undefined` (default): Same as `false` for emitAsync.

###### resultMode?

`string`

The strategy for handling multiple return values ('last', 'first', 'collect').

###### signal?

`any`

An AbortSignal to cancel async event emission.

#### Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

A proxy object representing the configured EventEmitter.

### emit()

> **emit**(...`args`): `any`

Emits the specified event type with the given arguments.

#### Parameters

##### args

...`any`[]

The event type followed by any number of arguments to be passed to the listener functions.

#### Returns

`any`

The result of the event.

### emitAsync()

> **emitAsync**(...`args`): `Promise`\<`any`\>

Asynchronously emits the specified event type with the given arguments.

#### Parameters

##### args

...`any`[]

The event type followed by any number of arguments to be passed to the listener functions.

#### Returns

`Promise`\<`any`\>

A promise that resolves with the result of the event.

### listenerCount()

> **listenerCount**(`emitter`, `type`): `number`

#### Parameters

##### emitter

`any`

##### type

`any`

#### Returns

`number`

### listeners()

> **listeners**(`type`): `any`

#### Parameters

##### type

`any`

#### Returns

`any`

### off()

> **off**(`type`, `listener`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Removes a listener function from the specified event type.

#### Parameters

##### type

`string` \| `RegExp`

The event type to remove the listener from.

##### listener

`Function`

The listener function to be removed.

#### Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The EventEmitter instance to allow chaining.

#### Throws

If the listener is not a function.

### on()

> **on**(`type`, `listener`, `index?`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Adds a listener function to the specified event type.

#### Parameters

##### type

`string` \| `RegExp`

The event type to listen for.

##### listener

`Function`

The listener function to be called when the event is emitted.

##### index?

`number` \| `"first"` \| `"last"`

The index at which to insert the listener.
       - 'first' or -Infinity: Adds to the "Head" zone. The first listener added as 'first' is placed at the very front.
       - 'last' or Infinity: Adds to the "Tail" zone. The first listener added as 'last' will always be the very last one to execute.
       - number: Inserts at the specified index within the "Body" (normal) zone.
       If not specified, the listener is added to the end of the "Body" zone.

#### Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The EventEmitter instance to allow chaining.

#### Throws

If the listener is not a function.

### once()

> **once**(`type`, `listener`, `index?`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Adds a one-time listener function to the specified event type.

#### Parameters

##### type

`string` \| `RegExp`

The event type to listen for.

##### listener

`Function`

The listener function to be called once when the event is emitted.

##### index?

`number` \| `"first"` \| `"last"`

The index at which to insert the listener.
       - 'first' or -Infinity: Adds to the "Head" zone. The first listener added as 'first' is placed at the very front.
       - 'last' or Infinity: Adds to the "Tail" zone. The first listener added as 'last' will always be the very last one to execute.
       - number: Inserts at the specified index within the "Body" (normal) zone.
       If not specified, the listener is added to the end of the "Body" zone.

#### Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The EventEmitter instance to allow chaining.

#### Throws

If the listener is not a function.

### parallel()

> **parallel**(`resultMode?`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

A shortcut for parallel configuration.

#### Parameters

##### resultMode?

`string`

The strategy for handling multiple return values.

#### Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

A proxy object representing the configured EventEmitter.

### removeAllListeners()

> **removeAllListeners**(`type`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Removes all listener functions from the specified event type.

#### Parameters

##### type

`string` \| `RegExp`

The event type to remove the listener from.

#### Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The EventEmitter instance to allow chaining.

#### Throws

If the listener is not a function.

### setEmitterOptions()

> **setEmitterOptions**(`options`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Sets the configuration options for the EventEmitter instance.

#### Parameters

##### options

`Object`

Configuration options for the emitter (e.g., asyncMode, resultMode, maxListeners, raiseError).

#### Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The EventEmitter instance for chaining.

### setMaxListeners()

> **setMaxListeners**(`n`): \{ configure(options: \{ asyncMode?: string \| undefined; resultMode?: string \| undefined; signal?: any; raiseError?: boolean \| null \| undefined; \}): EventEmitter; parallel(resultMode?: string \| undefined): EventEmitter; ... 9 more ...; removeAllListeners(type: string \| RegExp): EventEmitter; \}

#### Parameters

##### n

`any`

#### Returns

\{ configure(options: \{ asyncMode?: string \| undefined; resultMode?: string \| undefined; signal?: any; raiseError?: boolean \| null \| undefined; \}): EventEmitter; parallel(resultMode?: string \| undefined): EventEmitter; ... 9 more ...; removeAllListeners(type: string \| RegExp): EventEmitter; \}
