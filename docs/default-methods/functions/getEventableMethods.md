[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [default-methods](../README.md) / getEventableMethods

# Function: getEventableMethods()

> **getEventableMethods**(`aClass`): `object`

Defined in: [src/default-methods.js:15](https://github.com/snowyu/events-ex.js/blob/fb077063a0ea7231fa89bf74a09be2f52f8401e4/src/default-methods.js#L15)

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

###### resultMode?

`string`

The strategy for handling multiple return values ('last', 'first', 'collect').

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

The event type to remove the listener from.

`string` | `RegExp`

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

The event type to listen for.

`string` | `RegExp`

##### listener

`Function`

The listener function to be called when the event is emitted.

##### index?

`number`

The index at which to insert the listener. If not specified, the listener will be added at the end of the listeners array.

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

The event type to listen for.

`string` | `RegExp`

##### listener

`Function`

The listener function to be called once when the event is emitted.

##### index?

`number`

The index at which to insert the listener. If not specified, the listener will be added at the end of the listeners array.

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

The event type to remove the listener from.

`string` | `RegExp`

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

`any`

Configuration options for the emitter (e.g., asyncMode, resultMode, maxListeners).

#### Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The EventEmitter instance for chaining.

### setMaxListeners()

> **setMaxListeners**(`n`): \{ configure(options: \{ asyncMode?: string; resultMode?: string; \}): EventEmitter; parallel(resultMode?: string): EventEmitter; setEmitterOptions(options: any): EventEmitter; ... 8 more ...; removeAllListeners(type: string \| RegExp): EventEmitter; \}

#### Parameters

##### n

`any`

#### Returns

\{ configure(options: \{ asyncMode?: string; resultMode?: string; \}): EventEmitter; parallel(resultMode?: string): EventEmitter; setEmitterOptions(options: any): EventEmitter; ... 8 more ...; removeAllListeners(type: string \| RegExp): EventEmitter; \}
