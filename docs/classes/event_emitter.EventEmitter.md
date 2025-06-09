[events-ex](../README.md) / [Exports](../modules.md) / [event-emitter](../modules/event_emitter.md) / EventEmitter

# Class: EventEmitter

[event-emitter](../modules/event_emitter.md).EventEmitter

Class that represents an event emitter.

## Table of contents

### Constructors

- [constructor](event_emitter.EventEmitter.md#constructor)

### Properties

- [defaultMaxListeners](event_emitter.EventEmitter.md#defaultmaxlisteners)

### Methods

- [emit](event_emitter.EventEmitter.md#emit)
- [emitAsync](event_emitter.EventEmitter.md#emitasync)
- [listenerCount](event_emitter.EventEmitter.md#listenercount)
- [listeners](event_emitter.EventEmitter.md#listeners)
- [off](event_emitter.EventEmitter.md#off)
- [on](event_emitter.EventEmitter.md#on)
- [once](event_emitter.EventEmitter.md#once)
- [removeAllListeners](event_emitter.EventEmitter.md#removealllisteners)
- [setMaxListeners](event_emitter.EventEmitter.md#setmaxlisteners)
- [listenerCount](event_emitter.EventEmitter.md#listenercount-1)

## Constructors

### constructor

• **new EventEmitter**(): [`EventEmitter`](event_emitter.EventEmitter.md)

#### Returns

[`EventEmitter`](event_emitter.EventEmitter.md)

## Properties

### defaultMaxListeners

▪ `Static` **defaultMaxListeners**: `number`

#### Defined in

[src/event-emitter.d.ts:7](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L7)

## Methods

### emit

▸ **emit**(`eventName`, `...args`): `any`

Emits the specified event type with the given arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` | - |
| `...args` | `any`[] | The event type followed by any number of arguments to be passed to the listener functions. |

#### Returns

`any`

The result of the event.

#### Defined in

[src/event-emitter.d.ts:38](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L38)

___

### emitAsync

▸ **emitAsync**(`eventName`, `...args`): `Promise`\<`any`\>

Asynchronously emits the specified event type with the given arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` | - |
| `...args` | `any`[] | The event type followed by any number of arguments to be passed to the listener functions. |

#### Returns

`Promise`\<`any`\>

A promise that resolves with the result of the event.

#### Defined in

[src/event-emitter.d.ts:44](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L44)

___

### listenerCount

▸ **listenerCount**(`eventName`): `number`

Returns the count of listeners that are registered to listen for the specified event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `RegExp` | The name of the event to get the listeners for. |

#### Returns

`number`

- the listeners count

#### Defined in

[src/event-emitter.d.ts:66](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L66)

___

### listeners

▸ **listeners**(`eventName`): `Function`[]

Returns an array of functions that are registered to listen for the specified event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `RegExp` | The name of the event to get the listeners for. |

#### Returns

`Function`[]

- An array of functions that are registered to listen for the specified event.

#### Defined in

[src/event-emitter.d.ts:59](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L59)

___

### off

▸ **off**(`eventName`, `listener`): [`EventEmitter`](event_emitter.EventEmitter.md)

Removes a listener function from the specified event type.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `RegExp` | - |
| `listener` | `Function` | The listener function to be removed. |

#### Returns

[`EventEmitter`](event_emitter.EventEmitter.md)

The EventEmitter instance to allow chaining.

**`Throws`**

If the listener is not a function.

#### Defined in

[src/event-emitter.d.ts:32](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L32)

___

### on

▸ **on**(`eventName`, `listener`): [`EventEmitter`](event_emitter.EventEmitter.md)

Adds a listener function to the specified event type.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `RegExp` | - |
| `listener` | `Function` | The listener function to be called when the event is emitted. |

#### Returns

[`EventEmitter`](event_emitter.EventEmitter.md)

The EventEmitter instance to allow chaining.

**`Throws`**

If the listener is not a function.

#### Defined in

[src/event-emitter.d.ts:16](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L16)

___

### once

▸ **once**(`eventName`, `listener`): [`EventEmitter`](event_emitter.EventEmitter.md)

Adds a one-time listener function to the specified event type.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `RegExp` | - |
| `listener` | `Function` | The listener function to be called once when the event is emitted. |

#### Returns

[`EventEmitter`](event_emitter.EventEmitter.md)

The EventEmitter instance to allow chaining.

**`Throws`**

If the listener is not a function.

#### Defined in

[src/event-emitter.d.ts:24](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L24)

___

### removeAllListeners

▸ **removeAllListeners**(`eventName?`): [`EventEmitter`](event_emitter.EventEmitter.md)

Removes all listeners for a specific event or all events from an event emitter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName?` | `string` \| `RegExp` | The event to remove listeners for. If not provided, all listeners for all events will be removed. |

#### Returns

[`EventEmitter`](event_emitter.EventEmitter.md)

- The event emitter with all listeners removed.

#### Defined in

[src/event-emitter.d.ts:51](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L51)

___

### setMaxListeners

▸ **setMaxListeners**(`n`): [`EventEmitter`](event_emitter.EventEmitter.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `n` | `number` |

#### Returns

[`EventEmitter`](event_emitter.EventEmitter.md)

#### Defined in

[src/event-emitter.d.ts:52](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L52)

___

### listenerCount

▸ **listenerCount**(`emitter`, `eventName`): `number`

Returns the count of listeners that are registered to listen for the specified event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `emitter` | [`EventEmitter`](event_emitter.EventEmitter.md) |
| `eventName` | `string` \| `RegExp` |

#### Returns

`number`

**`Deprecated`**

use emitter.listenerCount instead

#### Defined in

[src/event-emitter.d.ts:74](https://github.com/snowyu/events-ex.js/blob/a6cce2d/src/event-emitter.d.ts#L74)
