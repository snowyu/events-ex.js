[events-ex](../README.md) / [Exports](../modules.md) / wrap-event-emitter

# Module: wrap-event-emitter

## Table of contents

### References

- [default](wrap_event_emitter.md#default)

### Variables

- [methods](wrap_event_emitter.md#methods)

### Functions

- [wrapEventEmitter](wrap_event_emitter.md#wrapeventemitter)

## References

### default

Renames and re-exports [wrapEventEmitter](wrap_event_emitter.md#wrapeventemitter)

## Variables

### methods

• `Const` **methods**: `any`

#### Defined in

[src/wrap-event-emitter.js:7](https://github.com/snowyu/events-ex.js/blob/888e944/src/wrap-event-emitter.js#L7)

## Functions

### wrapEventEmitter

▸ **wrapEventEmitter**(`o?`, `options?`): `any`

Create or inject the eventable instance into the object

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `o?` | `any` | the optional instance to eventable |
| `options?` | `any` | optional configuration for the emitter |

#### Returns

`any`

o or new Event instance

#### Defined in

[src/wrap-event-emitter.js:37](https://github.com/snowyu/events-ex.js/blob/888e944/src/wrap-event-emitter.js#L37)
