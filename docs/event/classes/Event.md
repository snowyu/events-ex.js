[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [event](../README.md) / Event

# Class: Event

Defined in: [src/event.js:8](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L8)

Creates a new Event object instance that contains information about the event, such as the target element and the return value of the event.

## Classdesc

Event Object that contains information about the event, such as the target element and the return value of the event.

## Param

Who trigger the event

## Constructors

### Constructor

> **new Event**(`target`, `type`): `Event`

Defined in: [src/event.js:8](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L8)

Creates a new Event object instance that contains information about the event, such as the target element and the return value of the event.

#### Parameters

##### target

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Who trigger the event

##### type

`any`

#### Returns

`Event`

- The new Event instance.

#### Classdesc

Event Object that contains information about the event, such as the target element and the return value of the event.

## Properties

### aborted

> **aborted**: `boolean` \| `undefined`

Defined in: [src/event.js:38](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L38)

Whether the event emission was aborted via AbortSignal.

***

### resolved

> **resolved**: `boolean` \| `undefined`

Defined in: [src/event.js:44](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L44)

Whether a result has been resolved (for 'first' result mode)

***

### result

> **result**: `any`

Defined in: [src/event.js:50](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L50)

Keep your event result here if any.

***

### stopped

> **stopped**: `boolean` \| `undefined`

Defined in: [src/event.js:32](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L32)

Whether stop the bubbling event

***

### target

> **target**: `Object` \| `undefined`

Defined in: [src/event.js:26](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L26)

Who trigger the event

***

### type

> **type**: `string` \| `undefined`

Defined in: [src/event.js:56](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L56)

The type of the event.

## Methods

### end()

> **end**(): `any`

Defined in: [src/event.js:63](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L63)

Ends the event and returns the result.

#### Returns

`any`

The result of the event.

***

### init()

> **init**(`target`, `type`): `void`

Defined in: [src/event.js:20](https://github.com/snowyu/events-ex.js/blob/d89c80cf382abdccb9c4850d2bd1f0f83664a6cd/src/event.js#L20)

Initializes the event with the target object.

#### Parameters

##### target

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The target object for the event.

##### type

`any`

#### Returns

`void`
