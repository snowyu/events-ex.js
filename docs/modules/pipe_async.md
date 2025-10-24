[events-ex](../README.md) / [Exports](../modules.md) / pipe-async

# Module: pipe-async

## Table of contents

### References

- [default](pipe_async.md#default)

### Functions

- [pipeAsync](pipe_async.md#pipeasync)

## References

### default

Renames and re-exports [pipeAsync](pipe_async.md#pipeasync)

## Functions

### pipeAsync

▸ **pipeAsync**(`e1`, `e2`, `...args`): `any`

Creates a pipeline between two event emitters, so that any events emitted by the first emitter are also emitted by the second emitter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `e1` | [`EventEmitter`](../classes/event_emitter.EventEmitter.md) | The first event emitter. |
| `e2` | [`EventEmitter`](../classes/event_emitter.EventEmitter.md) | The second event emitter. |
| `...args` | `any` | - |

#### Returns

`any`

- An object with a `close` method that removes the pipeline between the two event emitters.

**`Throws`**

- If either of the arguments is not an event emitter object.

#### Defined in

[src/pipe-async.js:21](https://github.com/snowyu/events-ex.js/blob/9c254b2/src/pipe-async.js#L21)
