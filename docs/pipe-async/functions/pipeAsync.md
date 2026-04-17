[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [pipe-async](../README.md) / pipeAsync

# Function: pipeAsync()

> **pipeAsync**(`e1`, `e2`, ...`args`): `any`

Defined in: [src/pipe-async.js:24](https://github.com/snowyu/events-ex.js/blob/f6c44157ffda17957fad5ad2e0aedbb8ec521be7/src/pipe-async.js#L24)

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

`any`

- An object with a `close` method that removes the pipeline between the two event emitters.

## Throws

- If either of the arguments is not an event emitter object.
