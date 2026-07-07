[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [pipe](../README.md) / pipe

# Function: pipe()

> **pipe**(`e1`, `e2`, ...`args`): `Object`

Defined in: [src/pipe.js:21](https://github.com/snowyu/events-ex.js/blob/4b0e5c2237202c2cc8b9e9244905d2c668799451/src/pipe.js#L21)

Creates a pipeline between two event emitters, so that any events emitted by the first emitter are also emitted by the second emitter.

## Parameters

### e1

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The first event emitter.

### e2

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The second event emitter.

### args

...`any`[]

## Returns

`Object`

- An object with a `close` method that removes the pipeline between the two event emitters.

## Throws

- If either of the arguments is not an event emitter object.
