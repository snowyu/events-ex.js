[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [event](../README.md) / Event

# Class: Event

Defined in: [src/event.js:10](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L10)

Creates a new Event object instance that contains information about the event, such as the target element and the return value of the event.

## Classdesc

Event Object that contains information about the event, such as the target element and the return value of the event.

## Param

Who trigger the event

## Param

The event type name

## Param

The emission configuration options

## Constructors

### Constructor

> **new Event**(`target`, `type`, `opts?`): `Event`

Defined in: [src/event.js:10](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L10)

Creates a new Event object instance that contains information about the event, such as the target element and the return value of the event.

#### Parameters

##### target

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Who trigger the event

##### type

`string`

The event type name

##### opts?

`Object`

The emission configuration options

#### Returns

`Event`

- The new Event instance.

#### Classdesc

Event Object that contains information about the event, such as the target element and the return value of the event.

## Properties

### aborted

> **aborted**: `boolean` \| `undefined`

Defined in: [src/event.js:43](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L43)

Whether the event emission was aborted via AbortSignal.

***

### config

> **config**: `Readonly`\<`Object`\> \| `undefined`

Defined in: [src/event.js:72](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L72)

***

### resolved

> **resolved**: `boolean` \| `undefined`

Defined in: [src/event.js:49](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L49)

Whether a result has been resolved (for 'first' result mode)

***

### result

> **result**: `any`

Defined in: [src/event.js:55](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L55)

Keep your event result here if any.

***

### stopped

> **stopped**: `boolean` \| `undefined`

Defined in: [src/event.js:37](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L37)

Whether stop the bubbling event

***

### target

> **target**: `Object` \| `undefined`

Defined in: [src/event.js:31](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L31)

Who trigger the event

***

### type

> **type**: `string` \| `undefined`

Defined in: [src/event.js:61](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L61)

The type of the event.

## Methods

### end()

> **end**(): `any`

Defined in: [src/event.js:81](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L81)

Ends the event and returns the result.

#### Returns

`any`

The result of the event.

***

### init()

> **init**(`target`, `type`, `opts?`): `void`

Defined in: [src/event.js:25](https://github.com/snowyu/events-ex.js/blob/dfafa626c9ca8a0c4a512183ccc8e07750acda01/src/event.js#L25)

Initializes the event with the target object.

#### Parameters

##### target

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The target object for the event.

##### type

`string`

The event type name.

##### opts?

`Object`

The emission configuration options (asyncMode, resultMode, signal, raiseError, etc.).
  Stored as a frozen object on `this.config` for listener introspection.

#### Returns

`void`
