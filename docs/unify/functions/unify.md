[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [unify](../README.md) / unify

# Function: unify()

> **unify**(`e1`, `e2`): `void`

Defined in: [src/unify.js:17](https://github.com/snowyu/events-ex.js/blob/d26bdae527dff2296ff52d0d7b94d37c9f694683/src/unify.js#L17)

Unifies the event listeners of two event emitter objects so that they share the same set of listeners for each event.

## Parameters

### e1

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The first event emitter object.

### e2

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The second event emitter object.

## Returns

`void`

## Throws

- If either of the arguments is not an event emitter object.
