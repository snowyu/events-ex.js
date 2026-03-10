[events-ex](../README.md) / [Exports](../modules.md) / [event](../modules/event.md) / Event

# Class: Event

[event](../modules/event.md).Event

## Table of contents

### Constructors

- [constructor](event.Event.md#constructor)

### Properties

- [resolved](event.Event.md#resolved)
- [result](event.Event.md#result)
- [stopped](event.Event.md#stopped)
- [target](event.Event.md#target)
- [type](event.Event.md#type)

### Methods

- [end](event.Event.md#end)
- [init](event.Event.md#init)

## Constructors

### constructor

• **new Event**(`target`, `type`): [`Event`](event.Event.md)

Creates a new Event object instance that contains information about the event, such as the target element and the return value of the event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`EventEmitter`](event_emitter.EventEmitter.md) | Who trigger the event |
| `type` | `any` | - |

#### Returns

[`Event`](event.Event.md)

- The new Event instance.

**`Classdesc`**

Event Object that contains information about the event, such as the target element and the return value of the event.

#### Defined in

[src/event.js:8](https://github.com/snowyu/events-ex.js/blob/888e944/src/event.js#L8)

## Properties

### resolved

• **resolved**: `boolean`

Whether a result has been resolved (for 'first' result mode)

#### Defined in

[src/event.js:38](https://github.com/snowyu/events-ex.js/blob/888e944/src/event.js#L38)

___

### result

• **result**: `any`

Keep your event result here if any.

#### Defined in

[src/event.js:44](https://github.com/snowyu/events-ex.js/blob/888e944/src/event.js#L44)

___

### stopped

• **stopped**: `boolean`

Whether stop the bubbling event

#### Defined in

[src/event.js:32](https://github.com/snowyu/events-ex.js/blob/888e944/src/event.js#L32)

___

### target

• **target**: `any`

Who trigger the event

#### Defined in

[src/event.js:26](https://github.com/snowyu/events-ex.js/blob/888e944/src/event.js#L26)

___

### type

• **type**: `string`

The type of the event.

#### Defined in

[src/event.js:50](https://github.com/snowyu/events-ex.js/blob/888e944/src/event.js#L50)

## Methods

### end

▸ **end**(): `any`

Ends the event and returns the result.

#### Returns

`any`

The result of the event.

#### Defined in

[src/event.js:57](https://github.com/snowyu/events-ex.js/blob/888e944/src/event.js#L57)

___

### init

▸ **init**(`target`, `type`): `void`

Initializes the event with the target object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`EventEmitter`](event_emitter.EventEmitter.md) | The target object for the event. |
| `type` | `any` | - |

#### Returns

`void`

#### Defined in

[src/event.js:20](https://github.com/snowyu/events-ex.js/blob/888e944/src/event.js#L20)
